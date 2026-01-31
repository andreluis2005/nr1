import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar,
  FileText,
  Stethoscope,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useState } from 'react';

// Componente de métrica premium
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  trendValue, 
  icon: Icon, 
  color,
  onClick 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  onClick?: () => void;
}) {
  const colorStyles = {
    blue: 'from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-200/50',
    green: 'from-success-500/10 to-success-600/5 text-success-600 border-success-200/50',
    amber: 'from-warning-500/10 to-warning-600/5 text-warning-600 border-warning-200/50',
    red: 'from-danger-500/10 to-danger-600/5 text-danger-600 border-danger-200/50',
    purple: 'from-accent-purple/10 to-accent-purple/5 text-accent-purple border-accent-purple/20',
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
  const trendColor = trend === 'up' ? 'text-success-600' : trend === 'down' ? 'text-danger-600' : 'text-neutral-500';

  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden bg-white rounded-xl border border-neutral-150 p-5
        hover:shadow-lg hover:border-neutral-200 transition-all duration-300 cursor-pointer group
      `}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorStyles[color]} opacity-50`} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorStyles[color]} flex items-center justify-center`}>
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
              <TrendIcon className="w-3.5 h-3.5" />
              {trendValue}
            </div>
          )}
        </div>
        
        <div>
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-semibold text-neutral-900 mt-1 tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente de status card
function StatusCard({ 
  title, 
  subtitle, 
  icon: Icon, 
  color,
  children,
  action
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-150 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-medium text-neutral-900">{title}</h3>
          <p className="text-xs text-neutral-500">{subtitle}</p>
        </div>
      </div>
      {children}
      {action && (
        <a 
          href={action.href}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 mt-4 group"
        >
          {action.label}
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </a>
      )}
    </div>
  );
}

// Componente de alerta
function AlertItem({ alerta }: { alerta: any }) {
  const prioridadeStyles = {
    critica: 'bg-danger-50 border-danger-100 text-danger-700',
    alta: 'bg-warning-50 border-warning-100 text-warning-700',
    media: 'bg-amber-50 border-amber-100 text-amber-700',
    baixa: 'bg-neutral-50 border-neutral-100 text-neutral-600',
  };

  const prioridadeIcons = {
    critica: AlertCircle,
    alta: AlertTriangle,
    media: Clock,
    baixa: CheckCircle2,
  };

  const Icon = prioridadeIcons[alerta.prioridade as keyof typeof prioridadeIcons] || Clock;
  const style = prioridadeStyles[alerta.prioridade as keyof typeof prioridadeStyles] || prioridadeStyles.baixa;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${style}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{alerta.titulo}</p>
        <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{alerta.descricao}</p>
        <p className="text-2xs opacity-60 mt-2">
          {new Date(alerta.dataCriacao).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
        </p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { metrics, alertas, exames, treinamentos } = useApp();
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30d');

  const alertasRecentes = alertas.filter(a => a.status !== 'resolvido').slice(0, 4);

  const hoje = new Date();
  const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const examesProximos = exames.filter(e => {
    const vencimento = new Date(e.dataVencimento);
    return e.status === 'realizado' && vencimento <= trintaDias && vencimento >= hoje;
  }).slice(0, 5);

  const getCorConformidade = (indice: number) => {
    if (indice >= 90) return 'green' as const;
    if (indice >= 70) return 'amber' as const;
    return 'red' as const;
  };

  const dadosGrafico = [
    { mes: 'Ago', valor: 72, meta: 85 },
    { mes: 'Set', valor: 78, meta: 85 },
    { mes: 'Out', valor: 82, meta: 90 },
    { mes: 'Nov', valor: 85, meta: 90 },
    { mes: 'Dez', valor: 84, meta: 95 },
    { mes: 'Jan', valor: metrics.indiceConformidade, meta: 95 }
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Visão geral da conformidade com a NR-1
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
            className="px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="7d">Últimos 7 dias</option>
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 3 meses</option>
            <option value="12m">Último ano</option>
          </select>
          <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20">
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Funcionários Ativos"
          value={metrics.funcionariosAtivos}
          subtitle={`${metrics.totalFuncionarios} total cadastrado`}
          trend="up"
          trendValue="+12%"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Índice de Conformidade"
          value={`${metrics.indiceConformidade}%`}
          subtitle="Meta: 95%"
          trend={metrics.indiceConformidade >= 90 ? 'up' : 'down'}
          trendValue="+5%"
          icon={ShieldCheck}
          color={getCorConformidade(metrics.indiceConformidade)}
        />
        <MetricCard
          title="Alertas Pendentes"
          value={metrics.alertasPendentes}
          subtitle={`${metrics.alertasCriticos} críticos`}
          icon={AlertTriangle}
          color={metrics.alertasCriticos > 0 ? 'red' : 'amber'}
        />
        <MetricCard
          title="Próximos Vencimentos"
          value={metrics.examesAVencer + metrics.treinamentosVencidos}
          subtitle={`${metrics.examesVencidos} vencidos`}
          icon={Calendar}
          color={metrics.examesVencidos > 0 ? 'red' : 'amber'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compliance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-150 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Evolução da Conformidade</h2>
              <p className="text-sm text-neutral-500">Comparativo com meta estabelecida</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success-500" />
                <span className="text-neutral-600">Realizado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-400/50" />
                <span className="text-neutral-600">Meta</span>
              </div>
            </div>
          </div>
          
          {/* Chart */}
          <div className="h-64 flex items-end justify-between gap-3">
            {dadosGrafico.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-1 h-52">
                  <div 
                    className="flex-1 bg-gradient-to-t from-success-500 to-success-400 rounded-t-md transition-all duration-500 hover:opacity-80"
                    style={{ height: `${item.valor}%` }}
                    title={`${item.valor}%`}
                  />
                  <div 
                    className="w-1 bg-primary-400/30 rounded-t"
                    style={{ height: `${item.meta}%` }}
                    title={`Meta: ${item.meta}%`}
                  />
                </div>
                <span className="text-xs font-medium text-neutral-500">{item.mes}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Cards */}
        <div className="space-y-4">
          {/* PGR Status */}
          <StatusCard
            title="Status do PGR"
            subtitle="Programa de Gerenciamento de Riscos"
            icon={FileText}
            color="bg-accent-purple/10 text-accent-purple"
            action={{ label: 'Ver detalhes', href: '#/app/pgr' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${metrics.pgrStatus === 'atualizado' ? 'bg-success-500' : 'bg-warning-500'}`} />
                <span className="text-sm font-medium text-neutral-700">
                  {metrics.pgrStatus === 'atualizado' ? 'Atualizado' : 'Revisão Pendente'}
                </span>
              </div>
              <span className="text-xs text-neutral-400">v2.3</span>
            </div>
          </StatusCard>

          {/* Exames Status */}
          <StatusCard
            title="Exames Ocupacionais"
            subtitle="Controle de saúde dos colaboradores"
            icon={Stethoscope}
            color="bg-primary-500/10 text-primary-600"
            action={{ label: 'Gerenciar exames', href: '#/app/exames' }}
          >
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-danger-50 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-danger-600">{metrics.examesVencidos}</p>
                <p className="text-2xs text-danger-600 uppercase tracking-wide">Vencidos</p>
              </div>
              <div className="bg-warning-50 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-warning-600">{metrics.examesAVencer}</p>
                <p className="text-2xs text-warning-600 uppercase tracking-wide">&lt; 30 dias</p>
              </div>
              <div className="bg-success-50 rounded-lg p-2 text-center">
                <p className="text-lg font-semibold text-success-600">
                  {exames.filter(e => e.status === 'realizado').length}
                </p>
                <p className="text-2xs text-success-600 uppercase tracking-wide">Em dia</p>
              </div>
            </div>
          </StatusCard>

          {/* Treinamentos Status */}
          <StatusCard
            title="Treinamentos"
            subtitle="Capacitação em Normas Regulamentadoras"
            icon={GraduationCap}
            color="bg-warning-500/10 text-warning-600"
            action={{ label: 'Ver treinamentos', href: '#/app/treinamentos' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-2xl font-semibold text-neutral-900">
                    {treinamentos.filter(t => t.status === 'vigente').length}
                  </p>
                  <p className="text-xs text-neutral-500">Vigentes</p>
                </div>
                <div className="w-px h-10 bg-neutral-200" />
                <div>
                  <p className="text-2xl font-semibold text-danger-600">
                    {metrics.treinamentosVencidos}
                  </p>
                  <p className="text-xs text-neutral-500">Vencidos</p>
                </div>
              </div>
            </div>
          </StatusCard>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas Recentes */}
        <div className="bg-white rounded-xl border border-neutral-150">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Alertas Recentes</h2>
              <p className="text-sm text-neutral-500">Itens que precisam de atenção imediata</p>
            </div>
            <a 
              href="#/app/alertas" 
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
            >
              Ver todos
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
          <div className="p-5 space-y-3">
            {alertasRecentes.length > 0 ? (
              alertasRecentes.map((alerta) => (
                <AlertItem key={alerta.id} alerta={alerta} />
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-success-500" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-neutral-600 font-medium">Tudo em ordem!</p>
                <p className="text-xs text-neutral-400 mt-1">Nenhum alerta pendente</p>
              </div>
            )}
          </div>
        </div>

        {/* Exames Próximos */}
        <div className="bg-white rounded-xl border border-neutral-150">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Exames a Vencer</h2>
              <p className="text-sm text-neutral-500">Próximos 30 dias</p>
            </div>
            <a 
              href="#/app/exames" 
              className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 group"
            >
              Ver todos
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
          <div className="p-0">
            {examesProximos.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {examesProximos.map((exame) => (
                  <div key={exame.id} className="p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                        <Stethoscope className="w-4 h-4 text-primary-600" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{exame.funcionarioId}</p>
                        <p className="text-xs text-neutral-500">{exame.tipo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-danger-600">
                        {new Date(exame.dataVencimento).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-2xs text-neutral-400">
                        {Math.ceil((new Date(exame.dataVencimento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} dias
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-success-500" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-neutral-600 font-medium">Nenhum exame próximo do vencimento</p>
                <p className="text-xs text-neutral-400 mt-1">Todos os exames estão em dia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
