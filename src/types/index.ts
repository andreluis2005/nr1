// Tipos principais do NR1 Pro

export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  cnae: string;
  descricaoCnae: string;
  endereco: Endereco;
  contato: Contato;
  grauRisco: 1 | 2 | 3 | 4;
  dataCadastro: string;
}

export interface Endereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Contato {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
}

export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  matricula: string;
  dataAdmissao: string;
  dataNascimento: string;
  cargo: string;
  setor: string;
  status: 'ativo' | 'afastado' | 'ferias' | 'demissional';
  sexo: 'M' | 'F';
  exames: Exame[];
  treinamentos: Treinamento[];
}

export interface Exame {
  id: string;
  funcionarioId: string;
  tipo: 'admissional' | 'periodico' | 'demissional' | 'retorno' | 'mudanca_funcao';
  dataRealizacao: string;
  dataVencimento: string;
  status: 'agendado' | 'realizado' | 'vencido' | 'pendente';
  clinica: string;
  resultado?: string;
  observacoes?: string;
}

export interface Treinamento {
  id: string;
  funcionarioId: string;
  nr: string;
  descricao: string;
  dataRealizacao: string;
  dataVencimento: string;
  cargaHoraria: number;
  instrutor: string;
  status: 'vigente' | 'vencido' | 'agendado';
}

export interface Risco {
  id: string;
  tipo: 'fisico' | 'quimico' | 'biologico' | 'ergonomico' | 'acidente';
  agente: string;
  descricao: string;
  setores: string[];
  funcoes: string[];
  limiteTolerancia?: string;
  medidasPreventivas: string[];
  grauRisco: 'leve' | 'moderado' | 'grave' | 'critico';
}

export interface PGR {
  id: string;
  empresaId: string;
  versao: number;
  dataCriacao: string;
  dataRevisao: string;
  status: 'rascunho' | 'ativo' | 'revisao' | 'obsoleto';
  etapaPDCA: 'planejar' | 'fazer' | 'checar' | 'agir';
  riscos: Risco[];
  medidasControle: MedidaControle[];
  responsavel: string;
}

export interface MedidaControle {
  id: string;
  riscoId: string;
  tipo: 'eliminacao' | 'substituicao' | 'engenharia' | 'administrativa' | 'epi';
  descricao: string;
  implementada: boolean;
  dataImplementacao?: string;
  responsavel: string;
}

export interface Alerta {
  id: string;
  tipo: 'exame' | 'treinamento' | 'pgr' | 'documento' | 'multa';
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataVencimento: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  status: 'pendente' | 'em_andamento' | 'resolvido' | 'ignorado';
  funcionarioId?: string;
  acaoSugerida?: string;
}

export interface Acidente {
  id: string;
  funcionarioId: string;
  dataAcidente: string;
  horaAcidente: string;
  local: string;
  descricao: string;
  tipo: 'tipico' | 'atipico' | 'trajeto';
  afastamento: boolean;
  diasAfastamento?: number;
  catEmitida: boolean;
  numeroCAT?: string;
  investigacao?: InvestigacaoAcidente;
}

export interface InvestigacaoAcidente {
  causasRaiz: string[];
  medidasCorretivas: string[];
  responsavelInvestigacao: string;
  dataInvestigacao: string;
  conclusao: string;
}

export interface DashboardMetrics {
  totalFuncionarios: number;
  funcionariosAtivos: number;
  indiceConformidade: number;
  alertasPendentes: number;
  alertasCriticos: number;
  examesVencidos: number;
  examesAVencer: number;
  treinamentosVencidos: number;
  pgrStatus: 'atualizado' | 'atencao' | 'vencido';
}

export interface Relatorio {
  id: string;
  tipo: 'compliance' | 'pgr' | 'exames' | 'treinamentos' | 'alertas' | 'acidentes';
  titulo: string;
  dataGeracao: string;
  periodoInicio: string;
  periodoFim: string;
  formato: 'pdf' | 'xlsx';
  url: string;
  tamanho: number;
}

export interface Setor {
  id: string;
  nome: string;
  descricao?: string;
  funcoes: Funcao[];
  riscos: string[]; // IDs dos riscos
}

export interface Funcao {
  id: string;
  nome: string;
  descricao?: string;
  cbo?: string;
  setorId: string;
  riscos: string[]; // IDs dos riscos
}

export interface ConfiguracaoAlerta {
  tipo: string;
  diasAntecedencia: number;
  email: boolean;
  notificacao: boolean;
  responsaveis: string[];
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'gestor' | 'operador' | 'visualizador';
  permissoes: string[];
  ultimoAcesso?: string;
  ativo: boolean;
}
