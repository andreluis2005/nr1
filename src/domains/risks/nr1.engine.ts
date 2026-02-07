/**
 * NR-1 Regulatory Engine (Contrato Ouro)
 * Núcleo centralizado para determinação do estado de conformidade NR-1.
 * Este motor é a ÚNICA fonte de verdade para o status regulatório do sistema.
 */

export type RegulatoryState =
    | "ESTRUTURA_INCOMPLETA"
    | "ESTRUTURA_OK"
    | "MAPEAMENTO_PENDENTE"
    | "INVENTARIO_PENDENTE"
    | "CONFORME_PARCIAL"
    | "CONFORME_OURO"
    | "ALERTA_CRITICO";

export interface RegulatoryEngineInput {
    empresaVerificada: boolean;
    totalSetores: number;
    totalFuncionarios: number;
    setoresSemRisco: number;
    totalRiscos: number;
    pgrAtivo: boolean;
    pgrVencido: boolean;
    examesVencidos: number;
    alertasCriticos: number;
    medidasPendentes: number;
}

export interface RegulatoryEngineResult {
    state: RegulatoryState;
    label: string;
    description: string;
    color: string;
    progress: number;
    agents: {
        legal: boolean;
        fiscal: boolean;
        tecnico: boolean;
        evidencia: boolean;
    };
    nextStep: string;
}

const STATE_CONFIG: Record<RegulatoryState, { label: string; description: string; color: string; progress: number; nextStep: string }> = {
    ESTRUTURA_INCOMPLETA: {
        label: "Estrutura Incompleta",
        description: "Cadastro inicial pendente (Empresa, Setores ou Equipe).",
        color: "#EF4444", // Vermelho
        progress: 10,
        nextStep: "Completar cadastro inicial no Guia"
    },
    ESTRUTURA_OK: {
        label: "Estrutura OK",
        description: "Cadastro base concluído. Pronto para iniciar o mapeamento.",
        color: "#FBBF24", // Amarelo
        progress: 25,
        nextStep: "Iniciar Mapeamento de Riscos"
    },
    MAPEAMENTO_PENDENTE: {
        label: "Mapeamento Pendente",
        description: "Existem ambientes de trabalho sem riscos mapeados.",
        color: "#FBBF24", // Amarelo
        progress: 40,
        nextStep: "Vincular riscos aos setores restantes"
    },
    INVENTARIO_PENDENTE: {
        label: "Inventário Pendente",
        description: "Riscos mapeados, mas PGR/GRO ainda não foi gerado ou validado.",
        color: "#F97316", // Laranja
        progress: 60,
        nextStep: "Gerar e Validar Inventário de Riscos"
    },
    CONFORME_PARCIAL: {
        label: "Conforme Parcial",
        description: "PGR ativo, mas com medidas pendentes ou exames vencendo.",
        color: "#3B82F6", // Azul
        progress: 80,
        nextStep: "Implementar controles e atualizar exames"
    },
    CONFORME_OURO: {
        label: "Conforme Ouro",
        description: "100% de conformidade detectada. Monitoramento contínuo ativo.",
        color: "#10B981", // Verde
        progress: 100,
        nextStep: "Manter monitoramento de rotina"
    },
    ALERTA_CRITICO: {
        label: "Alerta Crítico",
        description: "Risco grave detectado ou conformidade legal interrompida.",
        color: "#EF4444", // Vermelho
        progress: 100,
        nextStep: "Intervenção técnica imediata necessária"
    }
};

/**
 * Avalia o estado regulatório baseado no Contrato Ouro
 */
export function evaluateRegulatoryState(input: RegulatoryEngineInput): RegulatoryEngineResult {
    let state: RegulatoryState = "ESTRUTURA_INCOMPLETA";

    // 1. Verificação de Alerta Crítico (Prioridade Máxima)
    if (input.alertasCriticos > 0 || (input.pgrAtivo && input.pgrVencido)) {
        state = "ALERTA_CRITICO";
    }
    // 2. Fluxo Normal de Estados
    else if (!input.empresaVerificada || input.totalSetores === 0 || input.totalFuncionarios === 0) {
        state = "ESTRUTURA_INCOMPLETA";
    }
    else if (input.totalRiscos === 0) {
        state = "ESTRUTURA_OK";
    }
    else if (input.setoresSemRisco > 0) {
        state = "MAPEAMENTO_PENDENTE";
    }
    else if (!input.pgrAtivo) {
        state = "INVENTARIO_PENDENTE";
    }
    else if (input.examesVencidos > 0 || input.medidasPendentes > 0) {
        state = "CONFORME_PARCIAL";
    }
    else {
        state = "CONFORME_OURO";
    }

    const config = STATE_CONFIG[state];

    return {
        state,
        ...config,
        agents: {
            legal: input.empresaVerificada && input.pgrAtivo && !input.pgrVencido,
            fiscal: input.totalFuncionarios > 0 && input.examesVencidos === 0,
            tecnico: input.totalRiscos > 0 && input.setoresSemRisco === 0,
            evidencia: input.medidasPendentes === 0 && input.examesVencidos === 0
        }
    };
}
