import React, { createContext, useContext, useState, useCallback } from 'react';
import type { 
  Empresa, 
  Funcionario, 
  Exame, 
  Treinamento, 
  Alerta, 
  PGR,
  DashboardMetrics,
  Relatorio,
  Usuario,
  Risco
} from '@/types';
import { 
  empresaMock, 
  funcionariosMock, 
  examesMock, 
  treinamentosMock, 
  alertasMock, 
  pgrMock,
  relatoriosMock,
  usuariosMock,
  riscosMock,
  calcularMetricas
} from '@/data/mockData';

interface AppContextType {
  // Dados
  empresa: Empresa;
  funcionarios: Funcionario[];
  exames: Exame[];
  treinamentos: Treinamento[];
  alertas: Alerta[];
  pgr: PGR;
  relatorios: Relatorio[];
  usuario: Usuario | null;
  usuarios: Usuario[];
  riscosMock: Risco[];
  
  // Métricas calculadas
  metrics: DashboardMetrics;
  
  // Ações
  setUsuario: (usuario: Usuario | null) => void;
  addFuncionario: (funcionario: Funcionario) => void;
  updateFuncionario: (id: string, data: Partial<Funcionario>) => void;
  deleteFuncionario: (id: string) => void;
  addExame: (exame: Exame) => void;
  updateExame: (id: string, data: Partial<Exame>) => void;
  addTreinamento: (treinamento: Treinamento) => void;
  updateTreinamento: (id: string, data: Partial<Treinamento>) => void;
  updateAlerta: (id: string, data: Partial<Alerta>) => void;
  marcarAlertaResolvido: (id: string) => void;
  addRelatorio: (relatorio: Relatorio) => void;
  refreshMetrics: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [empresa] = useState<Empresa>(empresaMock);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(funcionariosMock);
  const [exames, setExames] = useState<Exame[]>(examesMock);
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>(treinamentosMock);
  const [alertas, setAlertas] = useState<Alerta[]>(alertasMock);
  const [pgr] = useState<PGR>(pgrMock);
  const [relatorios, setRelatorios] = useState<Relatorio[]>(relatoriosMock);
  const [usuario, setUsuario] = useState<Usuario | null>(usuariosMock[0]);
  
  const [metrics, setMetrics] = useState<DashboardMetrics>(() => 
    calcularMetricas(funcionariosMock, examesMock, treinamentosMock, alertasMock)
  );

  const refreshMetrics = useCallback(() => {
    setMetrics(calcularMetricas(funcionarios, exames, treinamentos, alertas));
  }, [funcionarios, exames, treinamentos, alertas]);

  const addFuncionario = useCallback((funcionario: Funcionario) => {
    setFuncionarios(prev => [...prev, funcionario]);
    refreshMetrics();
  }, [refreshMetrics]);

  const updateFuncionario = useCallback((id: string, data: Partial<Funcionario>) => {
    setFuncionarios(prev => 
      prev.map(f => f.id === id ? { ...f, ...data } : f)
    );
    refreshMetrics();
  }, [refreshMetrics]);

  const deleteFuncionario = useCallback((id: string) => {
    setFuncionarios(prev => prev.filter(f => f.id !== id));
    setExames(prev => prev.filter(e => e.funcionarioId !== id));
    setTreinamentos(prev => prev.filter(t => t.funcionarioId !== id));
    refreshMetrics();
  }, [refreshMetrics]);

  const addExame = useCallback((exame: Exame) => {
    setExames(prev => [...prev, exame]);
    refreshMetrics();
  }, [refreshMetrics]);

  const updateExame = useCallback((id: string, data: Partial<Exame>) => {
    setExames(prev => 
      prev.map(e => e.id === id ? { ...e, ...data } : e)
    );
    refreshMetrics();
  }, [refreshMetrics]);

  const addTreinamento = useCallback((treinamento: Treinamento) => {
    setTreinamentos(prev => [...prev, treinamento]);
    refreshMetrics();
  }, [refreshMetrics]);

  const updateTreinamento = useCallback((id: string, data: Partial<Treinamento>) => {
    setTreinamentos(prev => 
      prev.map(t => t.id === id ? { ...t, ...data } : t)
    );
    refreshMetrics();
  }, [refreshMetrics]);

  const updateAlerta = useCallback((id: string, data: Partial<Alerta>) => {
    setAlertas(prev => 
      prev.map(a => a.id === id ? { ...a, ...data } : a)
    );
    refreshMetrics();
  }, [refreshMetrics]);

  const marcarAlertaResolvido = useCallback((id: string) => {
    setAlertas(prev => 
      prev.map(a => a.id === id ? { ...a, status: 'resolvido' as const } : a)
    );
    refreshMetrics();
  }, [refreshMetrics]);

  const addRelatorio = useCallback((relatorio: Relatorio) => {
    setRelatorios(prev => [relatorio, ...prev]);
  }, []);

  const value: AppContextType = {
    empresa,
    funcionarios,
    exames,
    treinamentos,
    alertas,
    pgr,
    relatorios,
    usuario,
    usuarios: usuariosMock,
    riscosMock,
    metrics,
    setUsuario,
    addFuncionario,
    updateFuncionario,
    deleteFuncionario,
    addExame,
    updateExame,
    addTreinamento,
    updateTreinamento,
    updateAlerta,
    marcarAlertaResolvido,
    addRelatorio,
    refreshMetrics
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
