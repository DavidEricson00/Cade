import { Navigate, Route, Routes } from 'react-router';
import { RedirectIfAuthenticated, RequireAuth } from './auth/guards';
import { ButtonLink } from './components/ui/Button';
import { EmptyState } from './components/ui/EmptyState';
import { AppLayout } from './layout/AppLayout';
import { AuthLayout } from './layout/AuthLayout';
import { usePageTitle } from './layout/page-title';
import { AccountPage } from './pages/auth/AccountPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { TwoFactorPage } from './pages/auth/TwoFactorPage';
import { DevShowcasePage } from './pages/DevShowcasePage';
import { ItemDetailPage } from './pages/items/ItemDetailPage';
import { ItemFormPage } from './pages/items/ItemFormPage';
import { ItemsListPage } from './pages/items/ItemsListPage';
import { LogsPage } from './pages/logs/LogsPage';
import { ReportsPage } from './pages/reports/ReportsPage';

function NotFoundPage() {
  usePageTitle('Página não encontrada');

  return (
    <EmptyState
      illustration="missing"
      title="Esse caminho não existe no balcão"
      description="Confira o endereço ou volte para a lista de achados."
      action={
        <ButtonLink to="/itens" variant="secondary">
          Voltar à lista
        </ButtonLink>
      }
    />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/itens" replace />} />

      {/* Rotas de autenticação (Etapa 3) */}
      <Route element={<AuthLayout />}>
        <Route element={<RedirectIfAuthenticated />}>
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/entrar/codigo" element={<TwoFactorPage />} />
        </Route>
      </Route>

      {/* Rotas principais (com sidebar no desktop e tab bar no mobile) */}
      <Route element={<AppLayout />}>
        {/* Públicas */}
        <Route path="/itens" element={<ItemsListPage />} />
        <Route path="/itens/:id" element={<ItemDetailPage />} />
        <Route path="/relatorios" element={<ReportsPage />} />
        <Route path="/dev" element={<DevShowcasePage />} />

        {/* Protegidas */}
        <Route element={<RequireAuth />}>
          <Route path="/itens/novo" element={<ItemFormPage mode="create" />} />
          <Route
            path="/itens/:id/editar"
            element={<ItemFormPage mode="edit" />}
          />
          <Route path="/registros" element={<LogsPage />} />
          <Route path="/conta" element={<AccountPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
