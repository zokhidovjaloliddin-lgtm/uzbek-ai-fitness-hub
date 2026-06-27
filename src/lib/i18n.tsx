import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "uz" | "ru";

type Entry = { en: string; uz: string; ru?: string };
type Dict = Record<string, Entry>;

export const T: Dict = {
  // Onboarding / Auth
  onb_pick_language: { en: "Choose your language", uz: "Tilni tanlang", ru: "Выберите язык" },
  onb_english: { en: "English", uz: "Ingliz tili", ru: "Английский" },
  onb_uzbek: { en: "Uzbek", uz: "O'zbek", ru: "Узбекский" },
  onb_russian: { en: "Russian", uz: "Rus tili", ru: "Русский" },
  onb_welcome_title: { en: "Welcome, Athlete", uz: "Xush kelibsiz, Sportchi", ru: "Добро пожаловать, атлет" },
  onb_welcome_sub: {
    en: "Yujiro, Kratos, Khabib, Khamzat — the council awaits.",
    uz: "Yujiro, Kratos, Xabib, Hamzat — kengash sizni kutmoqda.",
    ru: "Юджиро, Кратос, Хабиб, Хамзат — совет ожидает.",
  },
  onb_get_started: { en: "Let's Get Started", uz: "Boshlaymiz", ru: "Начнём" },
  auth_sign_in: { en: "Sign In", uz: "Kirish", ru: "Войти" },
  auth_sign_up: { en: "Sign Up", uz: "Ro'yxatdan o'tish", ru: "Регистрация" },
  auth_sign_out: { en: "Log Out", uz: "Chiqish", ru: "Выйти" },
  auth_email: { en: "Email", uz: "Elektron pochta", ru: "Эл. почта" },
  auth_password: { en: "Password", uz: "Parol", ru: "Пароль" },
  auth_continue_google: { en: "Continue with Google", uz: "Google orqali davom etish", ru: "Продолжить с Google" },
  auth_or: { en: "or", uz: "yoki", ru: "или" },
  auth_have_account: { en: "Already have an account?", uz: "Hisobingiz bormi?", ru: "Уже есть аккаунт?" },
  auth_no_account: { en: "No account yet?", uz: "Hisobingiz yo'qmi?", ru: "Нет аккаунта?" },
  // Goals
  goals_tag: { en: "00 / Goals", uz: "00 / Maqsadlar", ru: "00 / Цели" },
  goals_title_1: { en: "PICK YOUR", uz: "MAQSADINGIZNI", ru: "ВЫБЕРИТЕ" },
  goals_title_2: { en: "MISSION.", uz: "TANLANG.", ru: "ЦЕЛЬ." },
  goals_sub: {
    en: "Select one or both. Saved to your athlete profile.",
    uz: "Bittasini yoki ikkalasini tanlang. Profilingizga saqlanadi.",
    ru: "Выберите одну или обе. Сохраняется в ваш профиль.",
  },
  goal_strong: { en: "Build Elite Strength", uz: "Yuqori Darajadagi Kuch", ru: "Элитная сила" },
  goal_strong_sub: { en: "Yujiro & Kratos discipline", uz: "Yujiro va Kratos intizomi", ru: "Дисциплина Юджиро и Кратоса" },
  goal_fight: { en: "Combat Sports Mastery", uz: "Jangovar Sport Mahorati", ru: "Мастерство боевых искусств" },
  goal_fight_sub: { en: "Khabib & Khamzat discipline", uz: "Xabib va Hamzat intizomi", ru: "Дисциплина Хабиба и Хамзата" },
  goals_save: { en: "Confirm Mission", uz: "Maqsadni Tasdiqlash", ru: "Подтвердить цель" },
  goals_login_required: { en: "Sign in to save your goals.", uz: "Maqsadlarni saqlash uchun tizimga kiring.", ru: "Войдите, чтобы сохранить цели." },
  // Tier admin
  tier_label: { en: "Membership Tier", uz: "A'zolik Darajasi", ru: "Уровень подписки" },
  tier_free: { en: "Free", uz: "Bepul", ru: "Бесплатно" },
  tier_pro: { en: "Pro", uz: "Pro", ru: "Pro" },
  tier_ultra: { en: "Ultra", uz: "Ultra", ru: "Ultra" },
  // Navbar
  nav_analysis: { en: "Body Analysis", uz: "Tana Tahlili", ru: "Анализ тела" },
  nav_coach: { en: "AI Coach", uz: "AI Murabbiy", ru: "AI Тренер" },
  nav_pricing: { en: "Pricing", uz: "Narxlar", ru: "Тарифы" },
  nav_contact: { en: "Contact Coach", uz: "Murabbiy bilan bog'lanish", ru: "Связь с тренером" },
  // Hero
  hero_kicker: { en: "Primordial Protocol · v1.0", uz: "Asl Protokol · v1.0", ru: "Первородный протокол · v1.0" },
  hero_title_1: { en: "FORGE THE", uz: "TANANGIZNI", ru: "СОЗДАЙТЕ" },
  hero_title_2: { en: "BODY OF A", uz: "SPORTCHI TANASIGA", ru: "ТЕЛО" },
  hero_title_3: { en: "WARRIOR.", uz: "AYLANTIRING.", ru: "ВОИНА." },
  hero_sub: {
    en: "AI-driven training protocols engineered for Tashkent. Track your metrics, select your archetype, and train with professional precision.",
    uz: "Toshkent uchun ishlab chiqilgan AI-asosli mashg'ulot protokollari. Ko'rsatkichlaringizni kuzating, arxetipingizni tanlang va professional aniqlik bilan mashq qiling.",
    ru: "Тренировочные протоколы на базе ИИ, созданные для Ташкента. Отслеживайте показатели, выбирайте архетип и тренируйтесь с профессиональной точностью.",
  },
  hero_tagline: { en: "Discipline. Precision. Domination.", uz: "Intizom. Aniqlik. Hukmronlik.", ru: "Дисциплина. Точность. Превосходство." },
  hero_cta_1: { en: "Begin Analysis", uz: "Tahlilni Boshlash", ru: "Начать анализ" },
  hero_cta_2: { en: "Summon Coach", uz: "Murabbiyni Chaqirish", ru: "Вызвать тренера" },
  hero_stat_1: { en: "Day Protocol", uz: "Kunlik Protokol", ru: "Дневной протокол" },
  hero_stat_2: { en: "Warrior Archetypes", uz: "Sportchi Arxetiplari", ru: "Архетипы воинов" },
  hero_stat_3: { en: "Tashkent Parks", uz: "Toshkent Parklari", ru: "Парки Ташкента" },
  hero_stat_4: { en: "Mind Reps", uz: "Aqliy Takrorlar", ru: "Ментальные повторы" },
  // Body Analysis
  ba_tag: { en: "01 / Body Analysis", uz: "01 / Tana Tahlili", ru: "01 / Анализ тела" },
  ba_title_1: { en: "KNOW YOUR", uz: "TANANGIZNI", ru: "ИЗУЧИТЕ" },
  ba_title_2: { en: "FRAME.", uz: "BILING.", ru: "СВОЁ ТЕЛО." },
  ba_sub: {
    en: "Enter your stats. The system computes your BMI in real time and stores it in your local vault.",
    uz: "Ko'rsatkichlaringizni kiriting. Tizim BMI ni real vaqtda hisoblab, mahalliy xotirangizga saqlaydi.",
    ru: "Введите ваши данные. Система рассчитает BMI в реальном времени и сохранит его локально.",
  },
  ba_height: { en: "Height (cm)", uz: "Bo'y (sm)", ru: "Рост (см)" },
  ba_weight: { en: "Weight (kg)", uz: "Vazn (kg)", ru: "Вес (кг)" },
  ba_save: { en: "Save to Vault", uz: "Xotiraga Saqlash", ru: "Сохранить" },
  ba_result: { en: "Result Index", uz: "Natija Indeksi", ru: "Результат" },
  ba_awaiting: { en: "Awaiting input", uz: "Kiritishni kutmoqda", ru: "Ожидание ввода" },
  ba_under: { en: "Underweight", uz: "Past vazn", ru: "Недостаточный" },
  ba_normal: { en: "Normal", uz: "Normal", ru: "Нормальный" },
  ba_over: { en: "Overweight", uz: "Yuqori vazn", ru: "Избыточный" },
  ba_obese: { en: "Obese", uz: "Semizlik", ru: "Ожирение" },
  ba_persisted: { en: "Saved", uz: "Saqlangan", ru: "Сохранено" },
  // Coach
  co_tag: { en: "02 / Primordial AI Coach", uz: "02 / Asl AI Murabbiy", ru: "02 / AI Тренер" },
  co_title_1: { en: "SUMMON YOUR", uz: "ARXETIPINGIZNI", ru: "ВЫЗОВИТЕ" },
  co_title_2: { en: "ARCHETYPE.", uz: "CHAQIRING.", ru: "АРХЕТИП." },
  co_sub: {
    en: "Gemini-powered protocol generator. Trained on professional combat athletics. Tuned for Tashkent.",
    uz: "Gemini quvvatidagi protokol generatori. Professional jangovar sportlarga moslangan. Toshkent uchun sozlangan.",
    ru: "Генератор протоколов на базе Gemini. Обучен профессиональной боевой атлетике. Настроен для Ташкента.",
  },
  co_config: { en: "Configuration", uz: "Sozlama", ru: "Настройки" },
  co_archetype: { en: "Warrior Archetype", uz: "Sportchi Arxetipi", ru: "Архетип воина" },
  co_disciplines: { en: "Disciplines (max 5)", uz: "Yo'nalishlar (maks 5)", ru: "Дисциплины (макс 5)" },
  co_disciplines_free: { en: "Discipline (Free: 1)", uz: "Yo'nalish (Free: 1)", ru: "Дисциплина (Free: 1)" },
  co_disciplines_pro: { en: "Disciplines (Pro: max 3)", uz: "Yo'nalishlar (Pro: maks 3)", ru: "Дисциплины (Pro: макс 3)" },
  co_disciplines_ultra: { en: "Disciplines (Ultra: max 5)", uz: "Yo'nalishlar (Ultra: maks 5)", ru: "Дисциплины (Ultra: макс 5)" },
  co_goal: { en: "Goal", uz: "Maqsad", ru: "Цель" },
  co_level: { en: "Level", uz: "Daraja", ru: "Уровень" },
  co_generate: { en: "Generate Training Plan", uz: "Mashg'ulot Rejasini Yaratish", ru: "Создать план тренировок" },
  co_locked: { en: "Watch the briefing to unlock", uz: "Ochish uchun brifingni tomosha qiling", ru: "Посмотрите брифинг, чтобы открыть" },
  co_confirm: { en: "Confirm Selections", uz: "Tanlovni Tasdiqlash", ru: "Подтвердить выбор" },
  co_change_selections: { en: "Change Selections", uz: "Tanlovni O'zgartirish", ru: "Изменить выбор" },
  co_try_again: { en: "Try Again", uz: "Qayta Urinish", ru: "Повторить" },
  co_briefing: { en: "Warrior Briefing — Watch This", uz: "Sportchi Brifingi — Tomosha qiling", ru: "Брифинг воина — посмотрите" },
  co_briefing_sub: {
    en: "Watch the briefing. Absorb the discipline. Unlock the training plan.",
    uz: "Brifingni tomosha qiling. Intizomni qabul qiling. Mashg'ulot rejasini oching.",
    ru: "Посмотрите брифинг. Впитайте дисциплину. Откройте план тренировок.",
  },
  co_unlock_hint: { en: "Confirming after you've watched the edits.", uz: "Edits tomosha qilingach tasdiqlang.", ru: "Подтвердите после просмотра видео." },
  co_unlocked: { en: "Briefing complete · Protocol unlocked", uz: "Brifing tugadi · Protokol ochildi", ru: "Брифинг завершён · протокол открыт" },
  co_more_edits: { en: "Watch More Edits", uz: "Yana Videolar", ru: "Больше видео" },
  co_close: { en: "Close", uz: "Yopish", ru: "Закрыть" },
  co_ready: { en: "I AM READY TO TRAIN", uz: "MASHG'ULOTGA TAYYORMAN", ru: "Я ГОТОВ К ТРЕНИРОВКЕ" },
  co_hide_edits: { en: "Hide Edits", uz: "Videolarni Yashirish", ru: "Скрыть видео" },
  co_output: { en: "Training Plan Output", uz: "Mashg'ulot Rejasi", ru: "План тренировок" },
  co_copy: { en: "Copy Training Plan", uz: "Rejani Nusxalash", ru: "Скопировать план" },
  co_clear: { en: "Clear Vault", uz: "Xotirani Tozalash", ru: "Очистить" },
  co_saved: { en: "Saved", uz: "Saqlangan", ru: "Сохранено" },
  co_loading: { en: "Generating answers...", uz: "Javoblar yaratilmoqda...", ru: "Генерация ответа..." },
  co_forging: { en: "Forging...", uz: "Yaratilmoqda...", ru: "Создаём..." },
  co_empty_title: { en: "AWAITING RESPONSE", uz: "JAVOB KUTILMOQDA", ru: "ОЖИДАНИЕ ОТВЕТА" },
  co_empty_sub: {
    en: "Choose your archetype, select your disciplines, then watch the briefing to unlock the protocol.",
    uz: "Arxetipingizni tanlang, yo'nalishlarni belgilang, so'ng brifingni tomosha qilib protokolni oching.",
    ru: "Выберите архетип, дисциплины и посмотрите брифинг, чтобы открыть протокол.",
  },
  co_err_title: { en: "Error: Network unavailable.", uz: "Xatolik: Tarmoq mavjud emas.", ru: "Ошибка: сеть недоступна." },
  co_err_sub: { en: "Please check your internet connection.", uz: "Internet ulanishini tekshiring.", ru: "Проверьте подключение к интернету." },
  co_err_tag: { en: "System Failure", uz: "Tizim Xatosi", ru: "Сбой системы" },
  co_success: { en: "Your training plan is ready.", uz: "Mashg'ulot rejangiz tayyor.", ru: "Ваш план тренировок готов." },
  // Tier-specific UX
  co_briefing_must_watch: { en: "You must watch this briefing.", uz: "Ushbu brifingni tomosha qilishingiz shart.", ru: "Этот брифинг необходимо посмотреть." },
  co_plan_ready_btn: { en: "Your training plan is ready.", uz: "Mashg'ulot rejangiz tayyor.", ru: "Ваш план тренировок готов." },
  co_free_no_briefing: {
    en: "Free plan: no Warrior Briefing. Upgrade to Pro to unlock cinematic videos.",
    uz: "Bepul reja: brifing mavjud emas. Videolarni ochish uchun Pro'ga o'ting.",
    ru: "Бесплатный план: брифинг недоступен. Перейдите на Pro, чтобы открыть видео.",
  },
  co_ultra_only_gallery: { en: "Ultra only: Watch More Edits", uz: "Faqat Ultra: Yana Videolar", ru: "Только Ultra: больше видео" },
  co_direct_contact: { en: "DIRECT COACH CONTACT", uz: "MURABBIY BILAN TO'G'RIDAN-TO'G'RI", ru: "ПРЯМОЙ КОНТАКТ С ТРЕНЕРОМ" },
  // Archetype phrases (clean, professional)
  ph_yujiro: { en: "Yujiro draws strength from the earth.", uz: "Yujiro kuchini yerdan oladi.", ru: "Юджиро черпает силу из земли." },
  ph_kratos: { en: "Kratos breaks mountains into dust.", uz: "Kratos tog'larni changga aylantiradi.", ru: "Кратос обращает горы в пыль." },
  ph_khabib: { en: "The eagle never releases its prey.", uz: "Burgut o'ljasini qo'yib yubormaydi.", ru: "Орёл не отпускает добычу." },
  ph_khamzat: { en: "The Borz controls every second of the fight.", uz: "Borz har bir soniyani boshqaradi.", ru: "Борз контролирует каждую секунду боя." },
  // Pricing
  pr_tag: { en: "03 / Pricing", uz: "03 / Narxlar", ru: "03 / Тарифы" },
  pr_title_1: { en: "CHOOSE YOUR", uz: "TARIFNI", ru: "ВЫБЕРИТЕ" },
  pr_title_2: { en: "TIER.", uz: "TANLANG.", ru: "ТАРИФ." },
  pr_sub: {
    en: "Three paths. One destination — total command over your frame.",
    uz: "Uch yo'l. Bitta manzil — tanangiz ustidan to'liq nazorat.",
    ru: "Три пути. Одна цель — полный контроль над телом.",
  },
  pr_status: { en: "Account Status", uz: "Hisob Holati", ru: "Статус аккаунта" },
  pr_active: { en: "✓ ACTIVE PLAN", uz: "✓ FAOL REJA", ru: "✓ АКТИВНЫЙ ПЛАН" },
  pr_already_pro: { en: "You are already on the Pro plan.", uz: "Siz allaqachon Pro rejadasiz.", ru: "Вы уже на тарифе Pro." },
  pr_already_elite: { en: "You are already on the Elite plan.", uz: "Siz allaqachon Elite rejadasiz.", ru: "Вы уже на тарифе Elite." },
  pr_already_free: { en: "You are already on the Free plan.", uz: "Siz allaqachon Free rejadasiz.", ru: "Вы уже на тарифе Free." },
  pr_activate_free: { en: "Activate Free", uz: "Bepul Faollashtirish", ru: "Активировать бесплатно" },
  pr_subscribe: { en: "Subscribe", uz: "Obuna bo'lish", ru: "Подписаться" },
  pr_most: { en: "Most Chosen", uz: "Eng Tanlangan", ru: "Самый популярный" },
  // Disciplines
  d_mma: { en: "MMA", uz: "MMA", ru: "ММА" },
  d_box: { en: "Boxing", uz: "Boks", ru: "Бокс" },
  d_wre: { en: "Wrestling (Kurash)", uz: "Kurash", ru: "Борьба (Кураш)" },
  d_muay: { en: "Muay Thai", uz: "Muay Thai", ru: "Муай-тай" },
  d_street: { en: "Combat Sports", uz: "Jangovar Sport", ru: "Боевые виды спорта" },
  d_cali: { en: "Calisthenics", uz: "Kalisteniks", ru: "Калистеника" },
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
    if (saved === "en" || saved === "uz" || saved === "ru") {
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
