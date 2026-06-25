import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_PROMPT = `You are the ultimate AI Fitness Coach for the Uzbek Fit AI Hub. You have absolutely zero patience for excuses, laziness, or weakness. Your tone is incredibly intense, disciplined, direct, and authoritative. You heavily prioritize elite calisthenics (such as advanced muscle-ups and intense pull-up variations), heavy compound weight training, and optimal high-protein nutrition. Provide highly effective, structurally flawless training splits and meal plans with bold targets and clear bullet points. Never break character.`;

function personaBlock(character: string) {
  const key = (character || "").toLowerCase();
  if (key.includes("yujiro"))
    return "PERSONA: Yujiro Hanma — The Ogre. Speak with dominant, unyielding, primal authority. Calisthenics overload, brutal volume, raw aggression.";
  if (key.includes("kratos"))
    return "PERSONA: Kratos — Ghost of Sparta. Disciplined, godlike, no mercy. Compound lifts, heavy weighted calisthenics, total dominion.";
  if (key.includes("khabib"))
    return "PERSONA: Khabib — The Eagle. Relentless grappling, Dagestani work ethic, smesh-style cardio + wrestling endurance.";
  if (key.includes("khamzat"))
    return "PERSONA: Khamzat — Borz. Smesh mode, ceaseless pressure, combat conditioning and brutal aerobic capacity.";
  return "PERSONA: Default elite coach — calisthenics + compound strength.";
}

function intensityBlock(level: string) {
  if (level === "easy")
    return "INTENSITY=EASY: scale volume down ~30%, slower tempo, beginner-friendly progressions; still no excuses.";
  if (level === "level_up")
    return "INTENSITY=LEVEL_UP: scale volume up ~40%, add tempo work, finishers and AMRAPs, escalate aggression and demands.";
  return "INTENSITY=HARD: full prescribed volume, standard elite difficulty.";
}

function languageBlock(lang: string) {
  return lang === "uz"
    ? "LANGUAGE: Respond 100% in O'zbek (Uzbek). Use Uzbek-English slang where natural."
    : "LANGUAGE: Respond 100% in English.";
}

type Ctx = {
  display_name?: string;
  language?: string;
  bmi?: number | null;
  bmi_category?: string | null;
  chosen_character?: string;
  tier?: string;
  intensity?: string;
};

function buildSystem(ctx: Ctx) {
  const name = ctx.display_name || "Warrior";
  const lang = ctx.language || "en";
  const bmi = ctx.bmi ? `${ctx.bmi} (${ctx.bmi_category ?? "?"})` : "unknown";
  const tier = (ctx.tier || "free").toUpperCase();
  return [
    BASE_PROMPT,
    personaBlock(ctx.chosen_character || ""),
    intensityBlock(ctx.intensity || "hard"),
    languageBlock(lang),
    `USER PROFILE: name=${name}, tier=${tier}, BMI=${bmi}. Tailor advice to this profile and address them by name occasionally.`,
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

    const authed = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await authed.auth.getUser();
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const user_id = userData.user.id;

    const { message, context } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "message required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE);

    // Load history (chronological)
    const { data: history } = await admin
      .from("chat_history")
      .select("message_role, message_text")
      .eq("user_id", user_id)
      .order("created_at", { ascending: true })
      .limit(40);

    // Persist user message
    await admin.from("chat_history").insert({
      user_id, message_role: "user", message_text: message,
    });

    const systemPrompt = buildSystem((context ?? {}) as Ctx);

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).map((h: { message_role: string; message_text: string }) => ({
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

    await admin.from("chat_history").insert({
      user_id, message_role: "assistant", message_text: reply,
    });

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-coach error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});