import {
    LayoutGrid,
    Map,
    AlertTriangle,
    ShieldCheck,
    Plus,
    MoreVertical,
    ChevronRight,
    Info
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import type { Setor, Risco } from '@/context/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/Badge';
import { NovoSetorDialog } from '@/components/setores/NovoSetorDialog';
import { NovoRiscoDialog } from '@/components/setores/NovoRiscoDialog';

export function Setores() {
    const { setores, riscos, isLoading } = useData();

    // Agrupar riscos por setor
    const riscosPorSetor = (riscos || []).reduce((acc: Record<string, Risco[]>, risco: Risco) => {
        if (!acc[risco.setor_id]) acc[risco.setor_id] = [];
        acc[risco.setor_id].push(risco);
        return acc;
    }, {});

    if (isLoading) {
        return <div className="p-6">Carregando ambientes...</div>;
    }

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-primary-600" />
                        Ambientes e Setores
                    </h1>
                    <p className="text-neutral-500 mt-1">
                        Gerencie onde o trabalho acontece e identifique os riscos de cada local.
                    </p>
                </div>
                <NovoSetorDialog
                    trigger={<Button className="gap-2 shadow-sm"><Plus className="w-4 h-4" /> Novo Ambiente</Button>}
                />
            </div>

            {/* Info Card */}
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex gap-4 items-start">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                    <Info className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-semibold text-primary-900 text-sm">O Setor é a base da NR-1</h4>
                    <p className="text-primary-700 text-xs mt-1 max-w-2xl">
                        Para o sistema gerar o PGR corretamente, você deve mapear os riscos específicos de cada ambiente.
                        Comece cadastrando seus setores e depois use o botão "Mapear Riscos" em cada um.
                    </p>
                </div>
            </div>

            {/* Setores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {setores.map((setor: Setor) => {
                    const riscosSetor = riscosPorSetor[setor.id] || [];
                    const hasRiscos = riscosSetor.length > 0;

                    return (
                        <Card key={setor.id} className="group hover:border-primary-200 hover:shadow-md transition-all duration-300">
                            <CardHeader className="pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="bg-neutral-100 p-2 rounded-lg group-hover:bg-primary-50 transition-colors">
                                        <Map className="w-5 h-5 text-neutral-500 group-hover:text-primary-600" />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </div>
                                <CardTitle className="mt-3 text-lg">{setor.nome}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {setor.descricao || 'Sem descrição cadastrada.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Status de Riscos */}
                                <div className="flex items-center justify-between py-2 px-3 bg-neutral-50 rounded-lg border border-neutral-100">
                                    <div className="flex items-center gap-2">
                                        {hasRiscos ? (
                                            <ShieldCheck className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                        )}
                                        <span className="text-sm font-medium text-neutral-700">
                                            {hasRiscos ? `${riscosSetor.length} Riscos Mapeados` : 'Nenhum Risco'}
                                        </span>
                                    </div>
                                    <StatusBadge
                                        status={hasRiscos ? 'realizado' : 'pendente'}
                                        size="sm"
                                    />
                                </div>

                                <NovoRiscoDialog
                                    setorId={setor.id}
                                    setorNome={setor.nome}
                                    trigger={
                                        <Button
                                            variant={hasRiscos ? "outline" : "default"}
                                            className="w-full gap-2 group-hover:shadow-sm transition-all"
                                        >
                                            {hasRiscos ? 'Gerenciar Riscos' : 'Mapear Riscos'}
                                            <ChevronRight className="w-4 h-4" />
                                        </Button>
                                    }
                                />
                            </CardContent>
                        </Card>
                    );
                })}

                {/* Empty State / Quick Add */}
                {setores.length === 0 && (
                    <Card className="col-span-full border-dashed p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                            <LayoutGrid className="w-8 h-8 text-neutral-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-900">Nenhum ambiente cadastrado</h3>
                        <p className="text-neutral-500 max-w-xs mt-2">
                            Os setores são essenciais para organizar sua gestão de riscos. Comece agora!
                        </p>
                        <NovoSetorDialog
                            trigger={<Button className="mt-6 gap-2" variant="outline"><Plus className="w-4 h-4" /> Cadastrar Primeiro Setor</Button>}
                        />
                    </Card>
                )}
            </div>
        </div>
    );
}
