import { useState, useEffect } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";
import { NovoSetorDialog } from "@/components/setores/NovoSetorDialog";

interface FuncionarioData {
    id: string;
    nome_completo: string;
    matricula?: string;
    cargo?: string;
    departamento?: string;
    setor_id?: string;
    status: string;
}

interface NovoFuncionarioDialogProps {
    onSuccess: () => void;
    funcionarioToEdit?: FuncionarioData | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function NovoFuncionarioDialog({ onSuccess, funcionarioToEdit, open: controlledOpen, onOpenChange, trigger }: NovoFuncionarioDialogProps) {
    const { empresaSelecionada, criarEmpresa } = useSupabaseAuth();
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = (newOpen: boolean) => {
        if (onOpenChange) onOpenChange(newOpen);
        if (!isControlled) setInternalOpen(newOpen);
    };

    const isEditing = !!funcionarioToEdit;
    const [isLoading, setIsLoading] = useState(false);
    const [setores, setSetores] = useState<{ id: string, nome: string }[]>([]);

    // Form states
    const [nome, setNome] = useState('');
    const [matricula, setMatricula] = useState('');
    const [cargo, setCargo] = useState('');
    const [setorId, setSetorId] = useState<string>('');
    const [status, setStatus] = useState('ativo');

    // Load data when editing
    useEffect(() => {
        if (funcionarioToEdit) {
            setNome(funcionarioToEdit.nome_completo || '');
            setMatricula(funcionarioToEdit.matricula || '');
            setCargo(funcionarioToEdit.cargo || '');
            setSetorId(funcionarioToEdit.setor_id || '');
            setStatus(funcionarioToEdit.status || 'ativo');
        } else {
            if (open && !isEditing) resetForm();
        }
    }, [funcionarioToEdit, open, isEditing]);

    // Fetch setores
    useEffect(() => {
        const fetchSetores = async () => {
            if (!empresaSelecionada?.empresa_id || !open) return;
            const { data, error } = await supabase
                .from('setores')
                .select('id, nome')
                .eq('empresa_id', empresaSelecionada.empresa_id);

            if (!error && data) {
                setSetores(data);
            }
        };

        fetchSetores();
    }, [empresaSelecionada?.empresa_id, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!empresaSelecionada?.empresa_id) {
            toast.error("Nenhuma empresa selecionada.");
            return;
        }

        if (!nome.trim()) {
            toast.error("Nome é obrigatório");
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                nome_completo: nome,
                matricula: matricula || null,
                cargo: cargo || null,
                setor_id: setorId || null,
                status: status,
            };

            let error;

            if (isEditing && funcionarioToEdit) {
                // Update
                const { error: updateError } = await (supabase as any)
                    .from('funcionarios')
                    .update(payload)
                    .eq('id', funcionarioToEdit.id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await (supabase as any)
                    .from('funcionarios')
                    .insert({
                        ...payload,
                        empresa_id: empresaSelecionada.empresa_id,
                        data_admissao: new Date().toISOString()
                    });
                error = insertError;
            }

            if (error) throw error;

            toast.success(isEditing ? "Funcionário atualizado!" : "Funcionário cadastrado!");
            setOpen(false);
            resetForm();
            onSuccess();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao salvar funcionário");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setNome('');
        setMatricula('');
        setCargo('');
        setSetorId('');
        setStatus('ativo');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger ? (
                <div onClick={() => setOpen(true)}>
                    {trigger}
                </div>
            ) : !isControlled && (
                <DialogTrigger asChild>
                    <Button className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm gap-2">
                        <Plus className="w-4 h-4" />
                        Novo Funcionário
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-primary-600" />
                            {isEditing ? 'Editar Funcionário' : 'Novo Funcionário'}
                        </DialogTitle>
                        <DialogDescription>
                            {isEditing ? "Atualize os dados do colaborador." : "Preencha os dados básicos do colaborador."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nome">Nome Completo *</Label>
                            <Input
                                id="nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Ex: João da Silva"
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="matricula">Matrícula</Label>
                                <Input
                                    id="matricula"
                                    value={matricula}
                                    onChange={(e) => setMatricula(e.target.value)}
                                    placeholder="Ex: 1234"
                                    disabled={isLoading}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ativo">Ativo</SelectItem>
                                        <SelectItem value="ferias">Férias</SelectItem>
                                        <SelectItem value="afastado">Afastado</SelectItem>
                                        <SelectItem value="inativo">Inativo</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cargo">Cargo</Label>
                            <Input
                                id="cargo"
                                value={cargo}
                                onChange={(e) => setCargo(e.target.value)}
                                placeholder="Ex: Eletricista"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="setor">Setor (NR-1) *</Label>
                                <NovoSetorDialog
                                    onSuccess={(id) => {
                                        setSetorId(id);
                                        // Refetch local
                                        if (empresaSelecionada) {
                                            supabase
                                                .from('setores')
                                                .select('id, nome')
                                                .eq('empresa_id', empresaSelecionada.empresa_id)
                                                .then(({ data }) => data && setSetores(data));
                                        }
                                    }}
                                    trigger={<button type="button" className="text-[10px] font-bold text-primary-600 hover:underline tracking-tight uppercase">+ Novo Setor</button>}
                                />
                            </div>
                            <Select value={setorId} onValueChange={setSetorId} disabled={isLoading} required>
                                <SelectTrigger id="setor">
                                    <SelectValue placeholder="Selecione o setor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {setores.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                                    ))}
                                    {setores.length === 0 && (
                                        <SelectItem value="none" disabled>Nenhum setor cadastrado</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-[10px] text-neutral-400">Obrigatório para conformidade NR-1.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-primary-600 hover:bg-primary-700">
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEditing ? 'Salvar Alterações' : 'Salvar Funcionário'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
