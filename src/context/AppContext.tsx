import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import type { Usuario, Empresa } from "@/types";

interface AppContextType {
  usuario: Usuario | null;
  empresa: Empresa | null;
  setUsuario: (usuario: Usuario | null) => void;
  setEmpresa: (empresa: Empresa | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * AppProvider
 * Responsável apenas por armazenar estado global de sessão (usuario e empresa).
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);

  const value = useMemo(
    () => ({
      usuario,
      empresa,
      setUsuario,
      setEmpresa,
    }),
    [usuario, empresa]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * Hook de acesso ao AppContext
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp deve ser usado dentro de um AppProvider");
  }
  return context;
}
