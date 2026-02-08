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
import { Building2 } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";

interface NovaEmpresaDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
    mode?: 'create' | 'verify';
}

export function NovaEmpresaDialog({
    trigger,
    onSuccess,
    open: constrainedOpen,
    onOpenChange: constrainedOnOpenChange,
    mode = 'create'
}: NovaEmpresaDialogProps) {
    const { criarEmpresa, atualizarEmpresa, empresaSelecionada, user } = useSupabaseAuth();
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const open = constrainedOpen !== undefined ? constrainedOpen : internalOpen;
    const setOpen = constrainedOnOpenChange || setInternalOpen;

    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [cnpjEmpresa, setCnpjEmpresa] = useState('');

    // Preencher dados se estiver em modo de verificação ou usar metadados como fallback
    useEffect(() => {
        if (open) {
            if (mode === 'verify' && empresaSelecionada?.empresa) {
                setNomeEmpresa(empresaSelecionada.empresa.nome_fantasia || '');
                setCnpjEmpresa(empresaSelecionada.empresa.cnpj || '');
            } else if (mode === 'create' && user?.user_metadata) {
                const metaNome = user.user_metadata.empresa_nome || user.user_metadata.nome_empresa;
                const metaCnpj = user.user_metadata.empresa_cnpj || user.user_metadata.cnpj;

                // Preencher apenas se estiver vazio para não sobrescrever
                if (metaNome && !nomeEmpresa) setNomeEmpresa(metaNome);
                if (metaCnpj && !cnpjEmpresa) setCnpjEmpresa(metaCnpj);
            }
        }
    }, [mode, empresaSelecionada, user, internalOpen, constrainedOpen, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nomeEmpresa.trim()) {
            toast.error("Nome da empresa é obrigatório");
            return;
        }

        setIsLoading(true);

        try {
            if (mode === 'verify' && empresaSelecionada?.empresa_id) {
                const dadosOriginais = empresaSelecionada.empresa;
                const semAlteracao = nomeEmpresa === dadosOriginais.nome_fantasia &&
                    cnpjEmpresa === (dadosOriginais.cnpj || '');

                const payload: { nome?: string; cnpj?: string; b_verificada: boolean } = {
                    b_verificada: true
                };

                if (!semAlteracao) {
                    payload.nome = nomeEmpresa;
                    payload.cnpj = cnpjEmpresa;
                }

                const ok = await atualizarEmpresa(empresaSelecionada.empresa_id, payload);
                if (ok) {
                    if (semAlteracao) toast.info("Dados confirmados");
                    setOpen(false);
                    if (onSuccess) onSuccess();
                }
            } else {
                const novaEmpresa = await criarEmpresa({
                    nome: nomeEmpresa,
                    cnpj: cnpjEmpresa,
                    b_verificada: true
                });
                if (novaEmpresa || novaEmpresa === null) { // criarEmpresa retorna null mas atualiza o context
                    setOpen(false);
                    setNomeEmpresa('');
                    setCnpjEmpresa('');
                    if (onSuccess) onSuccess();
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const isVerify = mode === 'verify';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary-600" />
                            {isVerify ? "Verificar Cadastro" : "Criar sua Empresa"}
                        </DialogTitle>
                        <DialogDescription>
                            {isVerify
                                ? "Confirme ou atualize os dados básicos da sua empresa."
                                : "Vamos começar! Crie o perfil da sua empresa para gerenciar a segurança do trabalho."
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nomeEmpresa">Nome da Empresa / Razão Social *</Label>
                            <Input
                                id="nomeEmpresa"
                                value={nomeEmpresa}
                                onChange={(e) => setNomeEmpresa(e.target.value)}
                                placeholder="Ex: Minha Consultoria Ltda"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cnpjEmpresa">CNPJ (Opcional)</Label>
                            <Input
                                id="cnpjEmpresa"
                                value={cnpjEmpresa}
                                onChange={(e) => setCnpjEmpresa(e.target.value)}
                                placeholder="00.000.000/0000-00"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-primary-600 hover:bg-primary-700" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Confirmar Cadastro"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
