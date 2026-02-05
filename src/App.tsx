import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/context/AppContext';
import { SupabaseAuthProvider, useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ProtectedRoute, PublicRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import './styles/design-system.css';
import { Dashboard } from '@/pages/Dashboard';
import { Analytics } from '@/pages/Analytics';
import { PGR } from '@/pages/PGR';
import { Exames } from '@/pages/Exames';
import { Treinamentos } from '@/pages/Treinamentos';
import { Alertas } from '@/pages/Alertas';
import { Workflow } from '@/pages/Workflow';
import { Notificacoes } from '@/pages/Notificacoes';
import { ESocial } from '@/pages/ESocial';
import { MultiEmpresa } from '@/pages/MultiEmpresa';
import { Relatorios } from '@/pages/Relatorios';
import { Auditoria } from '@/pages/Auditoria';
import { Configuracoes } from '@/pages/Configuracoes';
import { LandingPage } from '@/pages/LandingPage';
import { Login } from '@/pages/Login';
import { Signup } from '@/pages/Signup';
import { Funcionarios } from '@/pages/Funcionarios';
import { Setores } from '@/pages/Setores';
import { Toaster } from '@/components/ui/sonner';
import { DataProvider } from '@/context/DataContext';

import { Breadcrumbs } from '@/components/Breadcrumbs';

// Layout do aplicativo (com sidebar) - apenas para usuários autenticados
function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { logout, perfil } = useSupabaseAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={handleLogout} usuario={perfil} />
        <main className="flex-1 overflow-y-auto">
          <Breadcrumbs />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute requiredRoles={['admin', 'gestor']}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route path="/pgr" element={<PGR />} />
            <Route path="/setores" element={<Setores />} />
            <Route path="/funcionarios" element={<Funcionarios />} />
            <Route path="/exames" element={<Exames />} />
            <Route path="/treinamentos" element={<Treinamentos />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route
              path="/workflow"
              element={
                <ProtectedRoute requiredRoles={['admin', 'gestor']}>
                  <Workflow />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notificacoes"
              element={
                <ProtectedRoute requiredRoles={['admin', 'gestor']}>
                  <Notificacoes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/esocial"
              element={
                <ProtectedRoute requiredRoles={['admin', 'gestor']}>
                  <ESocial />
                </ProtectedRoute>
              }
            />
            <Route
              path="/multi-empresa"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <MultiEmpresa />
                </ProtectedRoute>
              }
            />
            <Route
              path="/relatorios"
              element={
                <ProtectedRoute requiredRoles={['admin', 'gestor']}>
                  <Relatorios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auditoria"
              element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <Auditoria />
                </ProtectedRoute>
              }
            />
            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute requiredRoles={['admin', 'gestor']}>
                  <Configuracoes />
                </ProtectedRoute>
              }
            />
            <Route path="/ajuda" element={<div className="p-6">Página de Ajuda em desenvolvimento</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Componente principal com rotas
function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        {/* Landing Page - rota pública */}
        <Route path="/" element={<LandingPage />} />

        {/* Login - rota pública (redireciona se já estiver logado) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Signup - rota pública */}
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />

        {/* App - rotas protegidas */}
        <Route
          path="/app/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/dashboard" element={<Navigate to="/app" replace />} />

        {/* 404 - Página não encontrada */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-6">Página não encontrada</p>
                <a
                  href="#/"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voltar para home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
          },
        }}
      />
    </HashRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <SupabaseAuthProvider>
        <AppProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AppProvider>
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
}


export default App;
