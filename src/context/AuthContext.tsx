import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { authService, type RegisterData, type JWTPayload } from '@/services/authService';
import { toast } from 'sonner';

// ============================================
// TIPOS
// ============================================

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'gestor' | 'operador' | 'visualizador';
  permissoes: string[];
  ultimoAcesso?: string;
  ativo: boolean;
  mfaEnabled?: boolean;
}

interface AuthContextType {
  // Estado
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  requiresMFA: boolean;
  pendingEmail: string | null;
  
  // Ações
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  verifyMFA: (code: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: (allDevices?: boolean) => void;
  refreshSession: () => Promise<boolean>;
  
  // Permissões
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string[]) => boolean;
  
  // MFA
  setupMFA: () => Promise<{ success: boolean; qrCode?: string; secret?: string; backupCodes?: string[] }>;
  enableMFA: (code: string) => Promise<boolean>;
  disableMFA: (code: string) => Promise<boolean>;
  
  // Sessões
  getActiveSessions: () => Promise<any[]>;
  revokeSession: (sessionId: string) => Promise<boolean>;
}

// ============================================
// CONSTANTES
// ============================================

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos de inatividade
const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // Verificar token a cada 10 minutos

// ============================================
// UTILITÁRIOS
// ============================================

/**
 * Decodifica JWT para obter payload
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1]));
  } catch {
    return null;
  }
}

/**
 * Converte payload JWT para objeto Usuario
 */
