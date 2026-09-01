"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type AdminLang = "en" | "ar";

interface AdminLangCtx {
  lang: AdminLang;
  setLang: (l: AdminLang) => void;
  t: (en: string, ar: string) => string;
}

const LangContext = createContext<AdminLangCtx>({
  lang: "en",
  setLang: () => {},
  t: (en) => en,
});

export function AdminLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<AdminLang>("en");

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const saved = localStorage.getItem("admin-locale");
      if (saved === "ar" || saved === "en") setLang(saved);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("admin-locale", lang);
  }, [lang]);

  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useAdminLang() {
  return useContext(LangContext);
}
