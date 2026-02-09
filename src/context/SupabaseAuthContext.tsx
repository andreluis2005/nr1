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

interface Perfil extends Tables<'perfis'> { }

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
    empresa_pai_id?: string | null;
    b_verificada: boolean;
    cnae: string | null;
    logradouro: string | null;
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
  criarEmpresa: (dados: { nome: string; cnpj?: string; b_verificada?: boolean }) => Promise<EmpresaVinculada | null>;
  atualizarEmpresa: (empresaId: string, dados: { nome?: string; cnpj?: string; b_verificada?: boolean }) => Promise<boolean>;

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
  empresa_nome?: string;
  empresa_cnpj?: string;
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
          await carregarDadosUsuario(currentSession.user.id, currentSession.user);
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
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await carregarDadosUsuario(newSession.user.id, newSession.user);
        } else if (event === 'SIGNED_OUT') {
          limparEstado();
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

  const carregarDadosUsuario = useCallback(async (userId: string, currentUser?: User) => {
    try {
      // 0. Obter usuário mais recente para metadados se necessário
      let userForMetadata = currentUser || user;

      console.log('[Auth] Carregando dados para usuário:', userId);
      console.log('[Auth] Metadados atuais:', userForMetadata?.user_metadata);

      // Se temos um usuário mas faltam metadados essenciais, tentar buscar dados frescos do servidor
      if (userId && (!userForMetadata?.user_metadata || !userForMetadata.user_metadata.empresa_nome)) {
        console.log('[Auth] Metadados incompletos, buscando do servidor...');
        const { data: { user: freshUser }, error: userError } = await supabase.auth.getUser();
        if (freshUser) {
          userForMetadata = freshUser;
          setUser(freshUser); // Atualizar estado global com dados frescos
          console.log('[Auth] Dados frescos obtidos:', freshUser.user_metadata);
        } else if (userError) {
          console.error('[Auth] Erro ao buscar dados frescos do usuário:', userError);
        }
      }

      // Carregar perfil - com fallback se falhar (erro 500 ou RLS)
      try {
        const { data: perfilData, error: perfilError } = await supabase
          .from('perfis')
          .select('*')
          .eq('id', userId)
          .single();

        if (perfilError) {
          console.warn('[Auth] Perfil não encontrado ou erro de acesso:', perfilError);
          // Fallback para perfil básico usando os dados da sessão
          setPerfil({
            id: userId,
            nome: userForMetadata?.user_metadata?.nome || userForMetadata?.email?.split('@')[0] || 'Usuário',
            email: userForMetadata?.email || '',
            perfil: 'visualizador',
            ativo: true,
            permissoes: []
          } as any);
        } else {
          setPerfil(perfilData);
        }
      } catch (e) {
        console.error('[Auth] Erro crítico ao buscar perfil:', e);
      }

      // Carregar empresas vinculadas - com tratamento de erro
      try {
        const { data: empresasData, error: empresasError } = await supabase
          .from('usuarios_empresas')
          .select(`
            id,
            empresa_id,
            perfil,
            is_principal,
            empresa:empresas (
              id,
              nome_fantasia,
              razao_social,
              cnpj,
              logo_url,
              plano,
              status,
              b_verificada,
              cnae,
              logradouro
            )
          `)
          .eq('usuario_id', userId);

        if (empresasError) {
          console.warn('[Auth] Erro ao carregar empresas vinculadas:', empresasError);
          setEmpresas([]);
        } else {
          const empresasFormatadas = empresasData?.map((item: any) => ({
            ...item,
            empresa: Array.isArray(item.empresa) ? item.empresa[0] : item.empresa,
          })) || [];

          setEmpresas(empresasFormatadas);

          // LÓGICA DE ONBOARDING: Se não tem nenhuma empresa, mas tem metadados de empresa, cria agora
          const metaEmpresaNome = userForMetadata?.user_metadata?.empresa_nome || userForMetadata?.user_metadata?.nome_empresa;
          const metaEmpresaCnpj = userForMetadata?.user_metadata?.empresa_cnpj || userForMetadata?.user_metadata?.cnpj;

          if (empresasFormatadas.length === 0 && metaEmpresaNome) {
            console.log('[Auth] ONBOARDING: Usuário sem empresa detectado. Criando para:', metaEmpresaNome);
            toast.info('Configurando sua empresa: ' + metaEmpresaNome);
            try {
              const { error: rpcError } = await (supabase as any)
                .rpc('criar_empresa_rpc', {
                  p_nome_fantasia: metaEmpresaNome,
                  p_cnpj: metaEmpresaCnpj || null
                });


              if (rpcError) {
                console.error('[Auth] Erro no RPC criar_empresa_rpc:', rpcError);
                if (rpcError.code === '23505') {
                  toast.error('Este CNPJ já está cadastrado em outra conta.');
                } else {
                  toast.error('Erro ao configurar sua empresa automaticamente.');
                }
                throw rpcError;
              }

              console.log('[Auth] Empresa criada com sucesso via onboarding.');
              toast.success('Empresa configurada com sucesso!');

              // Pequena pausa para garantir que o BD processou o vínculo
              await new Promise(resolve => setTimeout(resolve, 500));

              // Recarregar empresas após criação
              await carregarDadosUsuario(userId, userForMetadata || undefined);
              return;
            } catch (rpcErr) {
              console.error('[Auth] Falha crítica no onboarding:', rpcErr);
            }
          }

          // Selecionar empresa principal ou primeira
          const principal = empresasFormatadas.find((e: EmpresaVinculada) => e.is_principal);
          const primeira = empresasFormatadas[0];
          setEmpresaSelecionada(principal || primeira || null);
        }
      } catch (e) {
        console.error('[Auth] Erro crítico ao buscar empresas:', e);
      }

      // Atualizar último acesso (tentativa silently)
      try {
        const updateData: { ultimo_acesso: string } = { ultimo_acesso: new Date().toISOString() };
        await supabase
          .from('perfis')
          .update(updateData as never)
          .eq('id', userId);
      } catch (e) {
        // Ignorar erro de atualização de acesso
      }

    } catch (globalError) {
      console.error('[Auth] Erro global no carregamento de dados:', globalError);
      toast.error('O sistema encontrou problemas ao carregar seus dados, mas você ainda pode navegar.');
    }
  }, [user]);

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
      const { data, error } = await supabase.auth.signInWithPassword({
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

      // IMPORTANTE: Atualizar o estado manualmente antes de retornar true
      // Isso evita que o ProtectedRoute redirecione de volta para o login
      // enquanto o onAuthStateChange ainda não disparou.
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        // Desparar o carregamento de dados mas não esperar por ele para navegar
        carregarDadosUsuario(data.session.user.id, data.session.user);
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
            empresa_nome: data.empresa_nome,
            empresa_cnpj: data.empresa_cnpj,
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

  const criarEmpresa = useCallback(async (dados: { nome: string; cnpj?: string; b_verificada?: boolean }): Promise<EmpresaVinculada | null> => {
    if (!user) return null;
    setIsLoading(true);

    try {
      // 1. Usar RPC segura para criar e vincular
      const { data: rpcData, error: rpcError } = await (supabase as any)
        .rpc('criar_empresa_rpc', {
          p_nome_fantasia: dados.nome,
          p_cnpj: dados.cnpj || null
        });

      if (rpcError) throw rpcError;

      // 2. Se solicitada verificação (pelo Onboarding), marcar no banco
      if (dados.b_verificada && rpcData?.id) {
        await supabase
          .from('empresas')
          .update({ b_verificada: true } as never)
          .eq('id', rpcData.id);
      }

      // Recarregar dados completos do usuário para atualizar lista de empresas
      await carregarDadosUsuario(user.id, user);

      // Encontrar a empresa recém criada na lista atualizada (pode ter delay, então fallback pro reload)
      // Como o carregarDadosUsuario atualiza o state 'empresas' e 'empresaSelecionada', 
      // podemos pegar direto do state? Não, closure antiga.
      // Vamos retornar true e deixar o useEffect atualizar ou buscar manualmente de novo se precisar.

      // Hack curto prazo: retornar um objeto parcial só pra UI não quebrar se ela esperar retorno imediato
      // Mas o ideal é confiar no reload.

      toast.success('Empresa criada com sucesso!');

      // Retornar null por enquanto pois o state async vai atualizar.
      // A UI deve reagir a 'empresaSelecionada'.
      return null;

    } catch (error: any) {
      console.error('[Auth] Erro ao criar empresa:', error);
      toast.error('Erro ao a empresa: ' + (error.message || 'Erro desconhecido'));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, carregarDadosUsuario]);

  const atualizarEmpresa = useCallback(async (empresaId: string, dados: { nome?: string; cnpj?: string; b_verificada?: boolean }): Promise<boolean> => {
    if (!user) return false;
    setIsLoading(true);

    try {
      const updates: any = {};
      if (dados.nome) updates.nome_fantasia = dados.nome;
      if (dados.cnpj !== undefined) updates.cnpj = dados.cnpj || null;

      if (dados.b_verificada !== undefined) {
        updates.b_verificada = dados.b_verificada;
      }

      const { error } = await supabase
        .from('empresas')
        .update(updates as never)
        .eq('id', empresaId);

      if (error) throw error;

      // Recarregar dados para refletir mudanças na UI
      await carregarDadosUsuario(user.id, user);

      toast.success('Dados da empresa atualizados!');
      return true;
    } catch (error: any) {
      console.error('[Auth] Erro ao atualizar empresa:', error);
      toast.error('Erro ao atualizar empresa: ' + (error.message || 'Erro desconhecido'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, carregarDadosUsuario]);

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
    criarEmpresa,
    atualizarEmpresa,
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
