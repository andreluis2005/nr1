import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Stethoscope, 
  GraduationCap, 
  Bell, 
  BarChart3, 
  Settings,
  HelpCircle,
  Shield,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Fingerprint,
  CheckSquare,
  Send,
  Building2
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  path: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { path: '/app', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/analytics', icon: TrendingUp, label: 'Analytics' },
  { path: '/app/pgr', icon: FileText, label: 'PGR' },
  { path: '/app/exames', icon: Stethoscope, label: 'Exames' },
  { path: '/app/treinamentos', icon: GraduationCap, label: 'Treinamentos' },
  { path: '/app/alertas', icon: Bell, label: 'Alertas', badge: 8 },
  { path: '/app/workflow', icon: CheckSquare, label: 'Workflow' },
  { path: '/app/notificacoes', icon: Send, label: 'Notificações' },
  { path: '/app/esocial', icon: Shield, label: 'eSocial' },
  { path: '/app/multi-empresa', icon: Building2, label: 'Multi-Empresa' },
  { path: '/app/relatorios', icon: BarChart3, label: 'Relatórios' },
  { path: '/app/auditoria', icon: Fingerprint, label: 'Auditoria' },
  { path: '/app/configuracoes', icon: Settings, label: 'Configurações' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside 
      className={`bg-white border-r border-neutral-150 h-screen flex flex-col transition-all duration-300 ease-smooth ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-150">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Shield className="w-5 h-5 text-white" strokeWidth={1.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-neutral-900 tracking-tight">NR1 Pro</span>
              <span className="text-2xs text-neutral-400 uppercase tracking-wide">Compliance</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-md transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto scrollbar-thin">
        {/* Main Section */}
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-2xs font-medium text-neutral-400 uppercase tracking-wide">Principal</p>
          </div>
        )}
        {menuItems.slice(0, 5).map((item) => (
          <NavItem 
            key={item.path} 
            item={item} 
            collapsed={collapsed} 
            isActive={isActive(item.path)}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
          />
        ))}

        {/* Management Section */}
        {!collapsed && (
          <div className="px-3 py-2 mt-4">
            <p className="text-2xs font-medium text-neutral-400 uppercase tracking-wide">Gestão</p>
          </div>
        )}
        {menuItems.slice(5, 10).map((item) => (
          <NavItem 
            key={item.path} 
            item={item} 
            collapsed={collapsed}
            isActive={isActive(item.path)}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
          />
        ))}

        {/* System Section */}
        {!collapsed && (
          <div className="px-3 py-2 mt-4">
            <p className="text-2xs font-medium text-neutral-400 uppercase tracking-wide">Sistema</p>
          </div>
        )}
        {menuItems.slice(10).map((item) => (
          <NavItem 
            key={item.path} 
            item={item} 
            collapsed={collapsed}
            isActive={isActive(item.path)}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-neutral-150">
        <NavLink
          to="/app/ajuda"
          className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-fast
            ${isActive 
              ? 'bg-primary-50 text-primary-600' 
              : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
            }
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Ajuda' : undefined}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
          {!collapsed && (
            <span className="font-medium text-sm">Ajuda</span>
          )}
        </NavLink>
      </div>
    </aside>
  );
}

interface NavItemProps {
  item: MenuItem;
  collapsed: boolean;
  isActive: boolean;
  hoveredItem: string | null;
  setHoveredItem: (path: string | null) => void;
}

function NavItem({ item, collapsed, isActive, hoveredItem, setHoveredItem }: NavItemProps) {
  const Icon = item.icon;
  const isHovered = hoveredItem === item.path;

  return (
    <NavLink
      to={item.path}
      onMouseEnter={() => setHoveredItem(item.path)}
      onMouseLeave={() => setHoveredItem(null)}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-fast group
        ${isActive
          ? 'bg-primary-50 text-primary-600'
          : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
      title={collapsed ? item.label : undefined}
      end={item.path === '/app'}
    >
      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary-500 rounded-r-full" />
      )}

      {/* Icon */}
      <div className={`
        relative flex items-center justify-center
        ${isActive ? 'text-primary-600' : 'text-neutral-500 group-hover:text-neutral-700'}
      `}>
        <Icon 
          className={`w-5 h-5 transition-all duration-fast ${isActive ? '' : 'group-hover:scale-105'}`} 
          strokeWidth={isActive ? 2 : 1.5} 
        />
        
        {/* Badge */}
        {item.badge && item.badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger-500 text-white text-2xs font-medium rounded-full flex items-center justify-center ring-2 ring-white">
            {item.badge > 9 ? '9+' : item.badge}
          </span>
        )}
      </div>

      {/* Label */}
      {!collapsed && (
        <span className={`font-medium text-sm transition-all duration-fast ${
          isActive ? 'font-semibold' : ''
        }`}>
          {item.label}
        </span>
      )}

      {/* Hover Tooltip for collapsed */}
      {collapsed && isHovered && (
        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg whitespace-nowrap z-50 animate-fade-in">
          {item.label}
          {item.badge && item.badge > 0 && (
            <span className="ml-2 text-danger-300">({item.badge})</span>
          )}
          <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-neutral-900 rotate-45" />
        </div>
      )}
    </NavLink>
  );
}
