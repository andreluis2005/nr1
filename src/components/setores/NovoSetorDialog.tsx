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
import { Plus, Loader2, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useSupabaseAuth } from "@/context/SupabaseAuthContext";

interface NovoSetorDialogProps {
    onSuccess?: (setorId: string) => void;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function NovoSetorDialog({ onSuccess, open: controlledOpen, onOpenChange, trigger }: NovoSetorDialogProps) {
    const { empresaSelecionada } = useSupabaseAuth();
    const [internalOpen, setInternalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = (newOpen: boolean) => {
        if (onOpenChange) onOpenChange(newOpen);
        if (!isControlled) setInternalOpen(newOpen);
    };

    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!empresaSelecionada?.empresa_id) {
            toast.error("Nenhuma empresa selecionada.");
            return;
        }

        if (!nome.trim()) {
            toast.error("Nome do setor é obrigatório");
            return;
        }

        setIsLoading(true);

        try {
            const { data, error } = await (supabase as any)
                .from('setores')
                .insert({
                    nome: nome.trim(),
                    descricao: descricao.trim(),
                    empresa_id: empresaSelecionada.empresa_id
                })
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    throw new Error("Já existe um setor com este nome nesta empresa.");
                }
                throw error;
            }

            toast.success("Setor criado com sucesso!");
            setOpen(false);
            setNome('');
            setDescricao('');
            if (onSuccess) onSuccess(data.id);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao criar setor");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    {trigger || (
                        <Button variant="outline" size="sm" className="gap-2">
                            <Plus className="w-4 h-4" />
                            Novo Setor
                        </Button>
                    )}
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-primary-600" />
                            Novo Setor
                        </DialogTitle>
                        <DialogDescription>
                            Cadastre um novo setor para organizar seus funcionários conforme a NR-1.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="nome">Nome do Setor *</Label>
                            <Input
                                id="nome"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Ex: Operacional, Almoxarifado, TI"
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="descricao">Descrição (Opcional)</Label>
                            <Textarea
                                id="descricao"
                                value={descricao}
                                onChange={(e) => setDescricao(e.target.value)}
                                placeholder="Breve descrição das atividades do setor..."
                                disabled={isLoading}
                                className="resize-none"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-primary-600 hover:bg-primary-700">
                            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Criar Setor
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
