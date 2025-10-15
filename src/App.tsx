import { Suspense } from "react";

import { AppRoutes } from "./routes/AppRoutes";

const App = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
          <div className="glass-card px-10 py-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Carregando modulos...
            </p>
          </div>
        </div>
      }
    >
      <AppRoutes />
    </Suspense>
  );
};

export default App;
