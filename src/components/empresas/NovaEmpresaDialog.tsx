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
import { Building2, Plus } from "lucide-react";
import { toast } from "sonner";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";

interface NovaEmpresaDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onSuccess?: () => void;
}

export function NovaEmpresaDialog({ trigger, onSuccess, open: constrainedOpen, onOpenChange: constrainedOnOpenChange }: NovaEmpresaDialogProps) {
    const { criarEmpresa } = useSupabaseAuth();
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [nomeEmpresa, setNomeEmpresa] = useState('');
    const [cnpjEmpresa, setCnpjEmpresa] = useState('');

    // Controlar open state (controlado ou descontrolado)
    const open = constrainedOpen !== undefined ? constrainedOpen : internalOpen;
    const setOpen = constrainedOnOpenChange || setInternalOpen;

    const handleCriarEmpresa = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nomeEmpresa.trim()) {
            toast.error("Nome da empresa é obrigatório");
            return;
        }

        setIsLoading(true);

        try {
            const novaEmpresa = await criarEmpresa({ nome: nomeEmpresa, cnpj: cnpjEmpresa });
            if (novaEmpresa) {
                setOpen(false);
                setNomeEmpresa('');
                setCnpjEmpresa('');
                if (onSuccess) onSuccess();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCriarEmpresa}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary-600" />
                            Criar sua Empresa
                        </DialogTitle>
                        <DialogDescription>
                            Vamos começar! Crie o perfil da sua empresa para gerenciar a segurança do trabalho.
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
                            {isLoading ? "Criando..." : "Criar Empresa"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
