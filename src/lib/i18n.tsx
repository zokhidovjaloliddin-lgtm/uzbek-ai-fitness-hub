import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "uz" | "ru";

type Entry = { en: string; uz: string; ru?: string };
type Dict = Record<string, Entry>;

export const T: Dict = {
  // Onboarding / Auth
  onb_pick_language: { en: "Choose your language", uz: "Tilni tanlang" },
  onb_english: { en: "English", uz: "Ingliz tili" },
  onb_uzbek: { en: "O'zbek", uz: "O'zbek" },
  onb_russian: { en: "Russian", uz: "Rus tili", ru: "Русский" },
  onb_welcome_title: { en: "Welcome, Warrior", uz: "Xush kelibsiz, Bahodir" },
  onb_welcome_sub: { en: "Yujiro, Kratos, Khabib, Khamzat — the council is waiting.", uz: "Yujiro, Kratos, Xabib, Hamzat — kengash sizni kutmoqda." },
  onb_get_started: { en: "Let's Get Started", uz: "Boshlaymiz" },
  auth_sign_in: { en: "Sign In", uz: "Kirish" },
  auth_sign_up: { en: "Sign Up", uz: "Ro'yxatdan o'tish" },
  auth_sign_out: { en: "Log Out", uz: "Chiqish" },
  auth_email: { en: "Email", uz: "Email" },
  auth_password: { en: "Password", uz: "Parol" },
  auth_continue_google: { en: "Continue with Google", uz: "Google bilan davom etish" },
  auth_or: { en: "or", uz: "yoki" },
  auth_have_account: { en: "Already have an account?", uz: "Hisobingiz bormi?" },
  auth_no_account: { en: "No account yet?", uz: "Hisob yo'qmi?" },
  // Goals
  goals_tag: { en: "00 / Goals", uz: "00 / Maqsadlar" },
  goals_title_1: { en: "PICK YOUR", uz: "MAQSADINGNI" },
  goals_title_2: { en: "MISSION.", uz: "TANLA." },
  goals_sub: { en: "Select one or both. Saved to your warrior file.", uz: "Bittasini yoki ikkalasini tanla. Profilingga saqlanadi." },
  goal_strong: { en: "Get Insanely Strong", uz: "Insondan Kuchli Bo'l" },
  goal_strong_sub: { en: "Yujiro & Kratos energy", uz: "Yujiro va Kratos energiyasi" },
  goal_fight: { en: "Street Fighting / MMA Domination", uz: "Ko'cha Janggi / MMA Hukmronligi" },
  goal_fight_sub: { en: "Khabib & Khamzat energy", uz: "Xabib va Hamzat energiyasi" },
  goals_save: { en: "Lock In Mission", uz: "Maqsadni Saqlash" },
  goals_login_required: { en: "Sign in to save your goals.", uz: "Maqsadlarni saqlash uchun kiring." },
  // Tier admin
  tier_label: { en: "Membership Tier", uz: "A'zolik Darajasi" },
  tier_free: { en: "Free", uz: "Bepul" },
  tier_pro: { en: "Pro", uz: "Pro" },
  tier_ultra: { en: "Ultra", uz: "Ultra" },
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
  co_disciplines_free: { en: "Discipline (Free: pick 1)", uz: "Yo'nalish (Free: 1 ta)" },
  co_disciplines_pro: { en: "Disciplines (Pro: max 3)", uz: "Yo'nalishlar (Pro: maks 3)" },
  co_disciplines_ultra: { en: "Disciplines (Ultra: max 5)", uz: "Yo'nalishlar (Ultra: maks 5)" },
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
  // Tier-specific UX
  co_briefing_must_watch: { en: "Buni ko'rishing shart!", uz: "Buni ko'rishing shart!" },
  co_plan_ready_btn: { en: "Sening trenirofka planing tayyor!", uz: "Sening trenirofka planing tayyor!" },
  co_free_no_briefing: { en: "Free plan: no Warrior Briefing. Upgrade to Pro to unlock cinematic videos.", uz: "Free plan: Briefing yo'q. Pro'ga o'tib videolarni och." },
  co_ultra_only_gallery: { en: "Ultra-only: Watch More Edits", uz: "Faqat Ultra: Yana Edittlar" },
  co_direct_contact: { en: "DIRECT COACH CONTACT", uz: "TO'G'RIDAN-TO'G'RI COACH" },
  // Archetype phrases (direct "Sen" energy)
  ph_yujiro: { en: "Yujiro kuchini yerdan oladi.", uz: "Yujiro kuchini yerdan oladi." },
  ph_kratos: { en: "Kratos tog'larni parcha parcha qilib tashlaydi.", uz: "Kratos tog'larni parcha parcha qilib tashlaydi." },
  ph_khabib: { en: "Burgut o'ljasini qo'yib yubormaydi.", uz: "Burgut o'ljasini qo'yib yubormaydi." },
  ph_khamzat: { en: "Borz o'ljasini har bir sekundigacha boshqaradi.", uz: "Borz o'ljasini har bir sekundigacha boshqaradi." },
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
  pr_already_pro: { en: "Sen allaqachon pro plandasan.", uz: "Sen allaqachon pro plandasan." },
  pr_already_elite: { en: "Sen allaqachon elitniy plandasan.", uz: "Sen allaqachon elitniy plandasan." },
  pr_already_free: { en: "Sen allaqachon Free plandasan.", uz: "Sen allaqachon Free plandasan." },
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

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof T) => string;
  hasChosen: boolean;
};
const LangContext = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => T[k]?.en ?? String(k),
  hasChosen: false,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>("en");
  const [hasChosen, setHasChosen] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("absolute_frame_lang") as Lang | null;
    if (saved === "en" || saved === "uz") {
      setLangState(saved);
      setHasChosen(true);
    }
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    setHasChosen(true);
    localStorage.setItem("absolute_frame_lang", l);
  };
  const t = (key: keyof typeof T) => T[key]?.[lang] ?? T[key]?.en ?? String(key);
  return <LangContext.Provider value={{ lang, setLang, t, hasChosen }}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);
