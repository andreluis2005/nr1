import { createContext, useContext, useState, type ReactNode } from "react";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import type { RegulatoryEngineResult } from "@/domains/risks/nr1.engine";
import type {
    Metrics,
    Alerta,
    Exame,
    Treinamento,
    OnboardingStatus,
    Setor,
    Risco,
    MedidaControle, // Added
    Funcionario
} from "@/types";

export interface TechnicalExposureResult {
    totalRiscos: number;
    riscosCriticosCount: number;
    exposicaoTotal: number;
    exposicaoPorSetor: Record<string, number>;
    exposicaoPorFuncao: Record<string, number>;
    isCritico: boolean;
    inventory: any[];
}

export interface ExposureSnapshot {
    id: string;
    data_snapshot: string;
    exposicao_total: number;
    dados_setores: Record<string, number>;
}

interface DataContextType {
    metrics: Metrics;
    alertas: Alerta[];
    exames: Exame[];
    treinamentos: Treinamento[];
    funcionarios: Funcionario[];
    setores: Setor[];
    riscos: Risco[];
    medidasControle: MedidaControle[]; // Added
    onboarding: OnboardingStatus;
    regulatoryState: RegulatoryEngineResult | null;
    exposureData: TechnicalExposureResult | null;
    exposureHistory: ExposureSnapshot[];
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
        medidasControle, // Added
        onboarding,
        regulatoryState,
        exposureData,
        exposureHistory,
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
            medidasControle, // Added
            onboarding,
            regulatoryState,
            exposureData,
            exposureHistory,
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
