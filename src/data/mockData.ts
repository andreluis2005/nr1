import type { 
  Empresa, 
  Funcionario, 
  Exame, 
  Treinamento, 
  Risco, 
  PGR, 
  Alerta, 
  DashboardMetrics,
  Relatorio,
  Setor,
  Usuario
} from '@/types';

export const empresaMock: Empresa = {
  id: '1',
  razaoSocial: 'Indústria Metalúrgica Silva Ltda',
  nomeFantasia: 'MetalSil',
  cnpj: '12.345.678/0001-90',
  cnae: '2512800',
  descricaoCnae: 'Fabricação de esquadrias de metal',
  endereco: {
    logradouro: 'Rua das Indústrias',
    numero: '1500',
    complemento: 'Galpão 3',
    bairro: 'Distrito Industrial',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '08150-000'
  },
  contato: {
    nome: 'Carlos Silva',
    email: 'carlos@metalsil.com.br',
    telefone: '(11) 3456-7890',
    cargo: 'Diretor de Operações'
  },
  grauRisco: 3,
  dataCadastro: '2023-01-15'
};

export const setoresMock: Setor[] = [
  {
    id: '1',
    nome: 'Produção',
    descricao: 'Linha de fabricação e montagem',
    funcoes: [
      { id: '1', nome: 'Operador de Máquina', cbo: '773510', setorId: '1', riscos: ['1', '2', '5'] },
      { id: '2', nome: 'Soldador', cbo: '721415', setorId: '1', riscos: ['1', '2', '3', '5'] },
      { id: '3', nome: 'Montador', cbo: '773530', setorId: '1', riscos: ['1', '5'] }
    ],
    riscos: ['1', '2', '3', '5']
  },
  {
    id: '2',
    nome: 'Manutenção',
    descricao: 'Manutenção preventiva e corretiva',
    funcoes: [
      { id: '4', nome: 'Técnico de Manutenção', cbo: '313205', setorId: '2', riscos: ['1', '2', '4', '5'] },
      { id: '5', nome: 'Eletricista', cbo: '313110', setorId: '2', riscos: ['1', '4', '5', '6'] }
    ],
    riscos: ['1', '2', '4', '5', '6']
  },
  {
    id: '3',
    nome: 'Administrativo',
    descricao: 'Escritório e gestão',
    funcoes: [
      { id: '6', nome: 'Analista Administrativo', cbo: '410105', setorId: '3', riscos: ['4'] },
      { id: '7', nome: 'Auxiliar de Escritório', cbo: '411015', setorId: '3', riscos: ['4'] }
    ],
    riscos: ['4']
  },
  {
    id: '4',
    nome: 'Almoxarifado',
    descricao: 'Armazenamento e logística',
    funcoes: [
      { id: '8', nome: 'Almoxarife', cbo: '414125', setorId: '4', riscos: ['1', '5'] },
      { id: '9', nome: 'Operador de Empilhadeira', cbo: '782215', setorId: '4', riscos: ['1', '5'] }
    ],
    riscos: ['1', '5']
  }
];

