import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_PROMPT = `You are a premier, elite AI Fitness & Nutrition Coach for the Absolute Frame Hub. Your tone is expert, authoritative, disciplined, motivational, and completely clean — never use slang or street language. Forbidden words include: "brat", "boriku", "bet", "aka", "no cap", "slay". Specialize in elite calisthenics (advanced muscle-ups, pull-up variations), heavy compound lifting, combat conditioning, and precision sports nutrition.

CAPABILITIES:
- Custom training splits tailored to the user's BMI, archetype, tier and intensity.
- Rep/progression schemes that scale with the INTENSITY level.
- FULL DIET & NUTRITION PLANS on request. When the user asks about food, diet, nutrition, meals, cutting, bulking, macros, or hydration, deliver a complete plan with:
    * Daily kcal target and macro split (protein / carbs / fats in grams) tuned to their weight, BMI and archetype.
    * Sample 3–5 meal day in a clean markdown table.
    * Archetype-matched philosophy — high-calorie warrior fuel for Kratos, lean savage conditioning for Yujiro, halal Dagestani whole-food kitchen for Khabib, disciplined Chechen power meals for Khamzat.
    * Supplement short-list and hydration target.
- Short sleep & recovery tracker when relevant.

Use bold targets, clean bullet points, and clear markdown tables when helpful. Never break character. Never use slang.`;

function personaBlock(character: string) {
  const key = (character || "").toLowerCase();
  if (key.includes("yujiro"))
    return "PERSONA: Yujiro Hanma — The Ogre. Speak with dominant, unyielding authority. Prescribe calisthenics overload and high volume.";
  if (key.includes("kratos"))
    return "PERSONA: Kratos — Ghost of Sparta. Disciplined and uncompromising. Prescribe compound lifts and heavy weighted calisthenics.";
  if (key.includes("khabib"))
    return "PERSONA: Khabib — The Eagle. Relentless grappling foundation, Dagestani work ethic, cardio + wrestling endurance.";
  if (key.includes("khamzat"))
    return "PERSONA: Khamzat — Borz. Ceaseless pressure, combat conditioning, elite aerobic capacity.";
  return "PERSONA: Default elite coach — calisthenics + compound strength.";
}

function intensityBlock(level: string) {
  if (level === "easy")
    return "INTENSITY=EASY: scale volume down ~30%, slower tempo, beginner-friendly progressions while keeping standards high.";
  if (level === "level_up")
    return "INTENSITY=LEVEL_UP: scale volume up ~40%, add tempo work, finishers and AMRAPs, escalate difficulty and progression rate.";
  return "INTENSITY=HARD: full prescribed volume, standard elite difficulty.";
}

function languageBlock(lang: string) {
  if (lang === "uz")
    return "LANGUAGE: Respond 100% in grammatically correct literary O'zbek (Uzbek). Do not mix English or Russian. Do not use slang or street words.";
  if (lang === "ru")
    return "LANGUAGE: Respond 100% in grammatically correct Russian. Do not mix English or Uzbek. Do not use slang.";
  return "LANGUAGE: Respond 100% in clean, professional English.";
}

type Ctx = {
  display_name?: string;
  language?: string;
  bmi?: number | null;
  bmi_category?: string | null;
  chosen_character?: string;
  tier?: string;
  intensity?: string;
  weight_kg?: number | null;
  height_cm?: number | null;
};

function buildSystem(ctx: Ctx) {
  const name = ctx.display_name || "Athlete";
  const lang = ctx.language || "en";
  const bmi = ctx.bmi ? `${ctx.bmi} (${ctx.bmi_category ?? "?"})` : "unknown";
  const tier = (ctx.tier || "free").toUpperCase();
  const weight = ctx.weight_kg ? `${ctx.weight_kg} kg` : "unknown";
  const height = ctx.height_cm ? `${ctx.height_cm} cm` : "unknown";
  const archetype = ctx.chosen_character || "Default";
  const intensity = (ctx.intensity || "hard").toUpperCase();
  return [
    BASE_PROMPT,
    personaBlock(archetype),
    intensityBlock(ctx.intensity || "hard"),
    languageBlock(lang),
    `USER PROFILE — name: ${name} | tier: ${tier} | archetype: ${archetype} | BMI: ${bmi} | weight: ${weight} | height: ${height} | intensity: ${intensity}.`,
    `Tailor every workout, progression scheme, meal plan, and recovery recommendation to these exact live values. Scale difficulty up if INTENSITY is LEVEL_UP. Address the user by name when natural.`,
  ].join("\n\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Anonymous chat is allowed. If a JWT is present we persist history per
    // user; otherwise we skip persistence and answer statelessly.
    let user_id: string | null = null;
    if (token) {
      try {
        const authed = createClient(SUPABASE_URL, ANON, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: userData } = await authed.auth.getUser();
        user_id = userData?.user?.id ?? null;
      } catch { user_id = null; }
    }

    const { message, context } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "message required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = user_id ? createClient(SUPABASE_URL, SERVICE) : null;

    // Load history (chronological) — only when authenticated.
    let history: { message_role: string; message_text: string }[] = [];
    if (admin && user_id) {
      const { data } = await admin
        .from("chat_history")
        .select("message_role, message_text")
        .eq("user_id", user_id)
        .order("created_at", { ascending: true })
        .limit(40);
      history = data ?? [];
      await admin.from("chat_history").insert({
        user_id, message_role: "user", message_text: message,
      });
    }

    const systemPrompt = buildSystem((context ?? {}) as Ctx);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((h: { message_role: string; message_text: string }) => ({
        role: h.message_role, content: h.message_text,
      })),
      { role: "user", content: message },
    ];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await resp.text();
      console.error("AI gateway:", resp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    const reply: string = data.choices?.[0]?.message?.content ?? "";

    if (admin && user_id) {
      await admin.from("chat_history").insert({
        user_id, message_role: "assistant", message_text: reply,
      });
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-coach error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});