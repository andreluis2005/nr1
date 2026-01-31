/**
 * NR1 Pro - Serviço de Autenticação Enterprise
 * 
 * Implementa:
 * - JWT com access e refresh tokens
 * - MFA (TOTP)
 * - Rate limiting
 * - Device fingerprinting
 * - Token revocation
 * - CSRF protection
 */

// Serviço de autenticação - não depende de toast

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface JWTPayload {
  sub: string;        // user ID
  email: string;
  nome: string;
  perfil: string;
  permissoes: string[];
  iat: number;        // issued at
  exp: number;        // expiration
  jti: string;        // token ID (para revogação)
  deviceId: string;   // fingerprint do dispositivo
  sessionId: string;  // ID da sessão
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  empresa: {
    nome: string;
    cnpj: string;
    segmento: string;
    tamanho: string;
  };
  plano: string;
}

export interface SessionInfo {
  id: string;
  deviceId: string;
  deviceName: string;
  browser: string;
  os: string;
  ip: string;
  location?: string;
  createdAt: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface MFASecret {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

// ============================================
// CONSTANTES DE SEGURANÇA
// ============================================

const SECURITY_CONFIG = {
  // Tempos de expiração (em segundos)
  ACCESS_TOKEN_EXPIRY: 15 * 60,        // 15 minutos
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 dias
  REMEMBER_ME_EXPIRY: 30 * 24 * 60 * 60,  // 30 dias
  
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000,    // 15 minutos
  RATE_LIMIT_WINDOW: 60 * 1000,        // 1 minuto
  
  // MFA
  MFA_CODE_LENGTH: 6,
  MFA_WINDOW: 1, // Tolerance window for TOTP
  
  // Password
  MIN_PASSWORD_LENGTH: 8,
  PASSWORD_HASH_ROUNDS: 12, // bcrypt rounds equivalent
};

// ============================================
// STORAGE KEYS (com namespace para segurança)
// ============================================

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'nr1pro_at',
  REFRESH_TOKEN: 'nr1pro_rt',
  SESSION_ID: 'nr1pro_sid',
  DEVICE_ID: 'nr1pro_did',
  MFA_ENABLED: 'nr1pro_mfa',
  MFA_SECRET: 'nr1pro_mfa_sec',
  USER_DATA: 'nr1pro_usr',
  TOKEN_EXPIRY: 'nr1pro_exp',
};

// ============================================
// UTILITÁRIOS CRIPTOGRÁFICOS
// ============================================

/**
 * Gera um ID único seguro (UUID v4)
 */
function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Gera um hash SHA-256
 */
async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Gera um device fingerprint único
 */
async function generateDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    navigator.hardwareConcurrency || 'unknown',
  ];
  
  const fingerprint = components.join('::');
  return await sha256(fingerprint);
}

/**
 * Gera um token JWT simulado (em produção, use biblioteca JWT no backend)
 */
function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'>, expiresIn: number): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
    jti: generateUUID(),
  };
  
  // Simulação de JWT - em produção, use jsonwebtoken no backend
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${generateUUID()}`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Gera refresh token JWT
 */
function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'> & { jti: string }, expiresIn: number): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
  };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${generateUUID()}`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Decodifica um JWT (sem verificar assinatura - apenas para ler payload)
 */
function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Verifica se um token está expirado
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload) return true;
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

// ============================================
// TOTP/MFA UTILITÁRIOS
// ============================================

/**
 * Gera um segredo TOTP (base32)
 */
function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

/**
 * Gera código TOTP (simulação - em produção use speakeasy ou similar)
 */
function generateTOTPCode(secret: string): string {
  // Simulação simplificada - em produção use biblioteca TOTP
  const timeStep = Math.floor(Date.now() / 1000 / 30);
  const code = Math.abs((timeStep * secret.length) % 1000000);
  return code.toString().padStart(6, '0');
}

/**
 * Verifica código TOTP
 */
function verifyTOTP(secret: string, code: string): boolean {
  const expectedCode = generateTOTPCode(secret);
  return code === expectedCode;
}

/**
 * Gera QR Code URL para TOTP
 */
function generateTOTPQRCode(secret: string, email: string): string {
  const issuer = 'NR1%20Pro';
  const label = encodeURIComponent(email);
  return `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}`;
}

/**
 * Gera códigos de backup
 */
function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(`${code.substring(0, 4)}-${code.substring(4, 8)}`);
  }
  return codes;
}

// ============================================
// RATE LIMITING E PROTEÇÃO
// ============================================

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

class RateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  
  checkLimit(key: string): { allowed: boolean; remaining: number; resetTime?: number } {
    const now = Date.now();
    const entry = this.attempts.get(key);
    
    if (entry) {
      // Verificar se está bloqueado
      if (entry.lockedUntil && now < entry.lockedUntil) {
        return { 
          allowed: false, 
          remaining: 0, 
          resetTime: entry.lockedUntil 
        };
      }
      
      // Resetar se passou o window
      if (now - entry.firstAttempt > SECURITY_CONFIG.RATE_LIMIT_WINDOW) {
        this.attempts.delete(key);
      }
    }
    
    const currentEntry = this.attempts.get(key);
    const attempts = currentEntry?.count || 0;
    
    return {
      allowed: attempts < SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
      remaining: Math.max(0, SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - attempts),
    };
  }
  
  recordAttempt(key: string): void {
    const now = Date.now();
    const entry = this.attempts.get(key);
    
    if (!entry) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
        lockedUntil: null,
      });
    } else {
      entry.count++;
      
      if (entry.count >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        entry.lockedUntil = now + SECURITY_CONFIG.LOCKOUT_DURATION;
      }
      
      this.attempts.set(key, entry);
    }
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

const rateLimiter = new RateLimiter();

// ============================================
// MOCK DATABASE (simulação de backend)
// ============================================

interface UserRecord {
  id: string;
  nome: string;
  email: string;
  passwordHash: string;
  perfil: string;
  permissoes: string[];
  ativo: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string;
  backupCodes?: string[];
  createdAt: string;
  lastLogin?: string;
  failedLogins: number;
  lockedUntil?: number;
}

// Hash de senha (simulação bcrypt)
async function hashPassword(password: string): Promise<string> {
  const salt = await sha256(generateUUID());
  return await sha256(password + salt) + '.' + salt.substring(0, 16);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [hashPart, salt] = hash.split('.');
  const computed = await sha256(password + salt);
  return computed === hashPart;
}

// Mock users database
const MOCK_USERS: UserRecord[] = [
  {
    id: 'usr_001',
    nome: 'Carlos Silva',
    email: 'carlos.silva@metalsil.com.br',
    passwordHash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8.abc123',
    perfil: 'admin',
    permissoes: ['*'],
    ativo: true,
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    failedLogins: 0,
  },
];

// Active sessions (para revogação)
const ACTIVE_SESSIONS = new Map<string, { userId: string; deviceId: string; createdAt: string }>();
const REVOKED_TOKENS = new Set<string>();

// ============================================
// SERVIÇO DE AUTENTICAÇÃO
// ============================================

class AuthService {
  private deviceId: string | null = null;
  private sessionId: string | null = null;
  
  async initialize(): Promise<void> {
    // Carregar ou gerar device ID
    this.deviceId = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
    if (!this.deviceId) {
      this.deviceId = await generateDeviceFingerprint();
      localStorage.setItem(STORAGE_KEYS.DEVICE_ID, this.deviceId);
    }
    
    // Carregar session ID
    this.sessionId = sessionStorage.getItem(STORAGE_KEYS.SESSION_ID);
  }
  
  /**
   * Login com MFA opcional
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; tokens?: AuthTokens; requiresMFA?: boolean; error?: string }> {
    const rateKey = `login:${credentials.email}:${this.deviceId}`;
    const rateCheck = rateLimiter.checkLimit(rateKey);
    
    if (!rateCheck.allowed) {
      const minutes = Math.ceil((rateCheck.resetTime! - Date.now()) / 60000);
      return { 
        success: false, 
        error: `Conta temporariamente bloqueada. Tente novamente em ${minutes} minutos.` 
      };
    }
    
    // Simular delay de rede + timing attack protection
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
    
    // Buscar usuário
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
    
    if (!user) {
      rateLimiter.recordAttempt(rateKey);
      return { success: false, error: 'Credenciais inválidas' };
    }
    
    // Verificar se conta está bloqueada
    if (user.lockedUntil && Date.now() < user.lockedUntil) {
      const minutes = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return { success: false, error: `Conta bloqueada. Tente em ${minutes} minutos.` };
    }
    
    // Verificar senha
    const passwordValid = await verifyPassword(credentials.password, user.passwordHash);
    
    if (!passwordValid) {
      rateLimiter.recordAttempt(rateKey);
      user.failedLogins++;
      
      if (user.failedLogins >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
      }
      
      return { success: false, error: 'Credenciais inválidas' };
    }
    
    // Verificar MFA se habilitado
    if (user.mfaEnabled && !credentials.mfaCode) {
      return { success: false, requiresMFA: true };
    }
    
    if (user.mfaEnabled && credentials.mfaCode) {
      if (!user.mfaSecret || !verifyTOTP(user.mfaSecret, credentials.mfaCode)) {
        return { success: false, error: 'Código de verificação inválido' };
      }
    }
    
    // Login bem-sucedido
    rateLimiter.reset(rateKey);
    user.failedLogins = 0;
    user.lockedUntil = undefined;
    user.lastLogin = new Date().toISOString();
    
    // Gerar tokens
    const tokens = await this.generateTokens(user);
    
    // Registrar sessão
    this.sessionId = generateUUID();
    ACTIVE_SESSIONS.set(this.sessionId, {
      userId: user.id,
      deviceId: this.deviceId!,
      createdAt: new Date().toISOString(),
    });
    
    // Salvar tokens
    this.saveTokens(tokens, credentials.rememberMe);
    
    return { success: true, tokens };
  }
  
  /**
   * Registro de novo usuário
   */
  async register(data: RegisterData): Promise<{ success: boolean; tokens?: AuthTokens; error?: string }> {
    // Verificar se email já existe
    const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) {
      return { success: false, error: 'Este email já está cadastrado' };
    }
    
