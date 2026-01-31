import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  AlertCircle,
  Loader2,
  Fingerprint
} from 'lucide-react';
import { toast } from 'sonner';

export function Login() {
  const navigate = useNavigate();
  const { login, user, isLoading } = useSupabaseAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

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

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) return;
    if (!validateForm()) return;

    const success = await login(email, password);
    
    if (!success) {
      setLoginAttempts(prev => prev + 1);
      
      if (loginAttempts >= 4) {
        setIsLocked(true);
        setLockoutTime(900); // 15 minutos
        toast.error('Muitas tentativas. Conta bloqueada por 15 minutos.');
      }
    } else {
      navigate('/app');
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
            Acesse sua conta
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sistema de Gestão de SST
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-150 overflow-hidden">
          {/* Security Badge */}
          <div className="bg-success-50 border-b border-success-100 px-6 py-3 flex items-center justify-center gap-2">
            <Fingerprint className="w-4 h-4 text-success-600" strokeWidth={1.5} />
            <span className="text-sm text-success-700 font-medium">Conexão segura com criptografia TLS</span>
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

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-5 h-5" strokeWidth={1.5} />
                    )}
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
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-neutral-600">
                  Manter conectado neste dispositivo
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isLocked}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">ou</span>
              </div>
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-neutral-600">
              Ainda não tem conta?{' '}
              <Link 
                to="/signup" 
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Criar conta grátis
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-400">
            © 2024 NR1 Pro. Todos os direitos reservados.
          </p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <button 
              onClick={() => toast.info('Política de Privacidade em breve')}
              className="text-xs text-neutral-400 hover:text-neutral-600"
            >
              Política de Privacidade
            </button>
            <button 
              onClick={() => toast.info('Termos de Uso em breve')}
              className="text-xs text-neutral-400 hover:text-neutral-600"
            >
              Termos de Uso
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