export const funcionariosMock: Funcionario[] = [
  {
    id: '1',
    nome: 'João Silva Santos',
    cpf: '123.456.789-00',
    matricula: '001',
    dataAdmissao: '2022-03-15',
    dataNascimento: '1985-07-20',
    cargo: 'Operador de Máquina',
    setor: 'Produção',
    status: 'ativo',
    sexo: 'M',
    exames: [],
    treinamentos: []
  },
  {
    id: '2',
    nome: 'Maria Oliveira Costa',
    cpf: '987.654.321-00',
    matricula: '002',
    dataAdmissao: '2021-08-10',
    dataNascimento: '1990-03-12',
    cargo: 'Soldador',
    setor: 'Produção',
    status: 'ativo',
    sexo: 'F',
    exames: [],
    treinamentos: []
  },
  {
    id: '3',
    nome: 'Pedro Henrique Lima',
    cpf: '456.789.123-00',
    matricula: '003',
    dataAdmissao: '2023-01-20',
    dataNascimento: '1988-11-05',
    cargo: 'Técnico de Manutenção',
    setor: 'Manutenção',
    status: 'ativo',
    sexo: 'M',
    exames: [],
    treinamentos: []
  },
  {
    id: '4',
    nome: 'Ana Paula Ferreira',
    cpf: '789.123.456-00',
    matricula: '004',
    dataAdmissao: '2020-05-08',
    dataNascimento: '1992-09-18',
    cargo: 'Analista Administrativo',
    setor: 'Administrativo',
    status: 'ativo',
    sexo: 'F',
    exames: [],
    treinamentos: []
  },
  {
    id: '5',
    nome: 'Roberto Carlos Dias',
    cpf: '321.654.987-00',
    matricula: '005',
    dataAdmissao: '2019-11-25',
    dataNascimento: '1980-12-01',
    cargo: 'Almoxarife',
    setor: 'Almoxarifado',
    status: 'ferias',
    sexo: 'M',
    exames: [],
    treinamentos: []
  },
  {
    id: '6',
    nome: 'Fernanda Souza Lima',
    cpf: '654.987.321-00',
    matricula: '006',
    dataAdmissao: '2024-02-01',
    dataNascimento: '1995-04-22',
    cargo: 'Montador',
    setor: 'Produção',
    status: 'ativo',
    sexo: 'F',
    exames: [],
    treinamentos: []
  },
  {
    id: '7',
    nome: 'Carlos Eduardo Mendes',
    cpf: '147.258.369-00',
    matricula: '007',
    dataAdmissao: '2023-06-15',
    dataNascimento: '1987-08-30',
    cargo: 'Eletricista',
    setor: 'Manutenção',
    status: 'ativo',
    sexo: 'M',
    exames: [],
    treinamentos: []
  },
  {
    id: '8',
    nome: 'Juliana Martins Rocha',
    cpf: '369.258.147-00',
    matricula: '008',
    dataAdmissao: '2022-09-10',
    dataNascimento: '1993-01-15',
    cargo: 'Auxiliar de Escritório',
    setor: 'Administrativo',
    status: 'ativo',
    sexo: 'F',
    exames: [],
    treinamentos: []
  }
];

export const examesMock: Exame[] = [
  {
    id: '1',
    funcionarioId: '1',
    tipo: 'periodico',
    dataRealizacao: '2025-02-05',
    dataVencimento: '2026-02-05',
    status: 'realizado',
    clinica: 'Clínica Ocupacional Saúde',
    resultado: 'Apto',
    observacoes: 'Sem restrições'
  },
  {
    id: '2',
    funcionarioId: '2',
    tipo: 'periodico',
    dataRealizacao: '2024-08-20',
    dataVencimento: '2025-08-20',
    status: 'realizado',
    clinica: 'Clínica Ocupacional Saúde',
    resultado: 'Apto',
    observacoes: 'Uso de EPI obrigatório'
  },
  {
    id: '3',
    funcionarioId: '3',
    tipo: 'admissional',
    dataRealizacao: '2023-01-20',
    dataVencimento: '2024-01-20',
    status: 'vencido',
    clinica: 'Clínica Ocupencial Plus',
    resultado: 'Apto',
    observacoes: 'Periódico pendente'
  },
  {
    id: '4',
    funcionarioId: '4',
    tipo: 'periodico',
    dataRealizacao: '2025-01-10',
    dataVencimento: '2026-01-10',
    status: 'realizado',
    clinica: 'Clínica Ocupacional Saúde',
    resultado: 'Apto',
    observacoes: 'Sem restrições'
  },
  {
    id: '5',
    funcionarioId: '5',
    tipo: 'periodico',
    dataRealizacao: '2024-06-15',
    dataVencimento: '2025-06-15',
    status: 'realizado',
    clinica: 'Clínica Ocupacional Saúde',
    resultado: 'Apto',
    observacoes: 'Sem restrições'
  },
  {
    id: '6',
    funcionarioId: '6',
    tipo: 'admissional',
    dataRealizacao: '2024-02-01',
    dataVencimento: '2025-02-01',
    status: 'agendado',
    clinica: 'Clínica Ocupacional Saúde',
    observacoes: 'Aguardando realização'
  },
  {
    id: '7',
    funcionarioId: '7',
    tipo: 'periodico',
    dataRealizacao: '2024-09-20',
    dataVencimento: '2025-09-20',
    status: 'realizado',
    clinica: 'Clínica Ocupacional Saúde',
    resultado: 'Apto',
    observacoes: 'Sem restrições'
  },
  {
    id: '8',
    funcionarioId: '8',
    tipo: 'periodico',
    dataRealizacao: '2025-01-25',
    dataVencimento: '2026-01-25',
    status: 'realizado',
    clinica: 'Clínica Ocupacional Saúde',
    resultado: 'Apto',
    observacoes: 'Sem restrições'
  }
];

