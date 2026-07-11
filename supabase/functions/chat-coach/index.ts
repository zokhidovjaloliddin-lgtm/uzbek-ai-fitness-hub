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

Use bold targets, clean bullet points, and clear markdown tables when helpful. Never break character. Never use slang.

PLAN CREATION FLOW (MANDATORY):
- On the FIRST turn of a new conversation (when the user has no existing plan yet), you must ask 3 to 5 short qualifying questions BEFORE writing any plan. Cover: main goal, experience level, days per week, available equipment, and any injuries.
- Ask them in a compact numbered list, one message, then stop and wait for the user's reply.
- ONCE you have those answers, generate ONE complete training plan and emit it in a single message. That message MUST contain:
  1. A human-readable markdown plan (visible to the user).
  2. A machine block at the very end of the message, on its own lines, exactly in this format:
     <PLAN_JSON>{"title":"...","archetype":"...","discipline":"...","total_days":60,"plan_markdown":"..."}</PLAN_JSON>
  The plan_markdown field inside the JSON should be the same markdown you rendered above (escape newlines as \\n). Only emit ONE <PLAN_JSON> block, and only when you have enough info to commit to a plan.
- After the plan is saved, continue as a coach: answer questions, adjust volume, give nutrition, and level the athlete up.
- When the user has clearly earned a level-up (completed a phase, hit a milestone, or asks to level up), emit at the end of your message:
     <LEVEL_UP>{"new_level":2,"unlocked_title":"...","note":"...","xp_delta":100}</LEVEL_UP>
  Use small integer levels (1..10). Only emit this when it is genuinely earned.
- Never mention the tags <PLAN_JSON> or <LEVEL_UP> to the user in prose; they are silent metadata.`;

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
    return "LANGUAGE CONTRACT — HARD: Respond 100% in grammatically correct LITERARY O'zbek (Latin script). Do NOT include a single English or Russian word. Translate every foreign term. Forbidden slang: brat, aka, boriku, bet, moshshniy, daxshat. Use the word 'mashg'ulot rejasi' (never 'protokol').";
  if (lang === "ru")
    return "LANGUAGE CONTRACT — HARD: Respond 100% in grammatically correct literary RUSSIAN. Do NOT include a single English or Uzbek word. Translate every foreign term (use 'тренировочный план'). No slang.";
  return "LANGUAGE CONTRACT — HARD: Respond 100% in clean, professional ENGLISH. Do NOT use any Uzbek or Russian words. Use 'training plan' (never 'protocol').";
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

    // Detect whether the user already has an active plan so the coach knows
    // whether to enter "qualifying questions" mode or "coaching" mode.
    let hasActivePlan = false;
    if (admin && user_id) {
      const { count } = await admin
        .from("training_plans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user_id)
        .eq("status", "active");
      hasActivePlan = (count ?? 0) > 0;
    }

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

    const systemPrompt =
      buildSystem((context ?? {}) as Ctx) +
      (hasActivePlan
        ? "\n\nSTATE: The athlete ALREADY has an active training plan. Do NOT ask the intro qualifying questions again and do NOT emit <PLAN_JSON>. Coach, adjust, or emit <LEVEL_UP> only when earned."
        : "\n\nSTATE: The athlete does NOT have an active plan yet. If you have not already asked the qualifying questions in this conversation, ask them now. Once answered, commit to a plan and emit <PLAN_JSON>.");

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
    const rawReply: string = data.choices?.[0]?.message?.content ?? "";

    // ----- Parse metadata blocks -----
    let planCreated: null | { id: string; title: string; total_days: number } = null;
    let levelUp: null | { new_level: number; unlocked_title?: string; note?: string } = null;
    let visibleReply = rawReply;

    const planMatch = rawReply.match(/<PLAN_JSON>([\s\S]*?)<\/PLAN_JSON>/);
    if (planMatch) {
      visibleReply = visibleReply.replace(planMatch[0], "").trim();
      if (admin && user_id) {
        try {
          const parsed = JSON.parse(planMatch[1]);
          // Archive any previous active plans in a different language / stale state.
          await admin.from("training_plans")
            .update({ status: "abandoned" })
            .eq("user_id", user_id)
            .eq("status", "active");
          const { data: inserted, error: insErr } = await admin
            .from("training_plans")
            .insert({
              user_id,
              title: String(parsed.title ?? "Training Plan").slice(0, 120),
              archetype: String(parsed.archetype ?? (context?.chosen_character ?? "Default")),
              discipline: String(parsed.discipline ?? "Mixed"),
              language: (context?.language ?? "en"),
              plan_markdown: String(parsed.plan_markdown ?? visibleReply),
              total_days: Number.isFinite(+parsed.total_days) ? +parsed.total_days : 60,
              status: "active",
              level: 1,
              xp: 0,
              xp_to_next: 100,
            })
            .select("id,title,total_days")
            .single();
          if (!insErr && inserted) {
            planCreated = inserted as { id: string; title: string; total_days: number };
            await admin.from("plan_milestones").insert({
              user_id, plan_id: inserted.id, kind: "plan_created", title: inserted.title,
            });
            await admin.from("profiles")
              .update({ onboarded_at: new Date().toISOString() })
              .eq("user_id", user_id);
          } else if (insErr) {
            console.error("plan insert:", insErr);
          }
        } catch (e) { console.error("plan parse:", e); }
      }
    }

    const lvlMatch = rawReply.match(/<LEVEL_UP>([\s\S]*?)<\/LEVEL_UP>/);
    if (lvlMatch) {
      visibleReply = visibleReply.replace(lvlMatch[0], "").trim();
      if (admin && user_id) {
        try {
          const parsed = JSON.parse(lvlMatch[1]);
          const newLevel = Math.max(1, Math.min(20, +parsed.new_level || 2));
          const xpDelta = Math.max(0, +parsed.xp_delta || 100);
          // Update the current active plan.
          const { data: active } = await admin
            .from("training_plans")
            .select("id,xp,xp_to_next")
            .eq("user_id", user_id)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (active) {
            await admin.from("training_plans").update({
              level: newLevel,
              xp: (active.xp ?? 0) + xpDelta,
              xp_to_next: (active.xp_to_next ?? 100) + 50,
            }).eq("id", active.id);
            await admin.from("plan_milestones").insert({
              user_id, plan_id: active.id, kind: "level_up",
              level: newLevel,
              title: String(parsed.unlocked_title ?? `Level ${newLevel}`),
              note: String(parsed.note ?? ""),
            });
            levelUp = { new_level: newLevel, unlocked_title: parsed.unlocked_title, note: parsed.note };
          }
        } catch (e) { console.error("level_up parse:", e); }
      }
    }

    if (admin && user_id) {
      await admin.from("chat_history").insert({
        user_id, message_role: "assistant", message_text: visibleReply,
      });
    }

    return new Response(JSON.stringify({ reply: visibleReply, plan_created: planCreated, level_up: levelUp }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat-coach error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});