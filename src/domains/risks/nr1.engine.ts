/**
 * NR-1 Risk Engine
 * Núcleo de inteligência para avaliação de riscos ocupacionais
 * Baseado na NR-1 e GRO/PGR
 */

export type NivelRisco = "baixo" | "medio" | "alto";

export interface RiscoIdentificado {
    id: string;
    descricao: string;
    nivel: NivelRisco;
    exigeAcaoImediata: boolean;
}

export interface AvaliacaoNR1Input {
    cnae: string;
    numeroFuncionarios: number;
    possuiPGR: boolean;
    possuiInventarioRiscos: boolean;
    possuiPlanoAcao: boolean;
}

export interface AvaliacaoNR1Result {
    statusConformidade: "conforme" | "parcial" | "nao_conforme";
    riscos: RiscoIdentificado[];
}

/**
 * Avalia conformidade básica com a NR-1
 */
export function avaliarNR1(
    input: AvaliacaoNR1Input
): AvaliacaoNR1Result {
    const riscos: RiscoIdentificado[] = [];

    if (!input.possuiPGR) {
        riscos.push({
            id: "pgr-ausente",
            descricao: "Empresa não possui PGR formalizado",
            nivel: "alto",
            exigeAcaoImediata: true,
        });
    }

    if (!input.possuiInventarioRiscos) {
        riscos.push({
            id: "inventario-ausente",
            descricao: "Inventário de riscos inexistente ou desatualizado",
            nivel: "alto",
            exigeAcaoImediata: true,
        });
    }

    if (!input.possuiPlanoAcao) {
        riscos.push({
            id: "plano-acao-ausente",
            descricao: "Plano de ação do PGR não definido",
            nivel: "medio",
            exigeAcaoImediata: false,
        });
    }

    const statusConformidade =
        riscos.length === 0
            ? "conforme"
            : riscos.some(r => r.nivel === "alto")
                ? "nao_conforme"
                : "parcial";

    return {
        statusConformidade,
        riscos,
    };
}