export const treinamentosMock: Treinamento[] = [
  {
    id: '1',
    funcionarioId: '1',
    nr: 'NR-06',
    descricao: 'Equipamentos de Proteção Individual',
    dataRealizacao: '2024-03-10',
    dataVencimento: '2025-03-10',
    cargaHoraria: 8,
    instrutor: 'Eng. Paulo Santos',
    status: 'vencido'
  },
  {
    id: '2',
    funcionarioId: '1',
    nr: 'NR-12',
    descricao: 'Máquinas e Equipamentos',
    dataRealizacao: '2025-01-15',
    dataVencimento: '2026-01-15',
    cargaHoraria: 16,
    instrutor: 'Téc. Ana Lima',
    status: 'vigente'
  },
  {
    id: '3',
    funcionarioId: '2',
    nr: 'NR-06',
    descricao: 'Equipamentos de Proteção Individual',
    dataRealizacao: '2025-02-01',
    dataVencimento: '2026-02-01',
    cargaHoraria: 8,
    instrutor: 'Eng. Paulo Santos',
    status: 'vigente'
  },
  {
    id: '4',
    funcionarioId: '2',
    nr: 'NR-33',
    descricao: 'Trabalho em Espaço Confinado',
    dataRealizacao: '2024-11-20',
    dataVencimento: '2025-11-20',
    cargaHoraria: 16,
    instrutor: 'Eng. Carlos Mendes',
    status: 'vigente'
  },
  {
    id: '5',
    funcionarioId: '3',
    nr: 'NR-10',
    descricao: 'Segurança em Instalações Elétricas',
    dataRealizacao: '2024-05-15',
    dataVencimento: '2025-05-15',
    cargaHoraria: 40,
    instrutor: 'Eng. Roberto Silva',
    status: 'vencido'
  },
  {
    id: '6',
    funcionarioId: '3',
    nr: 'NR-35',
    descricao: 'Trabalho em Altura',
    dataRealizacao: '2025-01-10',
    dataVencimento: '2026-01-10',
    cargaHoraria: 16,
    instrutor: 'Téc. Fernando Costa',
    status: 'vigente'
  },
  {
    id: '7',
    funcionarioId: '7',
    nr: 'NR-10',
    descricao: 'Segurança em Instalações Elétricas',
    dataRealizacao: '2024-08-20',
    dataVencimento: '2025-08-20',
    cargaHoraria: 40,
    instrutor: 'Eng. Roberto Silva',
    status: 'vigente'
  }
];

