import {
    CheckCircle2,
    ArrowRight,
    ShieldAlert,
    FileCheck,
    Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';

export function StatusJornada() {
    const { onboarding, metrics, riscos, regulatoryState, setIsOnboardingOpen } = useData();
    const risksMapped = (riscos || []).length > 0;

    // Se o motor ainda não carregou, mostramos um estado inicial ou nada
    if (!regulatoryState) return null;

    // Lógica estrita de fluxo (Flow Guards)
    const isStructureOk = onboarding.completouOnboarding;
    const isMappingOk = isStructureOk && risksMapped && regulatoryState.state !== 'MAPEAMENTO_PENDENTE';
    const isPgrOk = regulatoryState.progress >= 80;

    const journeySteps = [
        {
            id: 'estrutura',
            label: 'Estrutura Inicial',
            status: isStructureOk ? 'done' : 'doing',
            icon: Building2,
            description: isStructureOk ? 'Base cadastrada com sucesso.' : 'Configure empresa, setores e equipe.',
            action: !isStructureOk ? 'Abrir Guia' : null
        },
        {
            id: 'riscos',
            label: 'Mapeamento de Riscos',
            status: isMappingOk
                ? 'done'
                : (isStructureOk ? 'doing' : 'locked'),
            icon: ShieldAlert,
            description: risksMapped ? 'Identificação de perigos realizada.' : 'Identifique perigos e riscos por ambiente.',
            action: (!isMappingOk && isStructureOk) ? 'Mapear Riscos' : null
        },
        {
            id: 'gro',
            label: 'Inventário GRO / PGR',
            status: isPgrOk
                ? 'done'
                : (isMappingOk ? 'doing' : 'locked'),
            icon: FileCheck,
            description: 'Gere os documentos obrigatórios da NR-1.',
            action: (isMappingOk && !isPgrOk) ? 'Gerar PDF' : (isPgrOk ? 'Ver PDF' : null)
        }
    ];

    return (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
            <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-primary-600" />
                        Copiloto da Jornada NR-1
                    </h3>
                    <p className="text-xs text-neutral-500">{regulatoryState.description}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Agentes</span>
                        <div className="flex gap-1">
                            <AgentDot label="L" active={regulatoryState.agents.legal} />
                            <AgentDot label="F" active={regulatoryState.agents.fiscal} />
                            <AgentDot label="T" active={regulatoryState.agents.tecnico} />
                            <AgentDot label="E" active={regulatoryState.agents.evidencia} />
                        </div>
                    </div>
                    <div className="h-4 w-px bg-neutral-200" />
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Maturidade</span>
                        <div className="flex gap-1">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-1.5 rounded-full ${i === 1 && onboarding.completouOnboarding ? 'bg-success-500' :
                                        i === 2 && regulatoryState.progress >= 60 ? 'bg-success-500' :
                                            i === 3 && regulatoryState.progress === 100 ? 'bg-success-500' :
                                                'bg-neutral-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {journeySteps.map((step, idx) => {
                        const isDone = step.status === 'done';
                        const isDoing = step.status === 'doing';
                        const isLocked = step.status === 'locked';

                        return (
                            <div key={step.id} className="relative group">
                                <div className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 ${isDone ? 'bg-success-50/30 border-success-100' :
                                    isDoing ? 'bg-primary-50/30 border-primary-100 ring-1 ring-primary-100' :
                                        'bg-neutral-50/50 border-neutral-100'
                                    }`}>
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isDone ? 'bg-success-500 text-white' :
                                        isDoing ? 'bg-primary-600 text-white' :
                                            'bg-neutral-200 text-neutral-400'
                                        }`}>
                                        {isDone ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className={`text-sm font-bold truncate ${isLocked ? 'text-neutral-400' : 'text-neutral-900'
                                                }`}>
                                                {step.label}
                                            </h4>
                                            {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-success-600" />}
                                        </div>
                                        <p className="text-[11px] text-neutral-500 leading-snug mb-3">
                                            {step.description}
                                        </p>

                                        {step.action && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`h-7 px-2 text-[10px] font-bold uppercase tracking-tight gap-1 hover:bg-white ${isDoing ? 'text-primary-600' : 'text-neutral-600'
                                                    }`}
                                                onClick={() => {
                                                    if (step.id === 'estrutura') setIsOnboardingOpen(true);
                                                    if (step.id === 'riscos') window.location.hash = '#/app/setores';
                                                    if (step.id === 'gro') window.location.hash = '#/app/pgr';
                                                }}
                                            >
                                                {step.action}
                                                <ArrowRight className="w-3 h-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {idx < 2 && (
                                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                                        <ArrowRight className={`w-4 h-4 ${isDone ? 'text-success-300' : 'text-neutral-200'}`} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="px-6 py-3 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {['L', 'F', 'T', 'E'].map(agent => (
                            <div key={agent} className="w-5 h-5 rounded-full border-2 border-white bg-neutral-200 flex items-center justify-center overflow-hidden">
                                <span className="text-[8px] font-bold text-neutral-400">{agent}</span>
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] text-neutral-500 font-medium italic">
                        "O GRO deve ser mantido de forma contínua conforme NR-1.02"
                    </span>
                </div>
                {regulatoryState.state !== 'CONFORME_OURO' && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        {regulatoryState.label.toUpperCase()}: {regulatoryState.nextStep.toUpperCase()}
                    </span>
                )}
            </div>
        </div>
    );
}

function AgentDot({ label, active }: { label: string; active: boolean }) {
    return (
        <div
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold transition-all ${active ? 'bg-success-500 text-white shadow-sm' : 'bg-neutral-200 text-neutral-400'
                }`}
            title={active ? `Agente ${label} Validado` : `Agente ${label} Aguardando`}
        >
            {label}
        </div>
    );
}

