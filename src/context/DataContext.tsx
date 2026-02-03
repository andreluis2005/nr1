import { createContext, useContext, useState, type ReactNode } from "react";

// --- Interfaces para Compatibilidade com a UI ---
export interface Alerta {
    id: string;
    titulo: string;
    descricao: string;
    prioridade: 'baixa' | 'media' | 'alta' | 'critica';
    status: 'pendente' | 'em_andamento' | 'resolvido';
    dataCriacao: string;
}

export interface Exame {
    id: string;
    funcionarioId: string;
    tipo: string;
    status: 'vencido' | 'pendente' | 'realizado';
    dataVencimento: string;
}

export interface Treinamento {
    id: string;
    nr: string;
    status: 'vencido' | 'vigente';
    dataVencimento: string;
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

interface DataContextType {
    metrics: Metrics;
    alertas: Alerta[];
    exames: Exame[];
    treinamentos: Treinamento[];
}

// --- Mocks Iniciais ---
const mockData: DataContextType = {
    metrics: {
        totalFuncionarios: 156,
        funcionariosAtivos: 142,
        indiceConformidade: 88,
        alertasPendentes: 3,
        alertasCriticos: 1,
        examesVencidos: 5,
        examesAVencer: 8,
        treinamentosVencidos: 4,
        pgrStatus: 'atencao'
    },
    alertas: [
        { id: '1', titulo: 'PGR Vencendo', descricao: 'O PGR da unidade Matriz vence em 15 dias.', prioridade: 'alta', status: 'pendente', dataCriacao: new Date().toISOString() },
        { id: '2', titulo: 'Treinamento NR-35', descricao: 'Vencimento de treinamentos de altura.', prioridade: 'critica', status: 'pendente', dataCriacao: new Date().toISOString() },
    ],
    exames: [],
    treinamentos: [],
};

const DataContext = createContext<DataContextType>(mockData);

export function DataProvider({ children }: { children: ReactNode }) {
    const [data] = useState<DataContextType>(mockData);

    return (
        <DataContext.Provider value={data}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData deve ser usado dentro de um DataProvider");
    }
    return context;
}