export const riscosMock: Risco[] = [
  {
    id: '1',
    tipo: 'fisico',
    agente: 'Ruído',
    descricao: 'Exposição a níveis de pressão sonora acima do limite de tolerância',
    setores: ['Produção', 'Manutenção'],
    funcoes: ['Operador de Máquina', 'Soldador', 'Técnico de Manutenção'],
    limiteTolerancia: '85 dB(A)',
    medidasPreventivas: [
      'Substituição de equipamentos por menos ruidosos',
      'Barreiras físicas para absorção de som',
      'Rodízio de trabalhadores',
      'Uso obrigatório de protetor auricular'
    ],
    grauRisco: 'grave'
  },
  {
    id: '2',
    tipo: 'quimico',
    agente: 'Fumos metálicos',
    descricao: 'Exposição a fumos gerados durante processos de soldagem',
    setores: ['Produção'],
    funcoes: ['Soldador'],
    limiteTolerancia: '5 mg/m³',
    medidasPreventivas: [
      'Sistema de exaustão localizada',
      'Ventilação geral',
      'Uso de máscara de proteção respiratória',
      'Monitoragem ambiental'
    ],
    grauRisco: 'grave'
  },
  {
    id: '3',
    tipo: 'fisico',
    agente: 'Radiação ultravioleta',
    descricao: 'Exposição à radiação UV durante processos de soldagem',
    setores: ['Produção'],
    funcoes: ['Soldador'],
    medidasPreventivas: [
      'Uso de máscara de solda com filtro adequado',
      'Cortinas de proteção',
      'Roupas de proteção',
      'Treinamento sobre riscos'
    ],
    grauRisco: 'moderado'
  },
  {
    id: '4',
    tipo: 'ergonomico',
    agente: 'Movimentação manual de cargas',
    descricao: 'Exposição a esforço físico na movimentação de materiais',
    setores: ['Produção', 'Almoxarifado', 'Manutenção'],
    funcoes: ['Montador', 'Almoxarife', 'Técnico de Manutenção'],
    medidasPreventivas: [
      'Treinamento em técnicas de movimentação',
      'Uso de equipamentos auxiliares',
      'Organização do layout',
      'Pausas de recuperação'
    ],
    grauRisco: 'moderado'
  },
  {
    id: '5',
    tipo: 'acidente',
    agente: 'Queda de materiais',
    descricao: 'Risco de queda de materiais em armazenamento ou movimentação',
    setores: ['Produção', 'Almoxarifado', 'Manutenção'],
    funcoes: ['Operador de Máquina', 'Almoxarife', 'Técnico de Manutenção', 'Operador de Empilhadeira'],
    medidasPreventivas: [
      'Sinalização de áreas',
      'Uso de EPIs (capacete, botina)',
      'Procedimentos de armazenagem',
      'Treinamento de operadores'
    ],
    grauRisco: 'grave'
  },
  {
    id: '6',
    tipo: 'fisico',
    agente: 'Eletricidade',
    descricao: 'Risco de choque elétrico em instalações e equipamentos',
    setores: ['Manutenção'],
    funcoes: ['Eletricista', 'Técnico de Manutenção'],
    medidasPreventivas: [
      'Bloqueio e etiquetagem (LOTO)',
      'EPIs específicos',
      'Treinamento NR-10',
      'Manutenção preventiva'
    ],
    grauRisco: 'critico'
  }
];

export const pgrMock: PGR = {
  id: '1',
  empresaId: '1',
  versao: 2,
  dataCriacao: '2024-01-15',
  dataRevisao: '2025-01-15',
  status: 'ativo',
  etapaPDCA: 'checar',
  riscos: riscosMock,
  medidasControle: [
    {
      id: '1',
      riscoId: '1',
      tipo: 'engenharia',
      descricao: 'Instalação de barreiras acústicas',
      implementada: true,
      dataImplementacao: '2024-03-01',
      responsavel: 'Eng. Paulo Santos'
    },
    {
      id: '2',
      riscoId: '1',
      tipo: 'epi',
      descricao: 'Protetor auricular tipo concha',
      implementada: true,
      dataImplementacao: '2024-01-20',
      responsavel: 'Téc. Ana Lima'
    },
    {
      id: '3',
      riscoId: '2',
      tipo: 'engenharia',
      descricao: 'Sistema de exaustão localizada',
      implementada: true,
      dataImplementacao: '2024-02-15',
      responsavel: 'Eng. Paulo Santos'
    },
    {
      id: '4',
      riscoId: '6',
      tipo: 'administrativa',
      descricao: 'Procedimento de bloqueio e etiquetagem',
      implementada: true,
      dataImplementacao: '2024-01-25',
      responsavel: 'Eng. Roberto Silva'
    }
  ],
  responsavel: 'Eng. Paulo Santos - Técnico de Segurança'
};

