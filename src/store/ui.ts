import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeOption =
  | "dark"
  | "nude"
  | "neon-cyan"
  | "midnight"
  | "studio";
export type SidebarVariant = "pinned" | "hover";

export type MenuSection =
  | "painel"
  | "entradas"
  | "saidas"
  | "contas"
  | "calendario"
  | "relatorios"
  | "configuracoes";

interface UIState {
  theme: ThemeOption;
  sidebarVariant: SidebarVariant;
  hiddenMenuSections: MenuSection[];
  setTheme: (theme: ThemeOption) => void;
  setSidebarVariant: (variant: SidebarVariant) => void;
  toggleMenuSection: (section: MenuSection) => void;
  resetMenuSections: () => void;
}

const ALL_SECTIONS: MenuSection[] = [
  "painel",
  "entradas",
  "saidas",
  "contas",
  "calendario",
  "relatorios",
  "configuracoes",
];

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "dark",
      sidebarVariant: "pinned",
      hiddenMenuSections: [],
      setTheme: (theme) => set({ theme }),
      setSidebarVariant: (sidebarVariant) => set({ sidebarVariant }),
      toggleMenuSection: (section) =>
        set((state) => {
          if (state.hiddenMenuSections.includes(section)) {
            return {
              hiddenMenuSections: state.hiddenMenuSections.filter(
                (item) => item !== section,
              ),
            };
          }

          return {
            hiddenMenuSections: [...state.hiddenMenuSections, section],
          };
        }),
      resetMenuSections: () => set({ hiddenMenuSections: [] }),
    }),
    {
      name: "david-finance-ui",
      partialize: (state) => ({
        theme: state.theme,
        sidebarVariant: state.sidebarVariant,
        hiddenMenuSections: state.hiddenMenuSections,
      }),
    },
  ),
);

export const isSectionVisible = (section: MenuSection, hidden: MenuSection[]) =>
  !hidden.includes(section);

export const getVisibleSections = (hidden: MenuSection[]) =>
  ALL_SECTIONS.filter((section) => isSectionVisible(section, hidden));
