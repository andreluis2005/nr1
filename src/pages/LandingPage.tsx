import { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Bell, 
  Stethoscope, 
  GraduationCap, 
  BarChart3, 
  CheckCircle2,
  Menu,
  X,
  Users,
  Clock,
  AlertTriangle,
  ChevronRight,
  Star
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const features = [
  {
    icon: FileText,
    title: 'PGR Automático',
    description: 'Gere seu Programa de Gerenciamento de Riscos em minutos, baseado no seu CNAE. Atualizações automáticas conforme mudanças na empresa.',
    color: 'bg-blue-500'
  },
  {
    icon: Bell,
    title: 'Alertas Inteligentes',
    description: 'Receba alertas antes de vencer exames, treinamentos e prazos. Nunca mais seja pego de surpresa por uma fiscalização.',
    color: 'bg-orange-500'
  },
  {
    icon: Stethoscope,
    title: 'Exames Ocupacionais',
    description: 'Controle completo de ASO admissional, periódico, demissional e retorno. Integração com clínicas e eSocial.',
    color: 'bg-cyan-500'
  },
  {
    icon: GraduationCap,
    title: 'Treinamentos',
    description: 'Gerencie todas as capacitações obrigatórias das NRs. Controle de validade e reciclagens automáticas.',
    color: 'bg-purple-500'
  },
  {
    icon: BarChart3,
    title: 'Relatórios Prontos',
    description: 'Gere relatórios profissionais para fiscalização em um clique. PDF e Excel prontos para o MTE.',
    color: 'bg-green-500'
  },
  {
    icon: Shield,
    title: 'Integração eSocial',
    description: 'Envie dados diretamente para o eSocial. Evite erros de digitação e garanta conformidade.',
    color: 'bg-indigo-500'
  }
];

const plans = [
  {
    name: 'Starter',
    price: 5,
    description: 'Para pequenas empresas começando',
    features: [
      'PGR Básico',
      'Alertas por email',
      'Controle de exames',
      'Até 50 funcionários',
      'Suporte por email'
    ],
    cta: 'Começar Grátis',
    popular: false
  },
  {
    name: 'Business',
    price: 8,
    description: 'Para empresas em crescimento',
    features: [
      'PGR Completo',
      'Alertas inteligentes',
      'Exames e treinamentos',
      'Relatórios avançados',
      'Integração eSocial',
      'Até 500 funcionários',
      'Suporte prioritário'
    ],
    cta: 'Começar Grátis',
    popular: true
  },
  {
    name: 'Enterprise',
    price: null,
    description: 'Para grandes organizações',
    features: [
      'Tudo do Business',
      'API de integração',
      'SSO e autenticação',
      'SLA garantido',
      'Funcionários ilimitados',
      'Suporte dedicado',
      'Onboarding personalizado'
    ],
    cta: 'Falar com Vendas',
    popular: false
  }
];

const testimonials = [
  {
    name: 'Carlos Silva',
    role: 'Diretor de Operações',
    company: 'Metalúrgica Silva',
    content: 'O NR1 Pro transformou nossa gestão de SST. Antes usávamos planilhas e sempre tínhamos alguma coisa vencendo. Agora tudo está organizado e temos alertas antecipados.',
    rating: 5
  },
  {
    name: 'Ana Paula Ferreira',
    role: 'Gerente de RH',
    company: 'Construtora Horizonte',
    content: 'Economizamos muito tempo com os relatórios automáticos. O que levava dias agora leva minutos. E o suporte é excelente!',
    rating: 5
  },
  {
    name: 'Roberto Mendes',
    role: 'Técnico de Segurança',
    company: 'Indústria Fortaleza',
    content: 'Finalmente uma ferramenta que entende a realidade das empresas brasileiras. A integração com eSocial é um diferencial enorme.',
    rating: 5
  }
];

const stats = [
  { value: '1.000+', label: 'Empresas ativas' },
  { value: '500K+', label: 'Funcionários gerenciados' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9/5', label: 'Avaliação' }
];

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">NR1 Pro</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Funcionalidades</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">Preços</a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">Depoimentos</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <a 
                href="#/login"
                className="text-neutral-600 hover:text-neutral-900 font-medium"
              >
                Entrar
              </a>
              <a 
                href="#/signup"
                className="px-4 py-2 bg-primary-600 rounded-lg text-white font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
              >
                Começar Grátis
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block py-2 text-gray-600">Funcionalidades</a>
              <a href="#pricing" className="block py-2 text-gray-600">Preços</a>
              <a href="#testimonials" className="block py-2 text-gray-600">Depoimentos</a>
              <a 
                href="#/signup"
                className="w-full py-2 bg-primary-600 rounded-lg text-white font-medium text-center block"
              >
                Começar Grátis
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm font-medium mb-6">
                <Star className="w-4 h-4" />
                Nova versão 2.0 disponível
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Cumpra a <span className="text-blue-600">NR-1</span> sem dor de cabeça
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                PGR que se atualiza sozinho, alertas que previnem multas, e tudo integrado com eSocial. 
                A gestão de SST que sua empresa precisa.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <a 
                  href="#/signup"
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 rounded-xl text-white font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
                >
                  <Shield className="w-5 h-5" />
                  Começar Gratuitamente
                </a>
                <button 
                  onClick={() => setShowDemo(true)}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-semibold hover:border-gray-300 transition-colors"
                >
                  <Clock className="w-5 h-5" />
                  Agendar Demo
                </button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  14 dias grátis
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Sem cartão de crédito
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Setup em 5 minutos
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl transform rotate-3 opacity-20" />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <span className="text-sm text-gray-500 ml-2">NR1 Pro - Dashboard</span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Funcionários</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">127</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-600">Conformidade</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">87%</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-gray-700">Alertas Recentes</span>
                      <span className="text-sm text-blue-600">Ver todos</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Exame vencido</p>
                          <p className="text-xs text-gray-500">Pedro Costa - 2 dias</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                        <Clock className="w-5 h-5 text-yellow-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Treinamento em 5 dias</p>
                          <p className="text-xs text-gray-500">NR-10 - João Silva</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-white">{stat.value}</p>
                <p className="mt-2 text-gray-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Tudo que você precisa para estar em conformidade
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Uma plataforma completa para gestão de Segurança e Saúde Ocupacional
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Como funciona
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Comece em minutos, não em semanas
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Cadastre sua empresa', desc: 'Informe CNPJ e CNAE para começar' },
              { step: '2', title: 'Importe funcionários', desc: 'Via planilha ou integração eSocial' },
              { step: '3', title: 'Gere o PGR', desc: 'Automático baseado no seu CNAE' },
              { step: '4', title: 'Acompanhe alertas', desc: 'Receba notificações e fique em dia' }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <span className="text-xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Planos simples e transparentes
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Escolha o plano ideal para sua empresa
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-white rounded-2xl p-8 border-2 ${
                  plan.popular ? 'border-blue-600' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                      Mais Popular
                    </span>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-2 text-gray-500">{plan.description}</p>
                <div className="mt-6">
                  {plan.price ? (
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">R$ {plan.price}</span>
                      <span className="ml-2 text-gray-500">/func/mês</span>
                    </div>
                  ) : (
                    <div className="text-2xl font-bold text-gray-900">Sob consulta</div>
                  )}
                </div>
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a 
                  href="#/signup"
                  className={`w-full mt-8 py-3 rounded-xl font-semibold transition-colors text-center block ${
                    plan.popular 
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/20' 
                      : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              O que nossos clientes dizem
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Empresas que confiam no NR1 Pro
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-blue-600">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role} - {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 sm:p-12 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Pronto para simplificar sua conformidade?
            </h2>
            <p className="mt-4 text-xl text-blue-100">
              Junte-se a mais de 1.000 empresas que já confiam no NR1 Pro
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#/signup"
                className="flex items-center justify-center gap-2 px-8 py-4 bg-white rounded-xl text-primary-600 font-semibold hover:bg-neutral-50 transition-colors shadow-lg"
              >
                <Shield className="w-5 h-5" />
                Começar Gratuitamente
              </a>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                14 dias grátis
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Setup em 5 minutos
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl">NR1 Pro</span>
              </div>
              <p className="text-gray-400">
                A plataforma completa para gestão de compliance com a NR-1.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2026 NR1 Pro. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Demo Dialog */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Agendar Demonstração</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-gray-600">
              Preencha seus dados e nossa equipe entrará em contato para agendar uma demo personalizada.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input 
                type="text" 
                placeholder="Seu nome"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                placeholder="seu@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <input 
                type="text" 
                placeholder="Nome da empresa"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input 
                type="tel" 
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <button 
              onClick={() => setShowDemo(false)}
              className="w-full py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Solicitar Demonstração
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
