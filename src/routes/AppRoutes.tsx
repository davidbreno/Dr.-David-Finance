import { lazy, Suspense } from "react";
import { Navigate, Outlet, useRoutes } from "react-router-dom";

import { useAuth } from "../providers/AuthProvider";
import { AppShell } from "../components/layout/AppShell";

const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const EntriesPage = lazy(() => import("../pages/entries/EntriesPage"));
const ExitsPage = lazy(() => import("../pages/exits/ExitsPage"));
const AccountsPage = lazy(() => import("../pages/accounts/AccountsPage"));
const CalendarPage = lazy(() => import("../pages/calendar/CalendarPage"));
const ReportsPage = lazy(() => import("../pages/reports/ReportsPage"));
const SettingsPage = lazy(() => import("../pages/settings/SettingsPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));

const ProtectedRoute = () => {
  const { user, loading, isConfigured } = useAuth();

  if (!isConfigured) {
    return <SupabaseMissingNotice />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
        <div className="glass-card flex flex-col items-center gap-3 px-10 py-8 text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
            Carregando
          </span>
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">
            Estamos preparando a sua dashboard
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

const PublicRoute = () => {
  const { user, isConfigured } = useAuth();

  if (!isConfigured) {
    return <SupabaseMissingNotice />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <Suspense fallback={<div>Carregando...</div>}>
        <Outlet />
      </Suspense>
    </div>
  );
};

const SupabaseMissingNotice = () => (
  <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
    <div className="glass-card max-w-xl space-y-4 px-8 py-10 text-center">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
        Configure o Supabase para continuar
      </h1>
      <p className="text-sm text-[var(--color-text-muted)]">
        Adicione as variaveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no
        arquivo <code>.env.local</code>, seguindo o modelo do <code>.env.example</code>. Depois,
        reinicie o servidor para habilitar autenticacao e banco de dados.
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">
        Caso ainda nao tenha um projeto, crie gratuitamente em{" "}
        <a
          href="https://supabase.com"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-[var(--color-accent)]"
        >
          supabase.com
        </a>
        .
      </p>
    </div>
  </div>
);

export const AppRoutes = () =>
  useRoutes([
    {
      element: (
        <Suspense fallback={<div>Carregando...</div>}>
          <ProtectedRoute />
        </Suspense>
      ),
      children: [
        { path: "/", element: <DashboardPage /> },
        { path: "/entradas", element: <EntriesPage /> },
        { path: "/saidas", element: <ExitsPage /> },
        { path: "/contas", element: <AccountsPage /> },
        { path: "/calendario", element: <CalendarPage /> },
        { path: "/relatorios", element: <ReportsPage /> },
        { path: "/configuracoes", element: <SettingsPage /> },
      ],
    },
    {
      path: "/auth",
      element: <PublicRoute />,
      children: [
        { path: "login", element: <LoginPage /> },
        { path: "register", element: <RegisterPage /> },
      ],
    },
    { path: "*", element: <Navigate to="/" replace /> },
  ]);
