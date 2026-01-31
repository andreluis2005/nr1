import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { RegisterData } from '@/services/authService';
import { 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User,
  Building2,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';

type Step = 'conta' | 'empresa' | 'plano' | 'confirmacao';

interface FormData {
  // Conta
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
  aceitarTermos: boolean;
  
  // Empresa
  nomeEmpresa: string;
  cnpj: string;
  segmento: string;
  tamanhoEmpresa: string;
  
  // Plano
  plano: 'trial' | 'starter' | 'business';
}

const segmentos = [
  { value: 'industria', label: 'Indústria' },
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'outro', label: 'Outro' },
];

const tamanhos = [
  { value: '1-10', label: '1-10 funcionários' },
  { value: '11-50', label: '11-50 funcionários' },
  { value: '51-200', label: '51-200 funcionários' },
  { value: '201-500', label: '201-500 funcionários' },
  { value: '500+', label: 'Mais de 500 funcionários' },
];

const planos = [
  {
    id: 'trial',
    nome: 'Teste Grátis',
    preco: 'Grátis',
    periodo: '14 dias',
    descricao: 'Experimente todas as funcionalidades',
    features: [
      'Acesso completo por 14 dias',
      'Até 10 funcionários',
      'PGR e GRO',
      'Exames ocupacionais',
      'Treinamentos',
      'Suporte por email',
    ],
    recomendado: false,
  },
  {
    id: 'starter',
    nome: 'Starter',
    preco: 'R$ 5',
    periodo: '/funcionário/mês',
    descricao: 'Ideal para pequenas empresas',
    features: [
      'Até 50 funcionários',
      'PGR e GRO completos',
      'Controle de exames',
      'Gestão de treinamentos',
      'Alertas automáticos',
      'Relatórios básicos',
      'Suporte por email',
    ],
    recomendado: true,
  },
  {
    id: 'business',
    nome: 'Business',
    preco: 'R$ 8',
    periodo: '/funcionário/mês',
    descricao: 'Para empresas em crescimento',
    features: [
      'Até 500 funcionários',
      'Tudo do Starter',
      'Integração eSocial',
      'Analytics avançado',
      'Workflow de aprovações',
      'Notificações multi-canal',
      'Suporte prioritário',
    ],
    recomendado: false,
  },
];

