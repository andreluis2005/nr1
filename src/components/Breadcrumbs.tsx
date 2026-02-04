import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
    'app': 'Dashboard',
    'analytics': 'Analytics',
    'funcionarios': 'Funcionários',
    'pgr': 'PGR',
    'exames': 'Exames',
    'treinamentos': 'Treinamentos',
    'alertas': 'Alertas',
    'workflow': 'Workflow',
    'notificacoes': 'Notificações',
    'esocial': 'eSocial',
    'multi-empresa': 'Multi-Empresa',
    'relatorios': 'Relatórios',
    'auditoria': 'Auditoria',
    'configuracoes': 'Configurações',
    'ajuda': 'Ajuda'
};

export function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Não mostrar breadcrumbs na landing page ou se estiver apenas em /app (opcional, mas comum)
    if (pathnames.length <= 1 && pathnames[0] === 'app') {
        return null;
    }

    return (
        <nav className="flex px-6 pt-6 animate-fade-in" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                <li>
                    <Link
                        to="/app"
                        className="text-neutral-400 hover:text-primary-600 transition-colors"
                    >
                        <Home className="w-4 h-4" />
                    </Link>
                </li>

                {pathnames.map((value, index) => {
                    // Pular o 'app' se ele for o primeiro, pois já temos o ícone de Home que leva pra lá
                    if (value === 'app' && index === 0) return null;

                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const label = routeLabels[value] || value.charAt(0).toUpperCase() + value.slice(1);

                    return (
                        <li key={to} className="flex items-center space-x-2">
                            <ChevronRight className="w-4 h-4 text-neutral-300" strokeWidth={1.5} />
                            {last ? (
                                <span className="text-sm font-semibold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded-md">
                                    {label}
                                </span>
                            ) : (
                                <Link
                                    to={to}
                                    className="text-sm font-medium text-neutral-500 hover:text-primary-600 transition-colors"
                                >
                                    {label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
