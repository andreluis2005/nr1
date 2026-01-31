// =============================================================================
// NR1 Pro - Cliente Supabase
// Configuração centralizada do Supabase Client
// =============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// =============================================================================
// CONFIGURAÇÃO
// =============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// =============================================================================
// CLIENTE SUPABASE
// =============================================================================

export const supabase: SupabaseClient<Database> = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'nr1-pro-auth-token',
      storage: localStorage,
    },
    global: {
      headers: {
        'x-application-name': 'nr1-pro',
      },
    },
  }
);

// =============================================================================
// TIPOS AUXILIARES
// =============================================================================

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

// =============================================================================
// HELPERS DE AUTENTICAÇÃO
// =============================================================================

/**
 * Obtém a sessão atual do usuário
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

/**
 * Obtém o usuário atual
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

/**
 * Verifica se o usuário está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getCurrentSession();
  return !!session;
}

/**
 * Realiza logout
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// =============================================================================
// SUBSCRIPTORES DE AUTENTICAÇÃO
// =============================================================================

/**
 * Assina mudanças no estado de autenticação
 */
export function onAuthStateChange(
  callback: (event: 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'TOKEN_REFRESHED', session: any) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event as any, session);
  });
}

// =============================================================================
// HELPERS DE DATABASE
// =============================================================================

/**
 * Executa uma query com tratamento de erro padronizado
 */
export async function query<T>(
  table: keyof Database['public']['Tables'],
  queryFn: (qb: any) => Promise<{ data: T | null; error: any }>
): Promise<T> {
  const { data, error } = await queryFn(supabase.from(table));
  
  if (error) {
    console.error(`[Supabase Error] ${table}:`, error);
    throw new Error(error.message);
  }
  
  if (data === null) {
    throw new Error(`Nenhum dado retornado de ${table}`);
  }
  
  return data;
}

// =============================================================================
// REALTIME SUBSCRIPTIONS
// =============================================================================

/**
 * Assina mudanças em uma tabela
 */
export function subscribeToTable(
  table: string,
  callback: (payload: any) => void,
  filter?: string
) {
  const channel = supabase
    .channel(`public:${table}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: filter,
      },
      callback
    )
    .subscribe();

  return channel;
}

// =============================================================================
// STORAGE
// =============================================================================

/**
 * Faz upload de arquivo para o storage
 */
export async function uploadFile(
  bucket: string,
  path: string,
  file: File
) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) throw error;
  return data;
}

/**
 * Obtém URL pública de um arquivo
 */
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// =============================================================================
// VERIFICAÇÃO DE CONFIGURAÇÃO
// =============================================================================

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] ⚠️ Variáveis de ambiente não configuradas:\n' +
    'VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias'
  );
}
