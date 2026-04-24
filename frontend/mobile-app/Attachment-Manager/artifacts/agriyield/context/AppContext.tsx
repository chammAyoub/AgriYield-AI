import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { type Language, translations } from "@/i18n/translations";

interface AppContextValue {
  language: Language;
  t: (key: keyof typeof translations.fr) => string;
  isRTL: boolean;
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const language: Language = "fr";

  const t = useCallback(
    (key: keyof typeof translations.fr): string => {
      return translations.fr[key] ?? key;
    },
    []
  );

  const isRTL = false;

  return (
    <AppContext.Provider
      value={{ language, t, isRTL, isLoggedIn, setIsLoggedIn }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
