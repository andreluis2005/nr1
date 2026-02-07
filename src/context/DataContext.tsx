import { createContext, useContext, useState, type ReactNode } from "react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import type { RegulatoryEngineResult } from "@/domains/risks/nr1.engine";

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

export interface Setor {
    id: string;
    nome: string;
    descricao?: string;
    created_at: string;
}

export interface Risco {
    id: string;
    setor_id: string;
    categoria: 'fisico' | 'quimico' | 'biologico' | 'ergonomico' | 'acidente';
    nome: string;
    descricao?: string;
    severidade: number;
    probabilidade: number;
    medidas_controle?: string;
    status: string;
}

export interface TechnicalExposureResult {
    totalRiscos: number;
    riscosCriticosCount: number;
    exposicaoTotal: number;
    exposicaoPorSetor: Record<string, number>;
    exposicaoPorFuncao: Record<string, number>;
    isCritico: boolean;
    inventory: any[];
}

export interface Metrics {
    totalFuncionarios: number;
    funcionariosAtivos: number;
    alertasPendentes: number;
    alertasCriticos: number;
    examesVencidos: number;
    examesAVencer: number;
    treinamentosVencidos: number;
}

export interface OnboardingStatus {
    empresaCriada: boolean;
    setorCadastrado: boolean;
    funcionarioCadastrado: boolean;
    completouOnboarding: boolean;
}

interface DataContextType {
    metrics: Metrics;
    alertas: Alerta[];
    exames: Exame[];
    treinamentos: Treinamento[];
    funcionarios: Funcionario[];
    setores: Setor[];
    riscos: Risco[];
    onboarding: OnboardingStatus;
    regulatoryState: RegulatoryEngineResult | null;
    exposureData: TechnicalExposureResult | null;
    isLoading: boolean;
    refetch: () => Promise<void>;
    isOnboardingOpen: boolean;
    setIsOnboardingOpen: (open: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Provider Real ---
export function DataProvider({ children }: { children: ReactNode }) {
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const {
        metrics,
        alertas,
        exames,
        treinamentos,
        funcionarios,
        setores,
        riscos,
        onboarding,
        regulatoryState,
        exposureData,
        isLoading,
        refetch
    } = useDashboardMetrics();

    return (
        <DataContext.Provider value={{
            metrics,
            alertas,
            exames,
            treinamentos,
            funcionarios,
            setores,
            riscos,
            onboarding,
            regulatoryState,
            exposureData,
            isLoading,
            refetch,
            isOnboardingOpen,
            setIsOnboardingOpen
        }}>
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
