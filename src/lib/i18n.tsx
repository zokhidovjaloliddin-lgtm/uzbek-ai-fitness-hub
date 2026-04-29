import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "uz";

type Dict = Record<string, { en: string; uz: string }>;

export const T: Dict = {
  // Navbar
  nav_analysis: { en: "Body Analysis", uz: "Tana Tahlili" },
  nav_coach: { en: "AI Coach", uz: "AI Murabbiy" },
  nav_pricing: { en: "Pricing", uz: "Narxlar" },
  // Hero
  hero_kicker: { en: "Primordial Protocol · v1.0", uz: "Asl Protokol · v1.0" },
  hero_title_1: { en: "FORGE THE", uz: "TANANGNI" },
  hero_title_2: { en: "BODY OF A", uz: "BAHODIRGA" },
  hero_title_3: { en: "WARRIOR.", uz: "AYLANTIR." },
  hero_sub: {
    en: "AI-driven calisthenics protocols built for Tashkent streets. Track your stats, unleash your archetype, train with savage Uzbek-English slang.",
    uz: "Toshkent ko'chalari uchun AI-asosli kalisteniks protokollar. Statistikangni kuzat, arxetipingni ochib ber, Uzbek-English jargon bilan mashq qil.",
  },
  hero_cta_1: { en: "Begin Analysis", uz: "Tahlilni Boshlash" },
  hero_cta_2: { en: "Summon Coach", uz: "Murabbiyni Chaqir" },
  // Body Analysis
  ba_tag: { en: "01 / Body Analysis", uz: "01 / Tana Tahlili" },
  ba_title_1: { en: "KNOW YOUR", uz: "FREYMINGNI" },
  ba_title_2: { en: "FRAME.", uz: "BIL." },
  ba_sub: {
    en: "Enter your raw stats. The system computes your BMI in real time and locks it into your local vault.",
    uz: "Statistikangni kirit. Tizim BMI'ni real vaqtda hisoblab, mahalliy xotirangga saqlaydi.",
  },
  ba_save: { en: "Lock Into Vault", uz: "Xotiraga Saqlash" },
  // Coach
  co_tag: { en: "02 / Primordial AI Coach", uz: "02 / Asl AI Murabbiy" },
  co_title_1: { en: "SUMMON YOUR", uz: "ARXETIPINGNI" },
  co_title_2: { en: "ARCHETYPE.", uz: "CHAQIR." },
  co_sub: {
    en: "Gemini-powered protocol generator. Speaks Uzbek-English slang. Knows the Tashkent calisthenics circuit.",
    uz: "Gemini quvvatidagi protokol generatori. Uzbek-English jargon biladi. Toshkent kalisteniks maydonlarini taniydi.",
  },
  co_generate: { en: "Generate Protocol", uz: "Protokolni Yaratish" },
  co_try_again: { en: "Try Again", uz: "Qayta Urinish" },
  // Pricing
  pr_tag: { en: "03 / Pricing", uz: "03 / Narxlar" },
  pr_title_1: { en: "CHOOSE YOUR", uz: "TARIFNI" },
  pr_title_2: { en: "TIER.", uz: "TANLA." },
  pr_sub: {
    en: "Three paths. One destination — total dominion over the frame.",
    uz: "Uch yo'l. Bitta manzil — tanani to'liq nazoratga olish.",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: keyof typeof T) => string };
const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => T[k]?.en ?? String(k) });

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem("absolute_frame_lang") as Lang | null;
    if (saved === "en" || saved === "uz") setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("absolute_frame_lang", l);
  };
  const t = (key: keyof typeof T) => T[key]?.[lang] ?? T[key]?.en ?? String(key);
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);