export const alertasMock: Alerta[] = [
  {
    id: '1',
    tipo: 'exame',
    titulo: 'Exame periódico vencido',
    descricao: 'O funcionário Pedro Henrique Lima está com o exame periódico vencido desde 20/01/2026.',
    dataCriacao: '2026-01-21',
    dataVencimento: '2026-01-25',
    prioridade: 'critica',
    status: 'pendente',
    funcionarioId: '3',
    acaoSugerida: 'Agendar exame periódico imediatamente'
  },
  {
    id: '2',
    tipo: 'treinamento',
    titulo: 'Treinamento NR-10 vencido',
    descricao: 'O funcionário Pedro Henrique Lima está com o treinamento NR-10 vencido desde 15/05/2025.',
    dataCriacao: '2025-05-16',
    dataVencimento: '2025-05-23',
    prioridade: 'critica',
    status: 'pendente',
    funcionarioId: '3',
    acaoSugerida: 'Agendar reciclagem NR-10'
  },
  {
    id: '3',
    tipo: 'exame',
    titulo: 'Exame admissional pendente',
    descricao: 'A funcionária Fernanda Souza Lima possui exame admissional agendado para 05/02/2026.',
    dataCriacao: '2026-01-30',
    dataVencimento: '2026-02-05',
    prioridade: 'alta',
    status: 'em_andamento',
    funcionarioId: '6',
    acaoSugerida: 'Confirmar comparecimento na clínica'
  },
  {
    id: '4',
    tipo: 'treinamento',
    titulo: 'Treinamento NR-06 vencido',
    descricao: 'O funcionário João Silva Santos está com o treinamento NR-06 vencido desde 10/03/2025.',
    dataCriacao: '2025-03-11',
    dataVencimento: '2025-03-18',
    prioridade: 'alta',
    status: 'pendente',
    funcionarioId: '1',
    acaoSugerida: 'Agendar reciclagem NR-06'
  },
  {
    id: '5',
    tipo: 'pgr',
    titulo: 'Revisão anual do PGR',
    descricao: 'O PGR da empresa está programado para revisão anual em 15/01/2026.',
    dataCriacao: '2026-01-01',
    dataVencimento: '2026-01-15',
    prioridade: 'media',
    status: 'em_andamento',
    acaoSugerida: 'Iniciar processo de revisão do PGR'
  },
  {
    id: '6',
    tipo: 'exame',
    titulo: 'Exame periódico em 30 dias',
    descricao: 'O funcionário Roberto Carlos Dias terá o exame periódico vencendo em 15/06/2026.',
    dataCriacao: '2026-05-16',
    dataVencimento: '2026-06-15',
    prioridade: 'baixa',
    status: 'pendente',
    funcionarioId: '5',
    acaoSugerida: 'Agendar exame periódico'
  },
  {
    id: '7',
    tipo: 'documento',
    titulo: 'Atualização de cipa',
    descricao: 'A CIPA precisa ser renovada até 30/06/2026.',
    dataCriacao: '2026-05-01',
    dataVencimento: '2026-06-30',
    prioridade: 'media',
    status: 'pendente',
    acaoSugerida: 'Iniciar processo eleitoral da CIPA'
  },
  {
    id: '8',
    tipo: 'treinamento',
    titulo: 'Treinamento NR-12 em 60 dias',
    descricao: 'O funcionário João Silva Santos terá o treinamento NR-12 vencendo em 15/03/2026.',
    dataCriacao: '2026-01-15',
    dataVencimento: '2026-03-15',
    prioridade: 'baixa',
    status: 'pendente',
    funcionarioId: '1',
    acaoSugerida: 'Agendar reciclagem NR-12'
  }
];

export const relatoriosMock: Relatorio[] = [
  {
    id: '1',
    tipo: 'compliance',
    titulo: 'Status_Compliance_Janeiro_2026',
    dataGeracao: '2026-01-30',
    periodoInicio: '2026-01-01',
    periodoFim: '2026-01-30',
    formato: 'pdf',
    url: '/relatorios/compliance_jan2026.pdf',
    tamanho: 2457600
  },
  {
    id: '2',
    tipo: 'pgr',
    titulo: 'PGR_Completo_2026',
    dataGeracao: '2026-01-15',
    periodoInicio: '2026-01-01',
    periodoFim: '2026-01-15',
    formato: 'pdf',
    url: '/relatorios/pgr_2026.pdf',
    tamanho: 4194304
  },
  {
    id: '3',
    tipo: 'exames',
    titulo: 'Exames_4T_2025',
    dataGeracao: '2025-12-31',
    periodoInicio: '2025-10-01',
    periodoFim: '2025-12-31',
    formato: 'xlsx',
    url: '/relatorios/exames_4t2025.xlsx',
    tamanho: 512000
  }
];

