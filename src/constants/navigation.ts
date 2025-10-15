import {
  BarChart3,
  CalendarCheck,
  FileLineChart,
  Layers,
  Settings,
  Wallet,
} from "lucide-react";

import type { MenuSection } from "../store/ui";

export type NavItem = {
  key: MenuSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
};

export const NAVIGATION_ITEMS: NavItem[] = [
  { key: "painel", label: "Painel", icon: Layers, path: "/" },
  { key: "entradas", label: "Entradas", icon: Wallet, path: "/entradas" },
  { key: "saidas", label: "Saidas", icon: Wallet, path: "/saidas" },
  { key: "contas", label: "Contas", icon: BarChart3, path: "/contas" },
  { key: "calendario", label: "Calendario", icon: CalendarCheck, path: "/calendario" },
  { key: "relatorios", label: "Relatorios", icon: FileLineChart, path: "/relatorios" },
  { key: "configuracoes", label: "Configuracoes", icon: Settings, path: "/configuracoes" },
];
