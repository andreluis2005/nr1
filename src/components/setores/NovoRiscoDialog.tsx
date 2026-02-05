import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Loader2, ShieldCheck, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { useData } from "@/context/DataContext";

interface NovoRiscoDialogProps {
    setorId: string;
    setorNome: string;
    onSuccess?: () => void;
    trigger?: React.ReactNode;
}

const CATEGORIAS = [
    { value: 'fisico', label: 'Físico', color: 'text-blue-600' },
    { value: 'quimico', label: 'Químico', color: 'text-red-500' },
    { value: 'biologico', label: 'Biológico', color: 'text-green-600' },
    { value: 'ergonomico', label: 'Ergonômico', color: 'text-yellow-600' },
    { value: 'acidente', label: 'Acidente', color: 'text-orange-600' },
];

export function NovoRiscoDialog({ setorId, setorNome, onSuccess, trigger }: NovoRiscoDialogProps) {
    const { empresaSelecionada } = useSupabaseAuth();
    const { refetch } = useData();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [categoria, setCategoria] = useState<string>('');
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [severidade, setSeveridade] = useState([1]);
    const [probabilidade, setProbabilidade] = useState([1]);
    const [medidas, setMedidas] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!empresaSelecionada?.empresa_id) {
            toast.error("Nenhuma empresa selecionada.");
            return;
        }

        if (!categoria || !nome.trim()) {
            toast.error("Categoria e Nome são obrigatórios.");
            return;
        }

        setIsLoading(true);

        try {
            const { error } = await (supabase as any)
                .from('riscos')
                .insert({
                    empresa_id: empresaSelecionada.empresa_id,
                    setor_id: setorId,
                    categoria,
                    nome: nome.trim(),
                    descricao: descricao.trim(),
                    severidade: severidade[0],
                    probabilidade: probabilidade[0],
                    medidas_controle: medidas.trim()
                });

            if (error) throw error;

            toast.success("Risco mapeado com sucesso!");
            setOpen(false);
            resetForm();
            if (onSuccess) onSuccess();
            refetch();
        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao salvar risco.");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setCategoria('');
        setNome('');
        setDescricao('');
        setSeveridade([1]);
        setProbabilidade([1]);
        setMedidas('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="default" className="gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Mapear Risco
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                            Mapeamento de Risco - {setorNome}
                        </DialogTitle>
                        <DialogDescription>
                            Identifique perigos e defina medidas de controle conforme a NR-1.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-5 py-6">
                        {/* Categoria */}
                        <div className="grid gap-2">
                            <Label htmlFor="categoria">Qual a categoria do risco? *</Label>
                            <Select value={categoria} onValueChange={setCategoria} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a categoria..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIAS.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            <span className={cat.color}>{cat.label}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Nome do Risco */}
                        <div className="grid gap-2">
                            <Label htmlFor="nome">Agente de Risco / Perigo *</Label>
                            <Input
                                id="nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Ex: Ruído contínuo, Poeira, Postura inadequada"
                                required
                            />
                        </div>

                        {/* Matriz de Risco Simplificada */}
                        <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                            <div className="space-y-3">
                                <Label className="text-xs uppercase tracking-wider text-neutral-500">Severidade ({severidade[0]})</Label>
                                <Slider
                                    value={severidade}
                                    onValueChange={setSeveridade}
                                    max={5}
                                    min={1}
                                    step={1}
                                    className="py-2"
                                />
                            </div>
                            <div className="space-y-3">
                                <Label className="text-xs uppercase tracking-wider text-neutral-500">Probabilidade ({probabilidade[0]})</Label>
                                <Slider
                                    value={probabilidade}
                                    onValueChange={setProbabilidade}
                                    max={5}
                                    min={1}
                                    step={1}
                                    className="py-2"
                                />
                            </div>
                            <div className="col-span-2 flex items-center gap-2 text-2xs text-neutral-400 mt-1">
                                <Info className="w-3 h-3" />
                                <span>Multiplicador automático: Nível {severidade[0] * probabilidade[0]}</span>
                            </div>
                        </div>

                        {/* Medidas de Controle */}
                        <div className="grid gap-2">
                            <Label htmlFor="medidas">Medidas de Controle / Sugestões</Label>
                            <Textarea
                                id="medidas"
                                value={medidas}
                                onChange={(e) => setMedidas(e.target.value)}
                                placeholder="EPIs, proteções coletivas, treinamentos..."
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-primary-600 hover:bg-primary-700">
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Salvar Mapeamento
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
