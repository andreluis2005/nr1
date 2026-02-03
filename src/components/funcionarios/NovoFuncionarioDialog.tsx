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
import { Plus, Loader2, Building2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";

interface FuncionarioData {
    id: string;
    nome_completo: string;
    matricula?: string;
    cargo?: string;
    departamento?: string;
    status: string;
}

interface NovoFuncionarioDialogProps {
    onSuccess: () => void;
    funcionarioToEdit?: FuncionarioData | null;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function NovoFuncionarioDialog({ onSuccess, funcionarioToEdit, open: controlledOpen, onOpenChange }: NovoFuncionarioDialogProps) {
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

    // Step: 'empresa' | 'funcionario'
    const [step, setStep] = useState<'empresa' | 'funcionario'>('funcionario');

    useEffect(() => {
        if (open) {
            if (!empresaSelecionada && !isEditing) {
                setStep('empresa');
            } else {
                setStep('funcionario');
            }
        }
    }, [open, empresaSelecionada, isEditing]);

    // Form states
    const [nome, setNome] = useState('');
    const [matricula, setMatricula] = useState('');
    const [cargo, setCargo] = useState('');
    const [departamento, setDepartamento] = useState('');
    const [status, setStatus] = useState('ativo');

    // Load data when editing
    useEffect(() => {
        if (funcionarioToEdit) {
            setNome(funcionarioToEdit.nome_completo || '');
            setMatricula(funcionarioToEdit.matricula || '');
            setCargo(funcionarioToEdit.cargo || '');
            setDepartamento(funcionarioToEdit.departamento || '');
            setStatus(funcionarioToEdit.status || 'ativo');
        } else {
            // Reset se abrir em modo criação
            if (open && !isEditing) resetForm();
        }
    }, [funcionarioToEdit, open, isEditing]);

    // Form states - Empresa
    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [cnpjEmpresa, setCnpjEmpresa] = useState('');

    const handleCriarEmpresa = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nomeEmpresa.trim()) {
            toast.error("Nome da empresa é obrigatório");
            return;
        }

        try {
            const novaEmpresa = await criarEmpresa({ nome: nomeEmpresa, cnpj: cnpjEmpresa });
            if (novaEmpresa) {
                setStep('funcionario');
            }
        } catch (error) {
            console.error(error);
        }
    };

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
                departamento: departamento || null,
                status: status,
            };

            let error;

            if (isEditing && funcionarioToEdit) {
                // Update
                const { error: updateError } = await supabase
                    .from('funcionarios')
                    .update(payload)
                    .eq('id', funcionarioToEdit.id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
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
        setDepartamento('');
        setStatus('ativo');
        setNomeEmpresa('');
        setCnpjEmpresa('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm gap-2">
                        <Plus className="w-4 h-4" />
                        Novo Funcionário
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[425px]">
                {step === 'empresa' ? (
                    <form onSubmit={handleCriarEmpresa}>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary-600" />
                                Criar sua Empresa
                            </DialogTitle>
                            <DialogDescription>
                                Para cadastrar funcionários, primeiro precisamos criar o perfil da sua empresa.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="nomeEmpresa">Nome da Empresa / Razão Social *</Label>
                                <Input
                                    id="nomeEmpresa"
                                    value={nomeEmpresa}
                                    onChange={(e) => setNomeEmpresa(e.target.value)}
                                    placeholder="Ex: Minha Empresa Ltda"
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="cnpjEmpresa">CNPJ (Opcional)</Label>
                                <Input
                                    id="cnpjEmpresa"
                                    value={cnpjEmpresa}
                                    onChange={(e) => setCnpjEmpresa(e.target.value)}
                                    placeholder="00.000.000/0000-00"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
                                Criar Empresa e Continuar
                            </Button>
                        </DialogFooter>
                    </form>
                ) : (
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
                                <Label htmlFor="departamento">Departamento</Label>
                                <Input
                                    id="departamento"
                                    value={departamento}
                                    onChange={(e) => setDepartamento(e.target.value)}
                                    placeholder="Ex: Manutenção"
                                    disabled={isLoading}
                                />
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
                )}
            </DialogContent>
        </Dialog>
    );
}
