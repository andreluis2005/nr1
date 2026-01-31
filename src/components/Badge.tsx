import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variants = {
  default: 'bg-blue-100 text-blue-800 border-blue-200',
  success: 'bg-green-100 text-green-800 border-green-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  neutral: 'bg-gray-100 text-gray-800 border-gray-200'
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base'
};

export function Badge({ 
  children, 
  variant = 'default', 
  size = 'sm',
  className 
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Badge específico para status
interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const statusConfig: Record<string, { variant: BadgeProps['variant']; label: string; dot: string }> = {
    // Status gerais
    ativo: { variant: 'success', label: 'Ativo', dot: 'bg-green-500' },
    inativo: { variant: 'neutral', label: 'Inativo', dot: 'bg-gray-400' },
    pendente: { variant: 'warning', label: 'Pendente', dot: 'bg-yellow-500' },
    
    // Status de exames
    realizado: { variant: 'success', label: 'Realizado', dot: 'bg-green-500' },
    agendado: { variant: 'info', label: 'Agendado', dot: 'bg-blue-500' },
    vencido: { variant: 'danger', label: 'Vencido', dot: 'bg-red-500' },
    
    // Status de treinamentos
    vigente: { variant: 'success', label: 'Vigente', dot: 'bg-green-500' },
    
    // Status de alertas
    critica: { variant: 'danger', label: 'Crítico', dot: 'bg-red-500' },
    alta: { variant: 'warning', label: 'Alta', dot: 'bg-orange-500' },
    media: { variant: 'info', label: 'Média', dot: 'bg-blue-500' },
    baixa: { variant: 'neutral', label: 'Baixa', dot: 'bg-gray-400' },
    
    // Status de PGR
    atualizado: { variant: 'success', label: 'Atualizado', dot: 'bg-green-500' },
    atencao: { variant: 'warning', label: 'Atenção', dot: 'bg-yellow-500' },
    
    // Status de funcionários
    afastado: { variant: 'warning', label: 'Afastado', dot: 'bg-yellow-500' },
    ferias: { variant: 'info', label: 'Férias', dot: 'bg-blue-500' },
    demissional: { variant: 'danger', label: 'Demissional', dot: 'bg-red-500' },
    
    // Status de alertas
    em_andamento: { variant: 'info', label: 'Em Andamento', dot: 'bg-blue-500' },
    resolvido: { variant: 'success', label: 'Resolvido', dot: 'bg-green-500' },
    ignorado: { variant: 'neutral', label: 'Ignorado', dot: 'bg-gray-400' }
  };

  const config = statusConfig[status.toLowerCase()] || { 
    variant: 'neutral', 
    label: status, 
    dot: 'bg-gray-400' 
  };

  return (
    <Badge variant={config.variant} size={size} className={className}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </Badge>
  );
}

// Badge para prioridade
interface PriorityBadgeProps {
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PriorityBadge({ priority, size = 'sm', className }: PriorityBadgeProps) {
  return <StatusBadge status={priority} size={size} className={className} />;
}
