import { createContext, useContext, type ReactNode } from "react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";

// --- Interfaces para Compatibilidade com a UI ---
export interface Alerta {
    id: string;
    titulo: string;
    descricao: string;
    prioridade: 'baixa' | 'media' | 'alta' | 'critica';
    status: 'pendente' | 'em_andamento' | 'resolvido';
    dataCriacao: string;
}

export interface Funcionario {
    id: string;
    nome_completo: string;
    matricula: string;
    status: string;
}

export interface Exame {
    id: string;
    funcionarioId: string;
    tipo: string;
    status: 'vencido' | 'pendente' | 'realizado';
    dataRealizacao: string;
    dataVencimento: string;
}

export interface Treinamento {
    id: string;
    funcionarioId: string;
    nr: string;
    descricao: string;
    status: 'vencido' | 'vigente' | 'agendado';
    dataRealizacao: string;
    dataVencimento: string;
    cargaHoraria?: number;
}

export interface Metrics {
    totalFuncionarios: number;
    funcionariosAtivos: number;
    indiceConformidade: number;
    alertasPendentes: number;
    alertasCriticos: number;
    examesVencidos: number;
    examesAVencer: number;
    treinamentosVencidos: number;
    pgrStatus: 'atualizado' | 'atencao' | 'vencido';
}

export interface OnboardingStatus {
    empresaCriada: boolean;
    setorCadastrado: boolean;
    funcionarioCadastrado: boolean;
    vinculoSetorEfetivado: boolean;
    treinamentosPlanejados: boolean;
    inventarioGerado: boolean;
    completouOnboarding: boolean;
}

interface DataContextType {
    metrics: Metrics;
    alertas: Alerta[];
    exames: Exame[];
    treinamentos: Treinamento[];
    funcionarios: Funcionario[];
    onboarding: OnboardingStatus;
    isLoading: boolean;
    refetch: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Provider Real ---
export function DataProvider({ children }: { children: ReactNode }) {
    const {
        metrics,
        alertas,
        exames,
        treinamentos,
        funcionarios,
        onboarding,
        isLoading,
        refetch
    } = useDashboardMetrics();

    return (
        <DataContext.Provider value={{ metrics, alertas, exames, treinamentos, funcionarios, onboarding, isLoading, refetch }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error("useData deve ser usado dentro de um DataProvider");
    }
    return context;
}