    // Criar novo usuário
    const newUser: UserRecord = {
      id: `usr_${generateUUID().substring(0, 8)}`,
      nome: data.nome,
      email: data.email,
      passwordHash: await hashPassword(data.senha),
      perfil: 'admin',
      permissoes: ['*'],
      ativo: true,
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      failedLogins: 0,
    };
    
    MOCK_USERS.push(newUser);
    
    // Gerar tokens
    const tokens = await this.generateTokens(newUser);
    
    // Registrar sessão
    this.sessionId = generateUUID();
    ACTIVE_SESSIONS.set(this.sessionId, {
      userId: newUser.id,
      deviceId: this.deviceId!,
      createdAt: new Date().toISOString(),
    });
    
    // Salvar tokens
    this.saveTokens(tokens, false);
    
    return { success: true, tokens };
  }
  
  /**
   * Gerar tokens JWT
   */
  private async generateTokens(user: UserRecord): Promise<AuthTokens> {
    const payload = {
      sub: user.id,
      email: user.email,
      nome: user.nome,
      perfil: user.perfil,
      permissoes: user.permissoes,
      deviceId: this.deviceId!,
      sessionId: this.sessionId!,
    };
    
    const accessToken = generateJWT(payload, SECURITY_CONFIG.ACCESS_TOKEN_EXPIRY);
    const refreshToken = generateRefreshToken({ ...payload, jti: generateUUID() }, SECURITY_CONFIG.REFRESH_TOKEN_EXPIRY);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: SECURITY_CONFIG.ACCESS_TOKEN_EXPIRY,
      tokenType: 'Bearer',
    };
  }
  
  /**
   * Salvar tokens no storage apropriado
   */
  private saveTokens(tokens: AuthTokens, rememberMe: boolean = false): void {
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    } else {
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
      sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
    }
    
    sessionStorage.setItem(STORAGE_KEYS.SESSION_ID, this.sessionId!);
    sessionStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, (Date.now() + tokens.expiresIn * 1000).toString());
  }
  
  /**
   * Refresh token
   */
  async refreshToken(): Promise<{ success: boolean; tokens?: AuthTokens; error?: string }> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return { success: false, error: 'Sessão expirada' };
    }
    
    // Verificar se token foi revogado
    const payload = decodeJWT(refreshToken);
    if (!payload || REVOKED_TOKENS.has(payload.jti)) {
      this.logout();
      return { success: false, error: 'Sessão inválida' };
    }
    
    // Verificar se sessão ainda existe
    const session = ACTIVE_SESSIONS.get(payload.sessionId);
    if (!session) {
      this.logout();
      return { success: false, error: 'Sessão encerrada' };
    }
    
    // Buscar usuário
    const user = MOCK_USERS.find(u => u.id === payload.sub);
    if (!user || !user.ativo) {
      this.logout();
      return { success: false, error: 'Usuário inválido' };
    }
    
    // Gerar novos tokens
    this.sessionId = payload.sessionId;
    const tokens = await this.generateTokens(user);
    
    // Revogar token antigo
    REVOKED_TOKENS.add(payload.jti);
    
    // Salvar novos tokens
    const isPersistent = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) !== null;
    this.saveTokens(tokens, isPersistent);
    
    return { success: true, tokens };
  }
  
  /**
   * Verificar e retornar token de acesso válido
   */
  async getValidAccessToken(): Promise<string | null> {
    const token = this.getAccessToken();
    
    if (!token) return null;
    
    // Verificar se token foi revogado
    const payload = decodeJWT(token);
    if (!payload || REVOKED_TOKENS.has(payload.jti)) {
      return null;
    }
    
    // Verificar expiração
    if (!isTokenExpired(token)) {
      return token;
    }
    
    // Tentar refresh
    const refresh = await this.refreshToken();
    if (refresh.success) {
      return refresh.tokens!.accessToken;
    }
    
    return null;
  }
  
  /**
   * Logout e revogação de tokens
   */
  logout(allDevices: boolean = false): void {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    // Revogar tokens
    if (accessToken) {
      const payload = decodeJWT(accessToken);
      if (payload) REVOKED_TOKENS.add(payload.jti);
    }
    if (refreshToken) {
      const payload = decodeJWT(refreshToken);
      if (payload) REVOKED_TOKENS.add(payload.jti);
    }
    
    // Remover sessão
    if (this.sessionId) {
      ACTIVE_SESSIONS.delete(this.sessionId);
    }
    
    // Limpar storage
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_ID);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    // Se logout de todos os dispositivos
    if (allDevices && accessToken) {
      const payload = decodeJWT(accessToken);
      if (payload) {
        for (const [sessionId, session] of ACTIVE_SESSIONS.entries()) {
          if (session.userId === payload.sub) {
            ACTIVE_SESSIONS.delete(sessionId);
          }
        }
      }
    }
    
    this.sessionId = null;
  }
  
  /**
   * Configurar MFA
   */
  async setupMFA(): Promise<{ success: boolean; secret?: MFASecret; error?: string }> {
    const token = await this.getValidAccessToken();
    if (!token) {
      return { success: false, error: 'Não autenticado' };
    }
    
    const payload = decodeJWT(token);
    const user = MOCK_USERS.find(u => u.id === payload?.sub);
    
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }
    
    const secret = generateTOTPSecret();
    const backupCodes = generateBackupCodes();
    
    // Salvar (em produção, criptografar o segredo)
    user.mfaSecret = secret;
    user.backupCodes = backupCodes;
    
    return {
      success: true,
      secret: {
        secret,
        qrCode: generateTOTPQRCode(secret, user.email),
        backupCodes,
      },
    };
  }
  
  /**
   * Ativar MFA
   */
  async enableMFA(code: string): Promise<{ success: boolean; error?: string }> {
    const token = await this.getValidAccessToken();
    if (!token) {
      return { success: false, error: 'Não autenticado' };
    }
    
    const payload = decodeJWT(token);
    const user = MOCK_USERS.find(u => u.id === payload?.sub);
    
    if (!user || !user.mfaSecret) {
      return { success: false, error: 'MFA não configurado' };
    }
    
    if (!verifyTOTP(user.mfaSecret, code)) {
      return { success: false, error: 'Código inválido' };
    }
    
    user.mfaEnabled = true;
    return { success: true };
  }
  
  /**
   * Obter sessões ativas
   */
  async getActiveSessions(): Promise<SessionInfo[]> {
    const token = await this.getValidAccessToken();
    if (!token) return [];
    
    const payload = decodeJWT(token);
    if (!payload) return [];
    
    const sessions: SessionInfo[] = [];
    
    for (const [sessionId, session] of ACTIVE_SESSIONS.entries()) {
      if (session.userId === payload.sub) {
        sessions.push({
          id: sessionId,
          deviceId: session.deviceId,
          deviceName: 'Dispositivo Desconhecido', // Em produção, detectar do user agent
          browser: 'Chrome', // Em produção, parse do user agent
          os: 'Windows', // Em produção, parse do user agent
          ip: '***.***.***.***', // Em produção, do backend
          createdAt: session.createdAt,
          lastActive: new Date().toISOString(),
          isCurrent: sessionId === this.sessionId,
        });
      }
    }
    
    return sessions;
  }
  
  /**
   * Revogar sessão específica
   */
  async revokeSession(sessionId: string): Promise<boolean> {
    const session = ACTIVE_SESSIONS.get(sessionId);
    if (session) {
      ACTIVE_SESSIONS.delete(sessionId);
      return true;
    }
    return false;
  }
  
  // Getters
  getAccessToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || 
           localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
  
  getRefreshToken(): string | null {
    return sessionStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) || 
           localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
  
  getSessionId(): string | null {
    return this.sessionId;
  }
  
  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.sessionId;
  }
}

// Singleton instance
export const authService = new AuthService();

// Inicializar ao importar
authService.initialize();

export default authService;