function payloadToUsuario(payload: JWTPayload): Usuario {
  return {
    id: payload.sub,
    nome: payload.nome,
    email: payload.email,
    perfil: payload.perfil as Usuario['perfil'],
    permissoes: payload.permissoes,
    ativo: true,
  };
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [requiresMFA, setRequiresMFA] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  
  // Refs
  const lastActivityRef = useRef<number>(Date.now());
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rememberMeRef = useRef<boolean>(false);

  // ============================================
  // INICIALIZAÇÃO
  // ============================================
  
  useEffect(() => {
    const initializeAuth = async () => {
      await authService.initialize();
      
      const token = await authService.getValidAccessToken();
      
      if (token) {
        const payload = decodeJWT(token);
        if (payload) {
          setUsuario(payloadToUsuario(payload));
          lastActivityRef.current = Date.now();
          startSessionMonitoring();
        }
      }
      
      setIsInitializing(false);
    };
    
    initializeAuth();
    
    return () => {
      stopSessionMonitoring();
    };
  }, []);

  // ============================================
  // MONITORAMENTO DE SESSÃO
  // ============================================
  
  const startSessionMonitoring = () => {
    // Monitorar atividade do usuário
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      
      // Resetar timeout de inatividade
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      
      activityTimeoutRef.current = setTimeout(() => {
        toast.warning('Sessão expirada por inatividade');
        logout();
      }, SESSION_TIMEOUT);
    };
    
    activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity);
    });
    
    // Iniciar timeout inicial
    updateActivity();
    
    // Refresh automático de token
    refreshIntervalRef.current = setInterval(async () => {
      const token = authService.getAccessToken();
      if (token) {
        const payload = decodeJWT(token);
        if (payload) {
          // Refresh 2 minutos antes de expirar
          const expiresIn = payload.exp * 1000 - Date.now();
          if (expiresIn < 2 * 60 * 1000) {
            await refreshSession();
          }
        }
      }
    }, TOKEN_REFRESH_INTERVAL);
  };
  
  const stopSessionMonitoring = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
  };

  // ============================================
  // AÇÕES DE AUTENTICAÇÃO
  // ============================================
  
  const login = useCallback(async (
    email: string, 
    password: string, 
    rememberMe: boolean = false
  ): Promise<boolean> => {
    setIsLoading(true);
    rememberMeRef.current = rememberMe;
    
    try {
      const result = await authService.login({
        email,
        password,
        rememberMe,
      });
      
      if (result.requiresMFA) {
        setRequiresMFA(true);
        setPendingEmail(email);
        toast.info('Digite o código de verificação de dois fatores');
        return false;
      }
      
      if (result.success && result.tokens) {
        const payload = decodeJWT(result.tokens.accessToken);
        if (payload) {
          setUsuario(payloadToUsuario(payload));
          setRequiresMFA(false);
          setPendingEmail(null);
          lastActivityRef.current = Date.now();
          startSessionMonitoring();
          toast.success(`Bem-vindo, ${payload.nome}!`);
          return true;
        }
      }
      
      if (result.error) {
        toast.error(result.error);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyMFA = useCallback(async (code: string): Promise<boolean> => {
    if (!pendingEmail) return false;
    
    setIsLoading(true);
    
    try {
      // Buscar senha temporária (em produção, usar estado seguro)
      const result = await authService.login({
        email: pendingEmail,
        password: '', // Seria recuperada de estado seguro
        mfaCode: code,
        rememberMe: rememberMeRef.current,
      });
      
      if (result.success && result.tokens) {
        const payload = decodeJWT(result.tokens.accessToken);
        if (payload) {
          setUsuario(payloadToUsuario(payload));
          setRequiresMFA(false);
          setPendingEmail(null);
          lastActivityRef.current = Date.now();
          startSessionMonitoring();
          toast.success(`Bem-vindo, ${payload.nome}!`);
          return true;
        }
      }
      
      toast.error('Código de verificação inválido');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [pendingEmail]);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const result = await authService.register(data);
      
      if (result.success && result.tokens) {
        const payload = decodeJWT(result.tokens.accessToken);
        if (payload) {
          setUsuario(payloadToUsuario(payload));
          lastActivityRef.current = Date.now();
          startSessionMonitoring();
          toast.success('Conta criada com sucesso!');
          return true;
        }
      }
      
      if (result.error) {
        toast.error(result.error);
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback((allDevices: boolean = false) => {
    stopSessionMonitoring();
    authService.logout(allDevices);
    setUsuario(null);
    setRequiresMFA(false);
    setPendingEmail(null);
    
    if (allDevices) {
      toast.info('Você saiu de todos os dispositivos');
    } else {
      toast.info('Você saiu do sistema');
    }
  }, []);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const result = await authService.refreshToken();
    
    if (result.success && result.tokens) {
      const payload = decodeJWT(result.tokens.accessToken);
      if (payload) {
        setUsuario(payloadToUsuario(payload));
        return true;
      }
    }
    
    // Se refresh falhou, fazer logout
    logout();
    return false;
  }, [logout]);

  // ============================================
  // PERMISSÕES
  // ============================================
  
  const hasPermission = useCallback((permission: string): boolean => {
    if (!usuario) return false;
    if (usuario.perfil === 'admin') return true;
    if (usuario.permissoes.includes('*')) return true;
    return usuario.permissoes.includes(permission);
  }, [usuario]);

  const hasRole = useCallback((roles: string[]): boolean => {
    if (!usuario) return false;
    return roles.includes(usuario.perfil);
  }, [usuario]);

  // ============================================
  // MFA
  // ============================================
  
  const setupMFA = useCallback(async (): Promise<{ 
    success: boolean; 
    qrCode?: string; 
    secret?: string; 
    backupCodes?: string[] 
  }> => {
    const result = await authService.setupMFA();
    
    if (result.success && result.secret) {
      return {
        success: true,
        qrCode: result.secret.qrCode,
        secret: result.secret.secret,
        backupCodes: result.secret.backupCodes,
      };
    }
    
    return { success: false };
  }, []);

  const enableMFA = useCallback(async (code: string): Promise<boolean> => {
    const result = await authService.enableMFA(code);
    
    if (result.success) {
      setUsuario(prev => prev ? { ...prev, mfaEnabled: true } : null);
      toast.success('Autenticação de dois fatores ativada!');
      return true;
    }
    
    toast.error(result.error || 'Código inválido');
    return false;
  }, []);

  const disableMFA = useCallback(async (_code: string): Promise<boolean> => {
    // Simulação - em produção, chamar API
    toast.info('Funcionalidade em desenvolvimento');
    return false;
  }, []);

  // ============================================
  // SESSÕES
  // ============================================
  
  const getActiveSessions = useCallback(async (): Promise<any[]> => {
    return await authService.getActiveSessions();
  }, []);

  const revokeSession = useCallback(async (sessionId: string): Promise<boolean> => {
    return await authService.revokeSession(sessionId);
  }, []);

  // ============================================
  // PROVIDER VALUE
  // ============================================
  
  const value: AuthContextType = {
    usuario,
    isAuthenticated: !!usuario,
    isLoading,
    isInitializing,
    requiresMFA,
    pendingEmail,
    login,
    verifyMFA,
    register,
    logout,
    refreshSession,
    hasPermission,
    hasRole,
    setupMFA,
    enableMFA,
    disableMFA,
    getActiveSessions,
    revokeSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;
