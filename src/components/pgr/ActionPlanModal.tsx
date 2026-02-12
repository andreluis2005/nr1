import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, Save, Trash2, Plus, AlertCircle, Bookmark, Users } from 'lucide-react';
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import type { Risco, MedidaControle } from '@/types';

interface ActionPlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    risco: Risco | null;
    onUpdate?: () => void;
}

export function ActionPlanModal({ isOpen, onClose, risco, onUpdate }: ActionPlanModalProps) {
    const { empresaSelecionada } = useSupabaseAuth();
    const [medidas, setMedidas] = useState<MedidaControle[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [novoTipo, setNovoTipo] = useState<string>('administrativa');
    const [novaDescricao, setNovaDescricao] = useState('');
    const [novoResponsavel, setNovoResponsavel] = useState('');
    const [novaDataPrevista, setNovaDataPrevista] = useState('');

    useEffect(() => {
        if (isOpen && risco) {
            fetchMedidas();
        } else {
            setMedidas([]);
            setIsAdding(false);
        }
    }, [isOpen, risco]);

    const fetchMedidas = async () => {
        if (!risco) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('medidas_controle')
                .select('*')
                .eq('risco_id', risco.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map snake_case to CamelCase manually since we don't have a transformer
            const mapped: MedidaControle[] = (data || []).map((m: any) => ({
                id: m.id,
                riscoId: m.risco_id,
                tipo: m.tipo,
                descricao: m.descricao,
                dataPrevista: m.data_prevista,
                dataConclusao: m.data_conclusao,
                responsavel: m.responsavel,
                status: m.status,
                eficaz: m.eficaz
            }));

            setMedidas(mapped);
        } catch (err) {
            console.error('Erro ao buscar medidas:', err);
            toast.error('Erro ao carregar plano de ação.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMedida = async () => {
        if (!risco || !empresaSelecionada) return;
        if (!novaDescricao.trim()) {
            toast.error('Descrição é obrigatória');
            return;
        }

        try {
            const { error } = await supabase
                .from('medidas_controle')
                .insert({
                    empresa_id: empresaSelecionada.empresa_id,
                    risco_id: risco.id,
                    tipo: novoTipo,
                    descricao: novaDescricao.trim(),
                    responsavel: novoResponsavel.trim() || null,
                    data_prevista: novaDataPrevista || null,
                    status: 'planejado'
                });

            if (error) throw error;

            toast.success('Medida adicionada ao plano!');
            setIsAdding(false);
            resetForm();
            fetchMedidas();
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error(err);
            toast.error('Erro ao salvar medida.');
        }
    };

    const handleConcluir = async (id: string) => {
        try {
            const hoje = new Date().toISOString().split('T')[0];
            const { error } = await supabase
                .from('medidas_controle')
                .update({
                    status: 'concluido',
                    data_conclusao: hoje
                })
                .eq('id', id);

            if (error) throw error;
            toast.success('Medida concluída!');
            fetchMedidas();
            if (onUpdate) onUpdate();
        } catch (err) {
            toast.error('Erro ao atualizar status.');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('medidas_controle')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success('Medida removida.');
            fetchMedidas();
            if (onUpdate) onUpdate();
        } catch (err) {
            toast.error('Erro ao remover medida.');
        }
    };

    const resetForm = () => {
        setNovoTipo('administrativa');
        setNovaDescricao('');
        setNovoResponsavel('');
        setNovaDataPrevista('');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'concluido': return 'bg-green-100 text-green-700 border-green-200';
            case 'atrasado': return 'bg-red-100 text-red-700 border-red-200';
            case 'em_andamento': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'concluido': return 'Concluído';
            case 'atrasado': return 'Atrasado';
            case 'em_andamento': return 'Em Andamento';
            default: return 'Planejado';
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Bookmark className="w-5 h-5 text-blue-600" />
                        Plano de Ação
                    </DialogTitle>
                    <DialogDescription>
                        Gerenciamento de medidas de controle para: <span className="font-semibold text-gray-900">{risco?.nome}</span>
                    </DialogDescription>
                </DialogHeader>

                {/* Legacy Data Warning */}
                {risco?.medidas_controle && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm flex gap-3 text-amber-800">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <div>
                            <p className="font-semibold">Medidas Legadas (Texto Livre)</p>
                            <p className="mt-1 opacity-90">{risco.medidas_controle}</p>
                            <p className="mt-2 text-xs opacity-75">Recomendação: Migre estas ações para o formato estruturado abaixo.</p>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* List of Measures */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Ações Estruturadas ({medidas.length})</h3>
                            {!isAdding && (
                                <Button size="sm" onClick={() => setIsAdding(true)} className="gap-2">
                                    <Plus className="w-4 h-4" /> Nova Medida
                                </Button>
                            )}
                        </div>

                        {loading ? (
                            <div className="text-center py-4 text-gray-500">Carregando...</div>
                        ) : medidas.length === 0 && !isAdding ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                <p className="text-gray-500">Nenhuma medida estruturada cadastrada.</p>
                            </div>
                        ) : (
                            medidas.map(medida => (
                                <div key={medida.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-blue-200 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="capitalize">{medida.tipo.replace('_', ' ')}</Badge>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusColor(medida.status)}`}>
                                                    {getStatusLabel(medida.status)}
                                                </span>
                                            </div>
                                            <p className="font-medium text-gray-900">{medida.descricao}</p>
                                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                                {medida.responsavel && (
                                                    <span className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" /> {medida.responsavel}
                                                    </span>
                                                )}
                                                {medida.dataPrevista && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> Prev: {new Date(medida.dataPrevista).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                                {medida.dataConclusao && (
                                                    <span className="flex items-center gap-1 text-green-600">
                                                        <CheckCircle className="w-3 h-3" /> Concluído: {new Date(medida.dataConclusao).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {medida.status !== 'concluido' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleConcluir(medida.id)}
                                                    title="Concluir Medida"
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(medida.id)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Form */}
                    {isAdding && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
                            <h4 className="font-semibold text-gray-900 mb-4">Nova Medida de Controle</h4>
                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tipo de Controle</Label>
                                        <Select value={novoTipo} onValueChange={setNovoTipo}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="eliminacao">Eliminação</SelectItem>
                                                <SelectItem value="substituicao">Substituição</SelectItem>
                                                <SelectItem value="engenharia">Engenharia</SelectItem>
                                                <SelectItem value="administrativa">Administrativa</SelectItem>
                                                <SelectItem value="epi">EPI</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Prazo Previsto</Label>
                                        <Input
                                            type="date"
                                            value={novaDataPrevista}
                                            onChange={e => setNovaDataPrevista(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Descrição da Medida</Label>
                                    <Textarea
                                        value={novaDescricao}
                                        onChange={e => setNovaDescricao(e.target.value)}
                                        placeholder="Descreva a ação a ser tomada..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Responsável (Nome/Cargo)</Label>
                                    <Input
                                        value={novoResponsavel}
                                        onChange={e => setNovoResponsavel(e.target.value)}
                                        placeholder="Ex: Téc. Segurança, Gerente de Planta"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 mt-2">
                                    <Button variant="outline" onClick={() => setIsAdding(false)}>Cancelar</Button>
                                    <Button onClick={handleSaveMedida} className="gap-2">
                                        <Save className="w-4 h-4" /> Salvar Medida
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
