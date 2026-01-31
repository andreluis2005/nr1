import { Bell, User, ChevronDown, Building2, LogOut, Settings, Search } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onLogout?: () => void;
  usuario?: { nome: string; email: string; perfil: string } | null;
}

export function Header({ onLogout, usuario: propUsuario }: HeaderProps) {
  const { empresa, alertas } = useApp();
  const { usuario: authUsuario, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const usuario = propUsuario || authUsuario;

  const alertasPendentes = alertas.filter(a => a.status !== 'resolvido');
  const alertasCriticos = alertasPendentes.filter(a => a.prioridade === 'critica');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-danger-500';
      case 'alta': return 'bg-warning-500';
      case 'media': return 'bg-warning-400';
      default: return 'bg-primary-500';
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logout();
    }
    setShowUserMenu(false);
  };

  const getPerfilLabel = (perfil: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      gestor: 'Gestor',
      operador: 'Operador',
      visualizador: 'Visualizador'
    };
    return labels[perfil] || perfil;
  };

  const getPerfilColor = (perfil: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-accent-purple/10 text-accent-purple',
      gestor: 'bg-primary-500/10 text-primary-600',
      operador: 'bg-success-500/10 text-success-600',
      visualizador: 'bg-neutral-500/10 text-neutral-600'
    };
    return colors[perfil] || 'bg-neutral-500/10 text-neutral-600';
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-neutral-150 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left side - Search & Company */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-64 pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>

        {/* Company Info */}
        <div className="flex items-center gap-3 pl-6 border-l border-neutral-200">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-neutral-900">{empresa.nomeFantasia}</p>
            <p className="text-2xs text-neutral-500 uppercase tracking-wide">CNPJ {empresa.cnpj}</p>
          </div>
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {/* Security Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-success-50 rounded-full border border-success-100">
          <div className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse" />
          <span className="text-2xs font-medium text-success-700 uppercase tracking-wide">Sessão Segura</span>
        </div>

        {/* Theme Toggle */}
        <div className="pl-2 border-l border-neutral-200">
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-all"
          >
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            {alertasPendentes.length > 0 && (
              <span className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full text-2xs font-medium text-white flex items-center justify-center ring-2 ring-white ${
                alertasCriticos.length > 0 ? 'bg-danger-500' : 'bg-primary-500'
              }`}>
                {alertasPendentes.length > 9 ? '9+' : alertasPendentes.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-neutral-150 z-50 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900">Notificações</h3>
                  <p className="text-2xs text-neutral-500 mt-0.5">{alertasPendentes.length} pendentes</p>
                </div>
                <button className="text-2xs text-primary-600 hover:text-primary-700 font-medium">
                  Marcar todas como lidas
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {alertasPendentes.slice(0, 5).map((alerta) => (
                  <div
                    key={alerta.id}
                    className="p-4 hover:bg-neutral-50 border-b border-neutral-100 last:border-0 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${getPrioridadeColor(alerta.prioridade)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 truncate">
                          {alerta.titulo}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                          {alerta.descricao}
                        </p>
                        <p className="text-2xs text-neutral-400 mt-2">
                          {new Date(alerta.dataCriacao).toLocaleDateString('pt-BR', { 
                            day: 'numeric', 
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {alertasPendentes.length === 0 && (
                  <div className="p-10 text-center">
                    <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-5 h-5 text-neutral-400" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-neutral-500">Nenhuma notificação pendente</p>
                  </div>
                )}
              </div>
              {alertasPendentes.length > 0 && (
                <div className="p-3 border-t border-neutral-100 bg-neutral-50">
                  <Link
                    to="/app/alertas"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Ver todas as notificações
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 p-1.5 pr-3 hover:bg-neutral-100 rounded-xl transition-all"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPerfilColor(usuario?.perfil || '')}`}>
              <User className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-neutral-900">{usuario?.nome}</p>
              <p className="text-2xs text-neutral-500">{getPerfilLabel(usuario?.perfil || '')}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-neutral-150 z-50 overflow-hidden animate-fade-in-up">
              <div className="p-4 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getPerfilColor(usuario?.perfil || '')}`}>
                    <User className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{usuario?.nome}</p>
                    <p className="text-xs text-neutral-500">{usuario?.email}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-2xs font-medium ${getPerfilColor(usuario?.perfil || '')}`}>
                    {getPerfilLabel(usuario?.perfil || '')}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-0.5">
                <Link
                  to="/app/configuracoes"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                  Configurações
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
