import { useState, useEffect } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Sparkles,
    GraduationCap,
    FileSearch,
    CheckCircle2,
    Building2,
    LayoutGrid,
    Users,
    ArrowRight
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { NovoSetorDialog } from "@/components/setores/NovoSetorDialog";
import { NovoFuncionarioDialog } from "@/components/funcionarios/NovoFuncionarioDialog";
import { NovaEmpresaDialog } from "@/components/empresas/NovaEmpresaDialog";

export function OnboardingDrawer() {
    const { onboarding, refetch, isLoading } = useData();
    const [isOpen, setIsOpen] = useState(false);

    // Abrir automaticamente se o onboarding não estiver completo
    useEffect(() => {
        if (!isLoading && !onboarding.completouOnboarding) {
            const timer = setTimeout(() => setIsOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [onboarding.completouOnboarding, isLoading]);

    const steps = [
        {
            id: 'empresa',
            title: 'Perfil da Empresa',
            description: 'Dados básicos da sua organização.',
            completed: onboarding.empresaCriada,
            icon: Building2,
            action: <NovaEmpresaDialog trigger={<Button size="sm" variant="outline">Configurar</Button>} />
        },
        {
            id: 'setor',
            title: 'Estrutura de Setores',
            description: 'Cadastre os locais de trabalho (NR-1).',
            completed: onboarding.setorCadastrado,
            icon: LayoutGrid,
            disabled: !onboarding.empresaCriada,
            action: <NovoSetorDialog onSuccess={() => refetch()} trigger={<Button size="sm" variant={onboarding.empresaCriada ? "default" : "secondary"} disabled={!onboarding.empresaCriada}>Cadastrar</Button>} />
        },
        {
            id: 'funcionario',
            title: 'Primeiro Funcionário',
            description: 'Adicione colaboradores ao sistema.',
            completed: onboarding.funcionarioCadastrado,
            icon: Users,
            disabled: !onboarding.setorCadastrado,
            action: <NovoFuncionarioDialog onSuccess={() => refetch()} trigger={<Button size="sm" variant={onboarding.setorCadastrado ? "default" : "secondary"} disabled={!onboarding.setorCadastrado}>Adicionar</Button>} />
        },
        {
            id: 'vinculo',
            title: 'Vínculo Estrutural',
            description: 'Relacione funcionários aos setores.',
            completed: onboarding.vinculoSetorEfetivado,
            icon: ArrowRight,
            disabled: !onboarding.funcionarioCadastrado,
            action: <Button size="sm" variant={onboarding.funcionarioCadastrado ? "default" : "secondary"} disabled={!onboarding.funcionarioCadastrado} onClick={() => { /* Simula vinculo ou abre lista */ }}>Vincular</Button>
        },
        {
            id: 'treinamentos',
            title: 'Planejar Treinamentos',
            description: 'Defina as NRs iniciais dos colaboradores.',
            completed: false,
            icon: GraduationCap,
            disabled: !onboarding.vinculoSetorEfetivado,
            action: <Button size="sm" variant="outline" disabled={!onboarding.vinculoSetorEfetivado}>Agendar</Button>
        },
        {
            id: 'inventario',
            title: 'Inventário de Riscos',
            description: 'Gere o primeiro rascunho do seu PGR.',
            completed: false,
            icon: FileSearch,
            disabled: !onboarding.vinculoSetorEfetivado,
            action: <Button size="sm" variant="outline" disabled={!onboarding.vinculoSetorEfetivado}>Gerar</Button>
        }
    ];

    const completedCount = Object.values(onboarding).filter(v => v === true && typeof v === 'boolean').length - 1;
    const progress = (completedCount / 4) * 100;

    if (onboarding.completouOnboarding && !isOpen) return null;

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent side="right" className="sm:max-w-md border-l-primary-100">
                <SheetHeader className="pb-6 border-b">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-primary-100 p-1.5 rounded-lg">
                            <Sparkles className="w-5 h-5 text-primary-600" />
                        </div>
                        <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">Passo a Passo</span>
                    </div>
                    <SheetTitle className="text-2xl font-bold text-neutral-900">Configuração Inicial</SheetTitle>
                    <SheetDescription className="text-neutral-500">
                        Complete estas etapas para deixar seu ambiente NR-1 Pro pronto para uso.
                    </SheetDescription>
                </SheetHeader>

                <div className="py-8 space-y-8">
                    {/* Barra de Progresso */}
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="font-semibold text-neutral-700">Progresso Geral</span>
                            <span className="font-bold text-primary-600">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-neutral-100" />
                    </div>

                    {/* Lista de Passos */}
                    <div className="space-y-4">
                        {onboarding.completouOnboarding ? (
                            <div className="bg-success-50 border border-success-100 rounded-2xl p-6 text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-success-200">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-success-900 mb-2">Estrutura Pronta!</h3>
                                <p className="text-sm text-success-700 leading-relaxed mb-6">
                                    Sua empresa já possui setores e funcionários vinculados conforme a NR-1. Você está pronto para os próximos passos.
                                </p>
                                <Button className="w-full bg-success-600 hover:bg-success-700" onClick={() => setIsOpen(false)}>
                                    Ir para o Dashboard
                                </Button>
                            </div>
                        ) : (
                            steps.map((step, index) => (
                                <div
                                    key={step.id}
                                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${step.completed
                                        ? 'bg-success-50/50 border-success-100'
                                        : step.disabled
                                            ? 'bg-neutral-50/50 border-neutral-100 opacity-60'
                                            : 'bg-white border-neutral-200 shadow-sm'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${step.completed
                                        ? 'bg-success-500 text-white'
                                        : 'bg-neutral-100 text-neutral-400'
                                        }`}>
                                        {step.completed ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className={`text-sm font-bold ${step.completed ? 'text-success-700' : 'text-neutral-900'}`}>
                                                {index + 1}. {step.title}
                                            </h4>
                                            {step.completed && <span className="text-[10px] font-bold text-success-600 uppercase">OK</span>}
                                        </div>
                                        <p className="text-xs text-neutral-500 leading-relaxed mb-3">
                                            {step.description}
                                        </p>
                                        {!step.completed && !step.disabled && (
                                            <div className="flex items-center gap-2">
                                                {step.action}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                    <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                        <p className="text-xs text-primary-700 leading-relaxed">
                            <strong>Dica:</strong> Uma estrutura bem definida facilitará a geração automática do seu inventário de riscos.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
