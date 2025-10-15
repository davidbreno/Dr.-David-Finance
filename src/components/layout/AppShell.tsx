import { Outlet } from "react-router-dom";
import type { PropsWithChildren } from "react";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";
import { LabeledErrorBoundary } from "../common/ErrorBoundary";

export const AppShell = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)] lg:flex-row">
      <LabeledErrorBoundary label="Sidebar">
        <Sidebar />
      </LabeledErrorBoundary>
      <div className="flex flex-1 flex-col gap-6 px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
        <LabeledErrorBoundary label="Topbar">
          <Topbar />
        </LabeledErrorBoundary>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-12">
            <LabeledErrorBoundary label="MainChildren">
              {children ?? <Outlet />}
            </LabeledErrorBoundary>
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};


