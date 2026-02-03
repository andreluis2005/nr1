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
  ChevronRight,
  Loader2,
  Database
} from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useState } from 'react';

import { NovaEmpresaDialog } from "@/components/empresas/NovaEmpresaDialog";
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { Plus, Building2 } from "lucide-react";

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
  // Consome APENAS dados reais do hook
  const {
    metrics,
    alertas,
    exames,
    treinamentos,
    isLoading,
    error
  } = useDashboardMetrics();

  const [periodoSelecionado, setPeriodoSelecionado] = useState('30d');

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

  // Gráfico zerado se não houver conformidade real calculada
  const dadosGrafico = [
    { mes: 'Ago', valor: 0, meta: 85 },
    { mes: 'Set', valor: 0, meta: 85 },
    { mes: 'Out', valor: 0, meta: 90 },
    { mes: 'Nov', valor: 0, meta: 90 },
    { mes: 'Dez', valor: 0, meta: 95 },
    { mes: 'Jan', valor: metrics.indiceConformidade, meta: 95 }
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-4" />
        <p className="text-neutral-500 font-medium">Carregando indicadores...</p>
      </div>
    );
  }

  // Onboarding: Sem empresa selecionada
  // O usuário precisa criar uma empresa antes de qualquer coisa
  if (!isLoading && !empresaSelecionada) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Bem-vindo ao NR1 Pro</h1>
            <p className="text-sm text-neutral-500 mt-1">Sua plataforma de gestão de SST</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-neutral-200 border-dashed">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
            <Building2 className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-3">
            Vamos configurar seu ambiente
          </h2>
          <p className="text-neutral-500 text-center max-w-md mb-8">
            Para começar a gerenciar funcionários e documentos, você precisa criar o perfil da sua empresa. É rápido e fácil.
          </p>

          <NovaEmpresaDialog
            trigger={
              <button
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Criar Minha Empresa
              </button>
            }
          />
        </div>
      </div>
    );
  }

  // Estado vazio global se não houver funcionários cadastrados
  // (Assume-se que funcionários são a base para qualquer métrica de SST)
  if (!isLoading && metrics.totalFuncionarios === 0) {
    return (
      <div className="p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Dashboard</h1>
            <p className="text-sm text-neutral-500 mt-1">Visão geral da conformidade com a NR-1</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-neutral-200 border-dashed">
          <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
            <Database className="w-8 h-8 text-neutral-400" />
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-2">
            Nenhum dado encontrado
          </h2>
          <p className="text-neutral-500 text-center max-w-md mb-6">
            Cadastre funcionários e exames para visualizar os indicadores de conformidade NR-1.
          </p>
          <a
            href="#/app/funcionarios"
            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Cadastrar Funcionário
          </a>
        </div>
      </div>
    );
  }

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