export const usuariosMock: Usuario[] = [
  {
    id: '1',
    nome: 'Carlos Silva',
    email: 'carlos@metalsil.com.br',
    perfil: 'admin',
    permissoes: ['*'],
    ultimoAcesso: '2026-01-30T08:30:00',
    ativo: true
  },
  {
    id: '2',
    nome: 'Eng. Paulo Santos',
    email: 'paulo@metalsil.com.br',
    perfil: 'gestor',
    permissoes: ['pgr.*', 'exames.*', 'treinamentos.*', 'alertas.*', 'relatorios.*'],
    ultimoAcesso: '2026-01-29T16:45:00',
    ativo: true
  },
  {
    id: '3',
    nome: 'Ana Lima',
    email: 'ana@metalsil.com.br',
    perfil: 'operador',
    permissoes: ['exames.read', 'exames.create', 'treinamentos.read', 'alertas.read'],
    ultimoAcesso: '2026-01-30T09:15:00',
    ativo: true
  }
];

export const dashboardMetricsMock: DashboardMetrics = {
  totalFuncionarios: 127,
  funcionariosAtivos: 118,
  indiceConformidade: 87,
  alertasPendentes: 8,
  alertasCriticos: 2,
  examesVencidos: 1,
  examesAVencer: 8,
  treinamentosVencidos: 2,
  pgrStatus: 'atencao'
};

// CNAEs e Riscos por CNAE
export const cnaeRiscos: Record<string, { descricao: string; riscos: string[]; grauRisco: number }> = {
  '2512800': {
    descricao: 'Fabricação de esquadrias de metal',
    riscos: ['Ruído', 'Fumos metálicos', 'Radiação UV', 'Cortes', 'Queda de materiais'],
    grauRisco: 3
  },
  '4110700': {
    descricao: 'Incorporação de empreendimentos imobiliários',
    riscos: ['Escritório', 'Reuniões externas'],
    grauRisco: 2
  },
  '4751201': {
    descricao: 'Comércio varejista de materiais de construção',
    riscos: ['Movimentação de cargas', 'Poeira', 'Ruído'],
    grauRisco: 2
  },
  '4930202': {
    descricao: 'Transporte rodoviário de carga',
    riscos: ['Direção de veículos', 'Movimentação de cargas', 'Postura inadequada'],
    grauRisco: 3
  }
};

// Função auxiliar para calcular métricas do dashboard
export function calcularMetricas(
  funcionarios: Funcionario[],
  exames: Exame[],
  treinamentos: Treinamento[],
  alertas: Alerta[]
): DashboardMetrics {
  const hoje = new Date();
  const trintaDias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  const examesVencidos = exames.filter(e => e.status === 'vencido').length;
  const examesAVencer = exames.filter(e => {
    const vencimento = new Date(e.dataVencimento);
    return e.status === 'realizado' && vencimento <= trintaDias && vencimento >= hoje;
  }).length;
  
  const treinamentosVencidos = treinamentos.filter(t => t.status === 'vencido').length;
  
  const alertasCriticos = alertas.filter(a => a.prioridade === 'critica' && a.status !== 'resolvido').length;
  const alertasPendentes = alertas.filter(a => a.status !== 'resolvido').length;
  
  // Cálculo simplificado do índice de conformidade
  const totalItens = exames.length + treinamentos.length;
  const itensEmDia = exames.filter(e => e.status === 'realizado').length + 
                     treinamentos.filter(t => t.status === 'vigente').length;
  const indiceConformidade = totalItens > 0 ? Math.round((itensEmDia / totalItens) * 100) : 100;
  
  return {
    totalFuncionarios: funcionarios.length,
    funcionariosAtivos: funcionarios.filter(f => f.status === 'ativo').length,
    indiceConformidade,
    alertasPendentes,
    alertasCriticos,
    examesVencidos,
    examesAVencer,
    treinamentosVencidos,
    pgrStatus: alertasCriticos > 0 ? 'atencao' : 'atualizado'
  };
}