export function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState<Step>('conta');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    aceitarTermos: false,
    nomeEmpresa: '',
    cnpj: '',
    segmento: '',
    tamanhoEmpresa: '',
    plano: 'trial',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateStep = (currentStep: Step): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (currentStep === 'conta') {
      if (!formData.nome.trim()) {
        newErrors.nome = 'Nome completo é obrigatório';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email é obrigatório';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email inválido';
      }
      
      if (!formData.telefone.trim()) {
        newErrors.telefone = 'Telefone é obrigatório';
      }
      
      if (!formData.senha) {
        newErrors.senha = 'Senha é obrigatória';
      } else if (formData.senha.length < 8) {
        newErrors.senha = 'Senha deve ter pelo menos 8 caracteres';
      }
      
      if (formData.senha !== formData.confirmarSenha) {
        newErrors.confirmarSenha = 'Senhas não coincidem';
      }
      
      if (!formData.aceitarTermos) {
        newErrors.aceitarTermos = 'Você deve aceitar os termos';
      }
    }

    if (currentStep === 'empresa') {
      if (!formData.nomeEmpresa.trim()) {
        newErrors.nomeEmpresa = 'Nome da empresa é obrigatório';
      }
      
      if (!formData.cnpj.trim()) {
        newErrors.cnpj = 'CNPJ é obrigatório';
      } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$|^\d{14}$/.test(formData.cnpj.replace(/\D/g, ''))) {
        newErrors.cnpj = 'CNPJ inválido';
      }
      
      if (!formData.segmento) {
        newErrors.segmento = 'Segmento é obrigatório';
      }
      
      if (!formData.tamanhoEmpresa) {
        newErrors.tamanhoEmpresa = 'Tamanho da empresa é obrigatório';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      const steps: Step[] = ['conta', 'empresa', 'plano', 'confirmacao'];
      const currentIndex = steps.indexOf(step);
      if (currentIndex < steps.length - 1) {
        setStep(steps[currentIndex + 1]);
      }
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['conta', 'empresa', 'plano', 'confirmacao'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    } else {
      navigate('/login');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const registerData: RegisterData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        senha: formData.senha,
        empresa: {
          nome: formData.nomeEmpresa,
          cnpj: formData.cnpj,
          segmento: formData.segmento,
          tamanho: formData.tamanhoEmpresa,
        },
        plano: formData.plano,
      };
      
      const success = await register(registerData);

      if (success) {
        toast.success('Conta criada com sucesso!');
        navigate('/app');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const getPasswordStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const labels = ['Muito fraca', 'Fraca', 'Média', 'Boa', 'Forte', 'Muito forte'];
    const colors = ['bg-danger-500', 'bg-danger-400', 'bg-warning-500', 'bg-primary-500', 'bg-success-500', 'bg-success-600'];

    return { score, label: labels[score] || 'Muito fraca', color: colors[score] || 'bg-danger-500' };
  };

  const passwordStrength = getPasswordStrength(formData.senha);

  const renderStepIndicator = () => {
    const steps = [
      { key: 'conta', label: 'Conta' },
      { key: 'empresa', label: 'Empresa' },
      { key: 'plano', label: 'Plano' },
      { key: 'confirmacao', label: 'Confirmação' },
    ];

    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((s, index) => {
          const isActive = step === s.key;
          const isCompleted = steps.findIndex(st => st.key === step) > index;
          
          return (
            <div key={s.key} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all
                ${isActive ? 'bg-primary-600 text-white' : ''}
                ${isCompleted ? 'bg-success-500 text-white' : ''}
                ${!isActive && !isCompleted ? 'bg-neutral-100 text-neutral-400' : ''}
              `}>
                {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
              </div>
              <span className={`
                ml-2 text-sm font-medium hidden sm:inline
                ${isActive ? 'text-primary-600' : ''}
                ${isCompleted ? 'text-success-600' : ''}
                ${!isActive && !isCompleted ? 'text-neutral-400' : ''}
              `}>
                {s.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`
                  w-8 h-0.5 mx-2 hidden sm:block
                  ${isCompleted ? 'bg-success-500' : 'bg-neutral-200'}
                `} />
              )}
            </div>
          );
        })}
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-primary-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo e Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/20 mb-4">
            <Shield className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Criar sua conta</h1>
          <p className="text-sm text-neutral-500 mt-1">
            {step === 'conta' && 'Comece sua jornada de compliance'}
            {step === 'empresa' && 'Informações da sua empresa'}
            {step === 'plano' && 'Escolha o plano ideal'}
            {step === 'confirmacao' && 'Revise suas informações'}
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-150 overflow-hidden">
          {/* Security Badge */}
          <div className="bg-success-50 border-b border-success-100 px-6 py-3 flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-success-600" strokeWidth={1.5} />
            <span className="text-sm text-success-700 font-medium">Seus dados estão protegidos</span>
          </div>

          <div className="p-8">
            {/* Step 1: Conta */}
            {step === 'conta' && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Nome completo
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => updateField('nome', e.target.value)}
                        placeholder="Seu nome completo"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${
                          errors.nome ? 'border-danger-300 bg-danger-50' : 'border-neutral-200'
                        }`}
                      />
                    </div>
                    {errors.nome && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.nome}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Email corporativo
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="seu@empresa.com.br"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${
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

                  {/* Telefone */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                      <input
                        type="tel"
                        value={formData.telefone}
                        onChange={(e) => updateField('telefone', formatTelefone(e.target.value))}
                        placeholder="(11) 99999-9999"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${
                          errors.telefone ? 'border-danger-300 bg-danger-50' : 'border-neutral-200'
                        }`}
                      />
                    </div>
                    {errors.telefone && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.telefone}
                      </p>
                    )}
                  </div>

                  {/* Senha */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.senha}
                        onChange={(e) => updateField('senha', e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        className={`w-full pl-10 pr-12 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${
                          errors.senha ? 'border-danger-300 bg-danger-50' : 'border-neutral-200'
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
                    {formData.senha && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-neutral-500">{passwordStrength.label}</span>
                        </div>
                      </div>
                    )}
                    {errors.senha && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.senha}
                      </p>
                    )}
                  </div>

                  {/* Confirmar Senha */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Confirmar senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmarSenha}
                        onChange={(e) => updateField('confirmarSenha', e.target.value)}
                        placeholder="Repita a senha"
                        className={`w-full pl-10 pr-12 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${
                          errors.confirmarSenha ? 'border-danger-300 bg-danger-50' : 'border-neutral-200'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmarSenha && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.confirmarSenha}
                      </p>
                    )}
                  </div>
                </div>

                {/* Termos */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.aceitarTermos}
                      onChange={(e) => updateField('aceitarTermos', e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-600">
                      Li e aceito os{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Termos de Uso</a>
                      {' '}e{' '}
                      <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Política de Privacidade</a>
                    </span>
                  </label>
                  {errors.aceitarTermos && (
                    <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.aceitarTermos}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Empresa */}
            {step === 'empresa' && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nome da Empresa */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Nome da empresa
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={formData.nomeEmpresa}
                        onChange={(e) => updateField('nomeEmpresa', e.target.value)}
                        placeholder="Razão social ou nome fantasia"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${
                          errors.nomeEmpresa ? 'border-danger-300 bg-danger-50' : 'border-neutral-200'
                        }`}
                      />
                    </div>
                    {errors.nomeEmpresa && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.nomeEmpresa}
                      </p>
                    )}
                  </div>

                  {/* CNPJ */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => updateField('cnpj', formatCNPJ(e.target.value))}
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all ${
                        errors.cnpj ? 'border-danger-300 bg-danger-50' : 'border-neutral-200'
                      }`}
                    />
                    {errors.cnpj && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.cnpj}
                      </p>
                    )}
                  </div>

                  {/* Segmento */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Segmento
                    </label>
                    <select
                      value={formData.segmento}
                      onChange={(e) => updateField('segmento', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white ${
                        errors.segmento ? 'border-danger-300 bg-danger-50' : 'border-neutral-200'
                      }`}
                    >
                      <option value="">Selecione...</option>
                      {segmentos.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    {errors.segmento && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.segmento}
                      </p>
                    )}
                  </div>

                  {/* Tamanho */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Tamanho da empresa
                    </label>
                    <select
                      value={formData.tamanhoEmpresa}
                      onChange={(e) => updateField('tamanhoEmpresa', e.target.value)}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all bg-white ${
                        errors.tamanhoEmpresa ? 'border-danger-300 bg-danger-50' : 'border-neutral-200'
                      }`}
                    >
                      <option value="">Selecione...</option>
                      {tamanhos.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    {errors.tamanhoEmpresa && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-danger-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.tamanhoEmpresa}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Plano */}
            {step === 'plano' && (
              <div className="space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {planos.map((plano) => (
                    <div
                      key={plano.id}
                      onClick={() => updateField('plano', plano.id as 'trial' | 'starter' | 'business')}
                      className={`
                        relative p-5 rounded-xl border-2 cursor-pointer transition-all
                        ${formData.plano === plano.id 
                          ? 'border-primary-500 bg-primary-50/50' 
                          : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                        }
                      `}
                    >
                      {plano.recomendado && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                          Recomendado
                        </div>
                      )}
                      
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-neutral-900">{plano.nome}</h3>
                        <div className="mt-2">
                          <span className="text-2xl font-bold text-neutral-900">{plano.preco}</span>
                          <span className="text-sm text-neutral-500">{plano.periodo}</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">{plano.descricao}</p>
                      </div>
                      
                      <ul className="space-y-2">
                        {plano.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600">
                            <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {formData.plano === plano.id && (
                        <div className="absolute top-3 right-3 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={2} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Confirmação */}
            {step === 'confirmacao' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-success-50 border border-success-200 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-success-900">Tudo pronto!</h3>
                  <p className="text-sm text-success-700 mt-1">
                    Revise suas informações antes de finalizar
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Dados Pessoais */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-neutral-900 mb-3">Dados Pessoais</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-neutral-500">Nome</p>
                        <p className="font-medium text-neutral-900">{formData.nome}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Email</p>
                        <p className="font-medium text-neutral-900">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Telefone</p>
                        <p className="font-medium text-neutral-900">{formData.telefone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Dados da Empresa */}
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-neutral-900 mb-3">Dados da Empresa</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-neutral-500">Nome</p>
                        <p className="font-medium text-neutral-900">{formData.nomeEmpresa}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">CNPJ</p>
                        <p className="font-medium text-neutral-900">{formData.cnpj}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Segmento</p>
                        <p className="font-medium text-neutral-900">
                          {segmentos.find(s => s.value === formData.segmento)?.label}
                        </p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Tamanho</p>
                        <p className="font-medium text-neutral-900">
                          {tamanhos.find(t => t.value === formData.tamanhoEmpresa)?.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Plano */}
                  <div className="bg-primary-50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-primary-900 mb-3">Plano Selecionado</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-primary-900">
                          {planos.find(p => p.id === formData.plano)?.nome}
                        </p>
                        <p className="text-sm text-primary-700">
                          {planos.find(p => p.id === formData.plano)?.descricao}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary-900">
                          {planos.find(p => p.id === formData.plano)?.preco}
                        </p>
                        <p className="text-xs text-primary-600">
                          {planos.find(p => p.id === formData.plano)?.periodo}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-100">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                {step === 'conta' ? 'Voltar para login' : 'Voltar'}
              </button>

              {step === 'confirmacao' ? (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      Criar conta
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
                >
                  Continuar
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-500 mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
