import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Fingerprint,
  Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const { login, verifyMFA, isAuthenticated, requiresMFA, isLoading } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [errors, setErrors] = useState<{ email?: string; password?: string; mfaCode?: string }>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  // Lockout countdown
  useEffect(() => {
    if (lockoutTime > 0) {
      const interval = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTime]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!requiresMFA) {
      if (!password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (password.length < 8) {
        newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
      }
    } else {
      if (!mfaCode || mfaCode.length !== 6) {
        newErrors.mfaCode = 'Digite o código de 6 dígitos';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) return;
    if (!validateForm()) return;

    if (requiresMFA) {
      const success = await verifyMFA(mfaCode);
      if (success) {
        navigate('/app');
      }
    } else {
      const success = await login(email, password, rememberMe);
      
      if (!success && !requiresMFA) {
        setLoginAttempts(prev => prev + 1);
        
        if (loginAttempts >= 4) {
          setIsLocked(true);
          setLockoutTime(900); // 15 minutos
        }
      }
      
      if (success) {
        navigate('/app');
      }
    }
  };

  const formatLockoutTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-primary-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-lg shadow-primary-500/20 mb-4">
            <Shield className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            {requiresMFA ? 'Verificação em Duas Etapas' : 'Acesse sua conta'}
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {requiresMFA 
              ? 'Digite o código de 6 dígitos do seu aplicativo autenticador'
              : 'Sistema de Gestão de SST'
            }
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-150 overflow-hidden">
          {/* Security Badge */}
          <div className="bg-success-50 border-b border-success-100 px-6 py-3 flex items-center justify-center gap-2">
            {requiresMFA ? (
              <>
                <ShieldCheck className="w-4 h-4 text-success-600" strokeWidth={1.5} />
                <span className="text-sm text-success-700 font-medium">Autenticação adicional necessária</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4 text-success-600" strokeWidth={1.5} />
                <span className="text-sm text-success-700 font-medium">Conexão segura com criptografia TLS</span>
              </>
            )}
          </div>

          <div className="p-8">
            {/* Lockout Warning */}
            {isLocked && (
              <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-danger-900">Conta temporariamente bloqueada</p>
                    <p className="text-sm text-danger-700 mt-1">
                      Por segurança, aguarde <span className="font-mono font-medium">{formatLockoutTime(lockoutTime)}</span> antes de tentar novamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* MFA Step Indicator */}
            {requiresMFA && (
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm text-success-600 font-medium">Login</span>
                </div>
                <div className="w-8 h-0.5 bg-success-500" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    2
                  </div>
                  <span className="text-sm text-primary-600 font-medium">MFA</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!requiresMFA ? (
                <>
                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Email corporativo
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        placeholder="seu@empresa.com.br"
                        disabled={isLoading || isLocked}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all disabled:bg-neutral-50 disabled:cursor-not-allowed ${
                          errors.email ? 'border-danger-300 bg-danger-50' : 'border-neutral-200'
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-sm font-medium text-neutral-700">
                        Senha
                      </label>
                      <button 
                        type="button"
                        onClick={() => toast.info('Entre em contato com o administrador para redefinir sua senha')}
                        className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                        placeholder="••••••••"
                        disabled={isLoading || isLocked}
                        className={`w-full pl-10 pr-12 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all disabled:bg-neutral-50 disabled:cursor-not-allowed ${
                          errors.password ? 'border-danger-300 bg-danger-50' : 'border-neutral-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-neutral-600">Lembrar-me neste dispositivo</span>
                    </label>
                  </div>
                </>
              ) : (
                /* MFA Code Field */
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Código de verificação
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setMfaCode(value);
                        if (errors.mfaCode) setErrors(prev => ({ ...prev, mfaCode: undefined }));
                      }}
                      placeholder="000000"
                      maxLength={6}
                      disabled={isLoading}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm font-mono text-center tracking-[0.5em] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all disabled:bg-neutral-50 disabled:cursor-not-allowed ${
                        errors.mfaCode ? 'border-danger-300 bg-danger-50' : 'border-neutral-200'
                      }`}
                    />
                  </div>
                  {errors.mfaCode && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.mfaCode}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 mt-2 text-center">
                    Abra seu aplicativo autenticador e digite o código
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 disabled:shadow-none"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {requiresMFA ? 'Verificando...' : 'Autenticando...'}
                  </>
                ) : (
                  <>
                    {requiresMFA ? 'Verificar' : 'Entrar'}
                    {!requiresMFA && <ShieldCheck className="w-5 h-5" />}
                  </>
                )}
              </button>
            </form>

            {/* Security Info */}
            {!requiresMFA && (
              <div className="mt-6 pt-6 border-t border-neutral-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="w-4 h-4 text-primary-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Segurança reforçada</p>
                    <p className="text-xs text-neutral-500 mt-0.5 leading-relaxed">
                      Sua sessão expira automaticamente após 30 minutos de inatividade. 
                      Recomendamos ativar a autenticação de dois fatores.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Não tem uma conta?{' '}
          <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
            Crie sua conta grátis
          </Link>
        </p>

        {/* Demo Credentials */}
        <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-neutral-200">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-3">Credenciais de demonstração</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-accent-purple/10 rounded flex items-center justify-center">
                  <span className="text-xs font-medium text-accent-purple">A</span>
                </div>
                <span className="text-neutral-600">carlos.silva@metalsil.com.br</span>
              </div>
              <span className="text-xs text-neutral-400 font-mono">Admin@123</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary-100 rounded flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-600">G</span>
                </div>
                <span className="text-neutral-600">ana.ferreira@metalsil.com.br</span>
              </div>
              <span className="text-xs text-neutral-400 font-mono">Gestor@123</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-4">
          © 2026 NR1 Pro. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
