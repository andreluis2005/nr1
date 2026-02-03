import { useState, useEffect, useCallback } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Loader2,
    Building2,
    Plus,
    Edit,
    Trash
} from 'lucide-react';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { supabase } from '@/lib/supabase';
import { NovoFuncionarioDialog } from '@/components/funcionarios/NovoFuncionarioDialog';
import { NovaEmpresaDialog } from '@/components/empresas/NovaEmpresaDialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Funcionario {
    id: string;
    nome_completo: string;
    cargo: string;
    departamento: string;
    status: 'ativo' | 'afastado' | 'ferias' | 'demissional' | 'inativo';
    data_admissao: string;
    matricula?: string;
}

export function Funcionarios() {
    const { empresaSelecionada } = useSupabaseAuth();
    const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estado para controle do Dialog de Edição/Criação
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [funcionarioEditing, setFuncionarioEditing] = useState<Funcionario | null>(null);

    const fetchFuncionarios = useCallback(async () => {
        if (!empresaSelecionada?.empresa_id) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('funcionarios')
                .select('id, nome_completo, cargo, departamento, status, data_admissao, matricula')
                .eq('empresa_id', empresaSelecionada.empresa_id)
                .order('nome_completo');

            if (error) throw error;
            setFuncionarios(data || []);
        } catch (error) {
            console.error('Erro ao buscar funcionários:', error);
        } finally {
            setIsLoading(false);
        }
    }, [empresaSelecionada]);

    useEffect(() => {
        fetchFuncionarios();
    }, [fetchFuncionarios]);

    const handleNew = () => {
        setFuncionarioEditing(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (func: Funcionario) => {
        setFuncionarioEditing(func);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.")) {
            return;
        }

        try {
            const { error } = await supabase
                .from('funcionarios')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast.success("Funcionário excluído com sucesso.");
            fetchFuncionarios();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao excluir funcionário.");
        }
    };

    const funcionariosFiltrados = funcionarios.filter(f =>
        f.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Funcionários</h1>
                    <p className="text-sm text-neutral-500 mt-1">
                        Gerencie os colaboradores ativos na plataforma
                    </p>
                </div>
                <Button
                    onClick={handleNew}
                    className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm gap-2"
                    disabled={!empresaSelecionada}
                >
                    <Plus className="w-4 h-4" />
                    Novo Funcionário
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou cargo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                </div>
                <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-neutral-600">
                    <Filter className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                </div>
            ) : !empresaSelecionada ? (
                <div className="text-center py-20 bg-white rounded-xl border border-neutral-200 border-dashed">
                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-1">
                        Nenhuma empresa selecionada
                    </h3>
                    <p className="text-neutral-500 mb-6 max-w-sm mx-auto">
                        Para gerenciar funcionários, você precisa primeiro criar o perfil da sua empresa.
                    </p>
                    <NovaEmpresaDialog
                        onSuccess={fetchFuncionarios}
                        trigger={
                            <button className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 mx-auto">
                                <Plus className="w-4 h-4" />
                                Criar Minha Empresa
                            </button>
                        }
                    />
                </div>
            ) : funcionariosFiltrados.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-neutral-200 border-dashed">
                    <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-1">
                        {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum funcionário encontrado'}
                    </h3>
                    <p className="text-neutral-500 mb-6">
                        {searchTerm ? 'Tente buscar com outros termos.' : 'Comece cadastrando os colaboradores da empresa.'}
                    </p>
                    {!searchTerm && (
                        <div className="flex justify-center">
                            <Button onClick={handleNew} className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm gap-2">
                                <Plus className="w-4 h-4" />
                                Novo Funcionário
                            </Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                            <tr>
                                <th className="px-6 py-3 font-medium">Nome / Matrícula</th>
                                <th className="px-6 py-3 font-medium">Cargo / Depto</th>
                                <th className="px-6 py-3 font-medium">Admissão</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {funcionariosFiltrados.map((func) => (
                                <tr key={func.id} className="hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center font-medium shadow-sm border border-primary-100">
                                                {func.nome_completo.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-neutral-900">{func.nome_completo}</span>
                                                {func.matricula && (
                                                    <span className="text-xs text-neutral-500">Mat: {func.matricula}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-neutral-900">{func.cargo || '-'}</span>
                                            <span className="text-xs text-neutral-500">{func.departamento || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-600">
                                        {func.data_admissao ? new Date(func.data_admissao).toLocaleDateString('pt-BR') : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                      ${func.status === 'ativo'
                                                ? 'bg-success-50 text-success-700 border-success-100'
                                                : func.status === 'inativo' || func.status === 'demissional'
                                                    ? 'bg-neutral-100 text-neutral-600 border-neutral-200'
                                                    : 'bg-warning-50 text-warning-700 border-warning-100'}
                    `}>
                                            {func.status.charAt(0).toUpperCase() + func.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="text-neutral-400 hover:text-neutral-600 p-1 rounded hover:bg-neutral-100 transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(func)}>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(func.id)} className="text-red-600 focus:text-red-600">
                                                    <Trash className="w-4 h-4 mr-2" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Dialog controlado */}
            <NovoFuncionarioDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSuccess={fetchFuncionarios}
                funcionarioToEdit={funcionarioEditing}
            />
        </div>
    );
}
