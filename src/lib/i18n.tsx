import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "uz";

type Dict = Record<string, { en: string; uz: string }>;

export const T: Dict = {
  // Navbar
  nav_analysis: { en: "Body Analysis", uz: "Tana Tahlili" },
  nav_coach: { en: "AI Coach", uz: "AI Murabbiy" },
  nav_pricing: { en: "Pricing", uz: "Narxlar" },
  nav_contact: { en: "Contact Coach", uz: "Coach bilan bog'lanish" },
  // Hero
  hero_kicker: { en: "Primordial Protocol · v1.0", uz: "Asl Protokol · v1.0" },
  hero_title_1: { en: "FORGE THE", uz: "TANANGNI" },
  hero_title_2: { en: "BODY OF A", uz: "BAHODIRGA" },
  hero_title_3: { en: "WARRIOR.", uz: "AYLANTIR." },
  hero_sub: {
    en: "AI-driven street-style protocols built for Tashkent. Track your stats, unleash your archetype, train with savage Uzbek-English slang.",
    uz: "Toshkent uchun AI-asosli ko'cha uslubidagi protokollar. Statistikangni kuzat, arxetipingni ochib ber, Uzbek-English jargon bilan mashq qil.",
  },
  hero_tagline: { en: "Boriku, brat. Beast mode activated.", uz: "Boriku, brat. Beast mode aktivlashdi." },
  hero_cta_1: { en: "Begin Analysis", uz: "Tahlilni Boshlash" },
  hero_cta_2: { en: "Summon Coach", uz: "Murabbiyni Chaqir" },
  hero_stat_1: { en: "Day Protocol", uz: "Kunlik Protokol" },
  hero_stat_2: { en: "Warrior Archetypes", uz: "Bahodir Arxetiplari" },
  hero_stat_3: { en: "Tashkent Parks", uz: "Toshkent Parklari" },
  hero_stat_4: { en: "Mind Reps", uz: "Aql Takrorlari" },
  // Body Analysis
  ba_tag: { en: "01 / Body Analysis", uz: "01 / Tana Tahlili" },
  ba_title_1: { en: "KNOW YOUR", uz: "FREYMINGNI" },
  ba_title_2: { en: "FRAME.", uz: "BIL." },
  ba_sub: {
    en: "Enter your raw stats. The system computes your BMI in real time and locks it into your local vault.",
    uz: "Statistikangni kirit. Tizim BMI'ni real vaqtda hisoblab, mahalliy xotirangga saqlaydi.",
  },
  ba_height: { en: "Height (cm)", uz: "Bo'y (sm)" },
  ba_weight: { en: "Weight (kg)", uz: "Vazn (kg)" },
  ba_save: { en: "Lock Into Vault", uz: "Xotiraga Saqlash" },
  ba_result: { en: "Result Index", uz: "Natija Indeksi" },
  ba_awaiting: { en: "Awaiting input", uz: "Kiritishni kutmoqda" },
  ba_under: { en: "Under", uz: "Past" },
  ba_normal: { en: "Normal", uz: "Normal" },
  ba_over: { en: "Over", uz: "Yuqori" },
  ba_obese: { en: "Obese", uz: "Semizlik" },
  ba_persisted: { en: "Persisted", uz: "Saqlangan" },
  // Coach
  co_tag: { en: "02 / Primordial AI Coach", uz: "02 / Asl AI Murabbiy" },
  co_title_1: { en: "SUMMON YOUR", uz: "ARXETIPINGNI" },
  co_title_2: { en: "ARCHETYPE.", uz: "CHAQIR." },
  co_sub: {
    en: "Gemini-powered protocol generator. Speaks Uzbek-English slang. Knows the Tashkent street-fight circuit.",
    uz: "Gemini quvvatidagi protokol generatori. Uzbek-English jargon biladi. Toshkent ko'cha jang maydonlarini taniydi.",
  },
  co_config: { en: "Configuration", uz: "Sozlama" },
  co_archetype: { en: "Warrior Archetype", uz: "Bahodir Arxetipi" },
  co_disciplines: { en: "Disciplines (max 5)", uz: "Yo'nalishlar (maks 5)" },
  co_goal: { en: "Goal", uz: "Maqsad" },
  co_level: { en: "Level", uz: "Daraja" },
  co_generate: { en: "Generate Training Plan", uz: "Mashg'ulot Rejasini Yaratish" },
  co_locked: { en: "Watch the briefing to unlock", uz: "Ochish uchun briefingni ko'r" },
  co_confirm: { en: "Confirm Selections", uz: "Tanlovni Tasdiqlash" },
  co_change_selections: { en: "Change Selections", uz: "Tanlovni O'zgartirish" },
  co_try_again: { en: "Try Again", uz: "Qayta Urinish" },
  co_briefing: { en: "Warrior Briefing — Watch This", uz: "Bahodir Briefingi — Buni Ko'r" },
  co_briefing_sub: {
    en: "Watch the briefing. Absorb the energy. Unlock the training plan.",
    uz: "Briefingni ko'r. Energiyani his qil. Mashg'ulot rejasini ochib ber.",
  },
  co_unlock_hint: { en: "Tap the player to mark briefing complete.", uz: "Briefing tugadi deb belgilash uchun pleyerga bos." },
  co_unlocked: { en: "Briefing complete · Protocol unlocked", uz: "Briefing tugadi · Protokol ochildi" },
  co_more_edits: { en: "Watch More Edits", uz: "Yana Ediltlar" },
  co_close: { en: "Close", uz: "Yopish" },
  co_ready: { en: "I AM READY TO TRAIN", uz: "MASHG'ULOTNI BOSHLASHGA TAYYORMAN" },
  co_hide_edits: { en: "Hide Edits", uz: "Edittlarni Yashirish" },
  co_output: { en: "Training Plan Output", uz: "Mashg'ulot Rejasi Natijasi" },
  co_copy: { en: "Copy Training Plan", uz: "Rejani Nusxalash" },
  co_clear: { en: "Clear Vault", uz: "Xotirani Tozalash" },
  co_saved: { en: "Saved", uz: "Saqlangan" },
  co_loading: { en: "Channeling primordial energy... Daxshat!", uz: "Asl energiya yig'ilmoqda... Daxshat!" },
  co_forging: { en: "Forging...", uz: "Yaratilmoqda..." },
  co_empty_title: { en: "AWAITING SUMMON", uz: "CHAQIRIQ KUTILMOQDA" },
  co_empty_sub: { en: "Choose your warrior, pick your training method, then watch the briefing. Aka, ready bo'l.", uz: "Bahodiringni tanla, mashg'ulot uslubini belgila, keyin briefingni ko'r. Aka, ready bo'l." },
  co_err_title: { en: "Xatolik: Tarmoq charchadi, aka.", uz: "Xatolik: Tarmoq charchadi, aka." },
  co_err_sub: { en: "Internetni tekshiring!", uz: "Internetni tekshiring!" },
  co_err_tag: { en: "System Failure", uz: "Tizim Xatosi" },
  co_success: { en: "Reja tayyor! Bo'shashmang, faqat olg'a!", uz: "Reja tayyor! Bo'shashmang, faqat olg'a!" },
  // Pricing
  pr_tag: { en: "03 / Pricing", uz: "03 / Narxlar" },
  pr_title_1: { en: "CHOOSE YOUR", uz: "TARIFNI" },
  pr_title_2: { en: "TIER.", uz: "TANLA." },
  pr_sub: {
    en: "Three paths. One destination — total dominion over the frame.",
    uz: "Uch yo'l. Bitta manzil — tanani to'liq nazoratga olish.",
  },
  pr_status: { en: "Account Status", uz: "Hisob Holati" },
  pr_active: { en: "✓ ACTIVE PLAN", uz: "✓ FAOL REJA" },
  pr_activate_free: { en: "Activate Free", uz: "Bepul Faollashtirish" },
  pr_subscribe: { en: "Subscribe", uz: "Obuna bo'lish" },
  pr_most: { en: "Most Chosen", uz: "Eng Tanlangan" },
  // Disciplines
  d_mma: { en: "MMA", uz: "MMA" },
  d_box: { en: "Street Boxing", uz: "Ko'cha Boksi" },
  d_wre: { en: "Wrestling (Kurash)", uz: "Kurash" },
  d_muay: { en: "Muay Thai", uz: "Muay Thai" },
  d_street: { en: "Street Fighting", uz: "Ko'cha Janggi" },
  d_cali: { en: "Calisthenics", uz: "Kalisteniks" },
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
