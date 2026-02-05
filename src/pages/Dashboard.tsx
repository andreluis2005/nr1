import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  FileText,
  Stethoscope,
  Loader2
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useState } from 'react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { OnboardingDrawer } from "@/components/dashboard/OnboardingDrawer";
import { StatusJornada } from "@/components/dashboard/StatusJornada";
import { MetricCard } from "@/components/MetricCard";
import type { LucideIcon } from 'lucide-react';

// Interfaces auxiliares
interface StatusCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  children: React.ReactNode;
  action?: {
    label: string;
    href: string;
  };
}

function StatusCard({ title, subtitle, icon: Icon, color, children, action }: StatusCardProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-150 p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">{title}</h3>
            <p className="text-xs text-neutral-500">{subtitle}</p>
          </div>
        </div>
        {action && (
          <a
            href={action.href}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-2.5 py-1.5 rounded-full transition-colors"
          >
            {action.label}
          </a>
        )}
      </div>
      {children}
    </div>
  );
}

interface AlertItemProps {
  alerta: {
    id: string;
    titulo: string;
    descricao: string;
    prioridade: 'baixa' | 'media' | 'alta' | 'critica';
    dataCriacao: string;
  };
}

function AlertItem({ alerta }: AlertItemProps) {
  const getPrioridadeColor = (p: string) => {
    switch (p) {
      case 'critica': return 'bg-red-50 text-red-700 border-red-100';
      case 'alta': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'media': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      default: return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="flex gap-3 p-3 rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors bg-white">
      <div className={`w-1 shrink-0 rounded-full ${alerta.prioridade === 'critica' ? 'bg-red-500' :
        alerta.prioridade === 'alta' ? 'bg-orange-500' :
          alerta.prioridade === 'media' ? 'bg-yellow-500' : 'bg-blue-500'
        }`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-medium text-neutral-900 truncate">{alerta.titulo}</h4>
          <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${getPrioridadeColor(alerta.prioridade)}`}>
            {alerta.prioridade}
          </span>
        </div>
        <p className="text-xs text-neutral-500 line-clamp-1">{alerta.descricao}</p>
        <p className="text-[10px] text-neutral-400 mt-1.5">
          {new Date(alerta.dataCriacao).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { empresaSelecionada } = useSupabaseAuth();
  const {
    metrics,
    alertas,
    exames,
    isLoading
  } = useData();


  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
        <p className="text-neutral-500 font-medium">Carregando indicadores...</p>
      </div>
    );
  }

  const alertasLista = Array.isArray(alertas) ? alertas : [];
  const alertasRecentes = alertasLista.filter(a => a.status !== 'resolvido').slice(0, 4);

  const hoje = new Date();
  const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);

  const examesLista = Array.isArray(exames) ? exames : [];
  const examesProximos = examesLista.filter(e => {
    const vencimento = new Date(e.dataVencimento);
    return e.status === 'realizado' && vencimento <= trintaDias && vencimento >= hoje;
  }).slice(0, 5);

  const getCorConformidade = (indice: number) => {
    if (indice >= 90) return 'green' as const;
    if (indice >= 70) return 'amber' as const;
    return 'red' as const;
  };

  const dadosGrafico = [
    { mes: 'Jan', valor: metrics.indiceConformidade, meta: 95 }
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <OnboardingDrawer />

      <StatusJornada />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Olá, {empresaSelecionada?.empresa?.nome_fantasia || 'Bem-vindo'}! 🚀
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sua conformidade SST em tempo real.
          </p>
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
          onClick={() => window.location.hash = '#/app/funcionarios'}
        />
        <MetricCard
          title="Índice de Conformidade"
          value={`${metrics.indiceConformidade}%`}
          subtitle="Meta: 95%"
          trend={metrics.indiceConformidade >= 90 ? 'up' : 'down'}
          trendValue="+5%"
          icon={ShieldCheck}
          color={getCorConformidade(metrics.indiceConformidade)}
          onClick={() => window.location.hash = '#/app/pgr'}
        />
        <MetricCard
          title="Alertas Pendentes"
          value={metrics.alertasPendentes}
          subtitle={`${metrics.alertasCriticos} críticos`}
          icon={AlertTriangle}
          color={metrics.alertasCriticos > 0 ? 'red' : 'amber'}
          onClick={() => window.location.hash = '#/app/alertas'}
        />
        <MetricCard
          title="Próximos Vencimentos"
          value={metrics.examesAVencer + metrics.treinamentosVencidos}
          subtitle={`${metrics.examesVencidos} vencidos`}
          icon={Calendar}
          color={metrics.examesVencidos > 0 ? 'red' : 'amber'}
          onClick={() => window.location.hash = '#/app/exames'}
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
          </div>

          {/* Chart */}
          <div className="h-64 flex items-end justify-between gap-3 px-4">
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
          <StatusCard
            title="Status do PGR"
            subtitle="Programa de Gerenciamento de Riscos"
            icon={FileText}
            color="bg-accent-purple/10 text-accent-purple"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${metrics.pgrStatus === 'atualizado' ? 'bg-success-500' : 'bg-warning-500'}`} />
                <span className="text-sm font-medium text-neutral-700">
                  {metrics.pgrStatus === 'atualizado' ? 'Atualizado' : 'Revisão Pendente'}
                </span>
              </div>
            </div>
          </StatusCard>

          <StatusCard
            title="Exames Ocupacionais"
            subtitle="Controle de saúde dos colaboradores"
            icon={Stethoscope}
            color="bg-primary-500/10 text-primary-600"
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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-neutral-150">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Alertas Recentes</h2>
          </div>
          <div className="p-5 space-y-3">
            {alertasRecentes.length > 0 ? (
              alertasRecentes.map((alerta) => (
                <AlertItem key={alerta.id} alerta={alerta} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-neutral-500">Nenhum alerta pendente</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-150">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Exames a Vencer</h2>
          </div>
          <div className="p-5">
            {examesProximos.length > 0 ? (
              <div className="space-y-3">
                {examesProximos.map((exame) => (
                  <div key={exame.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{exame.tipo}</p>
                      <p className="text-xs text-neutral-500">{new Date(exame.dataVencimento).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-bold text-danger-600 tracking-tight">Vence em breve</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 font-medium">
                Tudo em dia!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
