import { Outlet } from "react-router-dom";
import type { PropsWithChildren } from "react";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export const AppShell = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar />
      <div className="flex flex-1 flex-col gap-6 px-8 pb-8 pt-6">
        <Topbar />
        <main className="flex-1 overflow-y-auto pb-10">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};
