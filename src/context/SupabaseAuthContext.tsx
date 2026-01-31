// =============================================================================
// NR1 Pro - Supabase Auth Context
// Contexto de Autenticação usando Supabase Auth
// =============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, type Tables } from '@/lib/supabase';
import { toast } from 'sonner';

// =============================================================================
// TIPOS
// =============================================================================

interface Perfil extends Tables<'perfis'> {}

interface EmpresaVinculada {
  id: string;
  empresa_id: string;
  perfil: 'admin' | 'gestor' | 'usuario' | 'auditor';
  departamento: string | null;
  matricula: string | null;
  is_principal: boolean;
  empresa: {
    id: string;
    nome_fantasia: string;
    razao_social: string | null;
    cnpj: string | null;
    logo_url: string | null;
    plano: string;
    status: string;
  };
}

interface AuthContextType {
  // Estados
  user: User | null;
  perfil: Perfil | null;
  session: Session | null;
  empresas: EmpresaVinculada[];
  empresaSelecionada: EmpresaVinculada | null;
  
  // Loading states
  isLoading: boolean;
  isInitializing: boolean;
  
  // Autenticação
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  
  // Perfil
  updatePerfil: (data: Partial<Perfil>) => Promise<boolean>;
  updateAvatar: (file: File) => Promise<string | null>;
  
  // Empresa
  selecionarEmpresa: (empresaId: string) => void;
  
  // Permissões
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  isGestor: () => boolean;
  
  // Utilidades
  refreshSession: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  nome: string;
  sobrenome?: string;
  telefone?: string;
  cargo?: string;
}

// =============================================================================
// CONTEXT
// =============================================================================

const SupabaseAuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// PROVIDER
// =============================================================================

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  // Estados
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaVinculada[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<EmpresaVinculada | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const initRef = useRef(false);

  // =============================================================================
  // INICIALIZAÇÃO
  // =============================================================================

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeAuth = async () => {
      try {
        // Verificar sessão existente
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await carregarDadosUsuario(currentSession.user.id);
        }
      } catch (error) {
        console.error('[Auth] Erro na inicialização:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();

    // Subscrever mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('[Auth] Evento:', event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await carregarDadosUsuario(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          limparEstado();
        } else if (event === 'TOKEN_REFRESHED') {
          // Token atualizado automaticamente
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // =============================================================================
  // FUNÇÕES AUXILIARES
  // =============================================================================

  const carregarDadosUsuario = async (userId: string) => {
    try {
      // Carregar perfil
      const { data: perfilData, error: perfilError } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .single();

      if (perfilError) throw perfilError;
      setPerfil(perfilData);

      // Carregar empresas vinculadas
      const { data: empresasData, error: empresasError } = await supabase
        .from('usuarios_empresas')
        .select(`
          id,
          empresa_id,
          perfil,
          departamento,
          matricula,
          is_principal,
          empresa:empresas (
            id,
            nome_fantasia,
            razao_social,
            cnpj,
            logo_url,
            plano,
            status
          )
        `)
        .eq('usuario_id', userId);

      if (empresasError) throw empresasError;

      const empresasFormatadas = empresasData?.map((item: any) => ({
        ...item,
        empresa: Array.isArray(item.empresa) ? item.empresa[0] : item.empresa,
      })) || [];

      setEmpresas(empresasFormatadas);

      // Selecionar empresa principal ou primeira
      const principal = empresasFormatadas.find((e: EmpresaVinculada) => e.is_principal);
      const primeira = empresasFormatadas[0];
      setEmpresaSelecionada(principal || primeira || null);

      // Atualizar último acesso
      const updateData: { ultimo_acesso: string } = { ultimo_acesso: new Date().toISOString() };
      await supabase
        .from('perfis')
        .update(updateData as never)
        .eq('id', userId);

    } catch (error) {
      console.error('[Auth] Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do usuário');
    }
  };

  const limparEstado = () => {
    setUser(null);
    setPerfil(null);
    setSession(null);
    setEmpresas([]);
    setEmpresaSelecionada(null);
  };

  // =============================================================================
  // AUTENTICAÇÃO
  // =============================================================================

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Email não confirmado. Verifique sua caixa de entrada.');
        } else {
          toast.error(error.message);
        }
        return false;
      }

      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      console.error('[Auth] Erro no login:', error);
      toast.error('Erro ao realizar login');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            sobrenome: data.sobrenome,
            telefone: data.telefone,
            cargo: data.cargo,
            perfil: 'admin', // Primeiro usuário é admin
          },
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error(error.message);
        }
        return false;
      }

      if (authData.user?.identities?.length === 0) {
        toast.error('Este email já está cadastrado');
        return false;
      }

      toast.success('Cadastro realizado! Verifique seu email para confirmar.');
      return true;
    } catch (error) {
      console.error('[Auth] Erro no cadastro:', error);
      toast.error('Erro ao realizar cadastro');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      limparEstado();
      toast.success('Logout realizado com sucesso');
    } catch (error) {
      console.error('[Auth] Erro no logout:', error);
      toast.error('Erro ao realizar logout');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // =============================================================================
  // PERFIL
  // =============================================================================

  const updatePerfil = useCallback(async (data: Partial<Perfil>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('perfis')
        .update(data as never)
        .eq('id', user.id);

      if (error) throw error;

      setPerfil(prev => prev ? { ...prev, ...data } : null);
      toast.success('Perfil atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('[Auth] Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateAvatar = useCallback(async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      await updatePerfil({ avatar_url: publicUrl });

      return publicUrl;
    } catch (error) {
      console.error('[Auth] Erro ao atualizar avatar:', error);
      toast.error('Erro ao atualizar foto de perfil');
      return null;
    }
  }, [user, updatePerfil]);

  // =============================================================================
  // EMPRESA
  // =============================================================================

  const selecionarEmpresa = useCallback((empresaId: string) => {
    const empresa = empresas.find(e => e.empresa_id === empresaId);
    if (empresa) {
      setEmpresaSelecionada(empresa);
    }
  }, [empresas]);

  // =============================================================================
  // PERMISSÕES
  // =============================================================================

  const hasPermission = useCallback((permission: string): boolean => {
    if (!perfil) return false;
    
    const permissoesPorPerfil: Record<string, string[]> = {
      admin: ['*'],
      gestor: ['funcionarios.*', 'asos.*', 'exames.*', 'acidentes.*', 'relatorios.*'],
      usuario: ['funcionarios.view', 'asos.view', 'exames.view'],
      auditor: ['*'],
    };

    const permissoes = permissoesPorPerfil[perfil.perfil] || [];
    return permissoes.includes('*') || permissoes.includes(permission);
  }, [perfil]);

  const hasRole = useCallback((roles: string[]): boolean => {
    if (!perfil) return false;
    return roles.includes(perfil.perfil);
  }, [perfil]);

  const isAdmin = useCallback((): boolean => {
    return perfil?.perfil === 'admin';
  }, [perfil]);

  const isGestor = useCallback((): boolean => {
    return perfil?.perfil === 'gestor' || perfil?.perfil === 'admin';
  }, [perfil]);

  // =============================================================================
  // UTILIDADES
  // =============================================================================

  const refreshSession = useCallback(async (): Promise<void> => {
    const { data: { session: newSession } } = await supabase.auth.getSession();
    setSession(newSession);
    setUser(newSession?.user ?? null);
  }, []);

  // =============================================================================
  // VALUE
  // =============================================================================

  const value: AuthContextType = {
    user,
    perfil,
    session,
    empresas,
    empresaSelecionada,
    isLoading,
    isInitializing,
    login,
    register,
    logout,
    updatePerfil,
    updateAvatar,
    selecionarEmpresa,
    hasPermission,
    hasRole,
    isAdmin,
    isGestor,
    refreshSession,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

// =============================================================================
// HOOK
// =============================================================================

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth deve ser usado dentro de SupabaseAuthProvider');
  }
  return context;
}

export default SupabaseAuthContext;
