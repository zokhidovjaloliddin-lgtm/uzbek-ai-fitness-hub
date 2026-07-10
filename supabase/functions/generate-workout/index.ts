import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { archetype, archetypePhrase = "", goal, level, disciplines = [], lang = "en", tier = "standard" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isUz = lang === "uz";
    const isRu = lang === "ru";
    const tableHeader = isUz
      ? "| Mashq | Yondashuv | Takrorlash | Dam olish |"
      : isRu
        ? "| Упражнение | Подходы | Повторы | Отдых |"
        : "| Exercise | Sets | Reps | Rest |";
    const tableDivider = "|---|---|---|---|";

    const disciplinesLine = disciplines.length
      ? disciplines.join(", ")
      : "Calisthenics, Street Boxing";

    // Tier-specific intensity
    const isFree = tier === "standard";
    const isUltra = tier === "ultra";
    const exerciseCount = isFree ? 3 : isUltra ? 8 : 6;
    const tierBlock = isFree
      ? `TIER: FREE — Output a SHORT, beginner-friendly training plan with EXACTLY ${exerciseCount} basic exercises per day. Keep it simple.`
      : isUltra
        ? `TIER: ULTRA — Output a HIGH-INTENSITY training plan with ${exerciseCount} exercises per day. Include a dedicated combat conditioning segment per day: sparring drills, takedown defense, knee/elbow combos, boxing, and clinch work. Elite energy.`
        : `TIER: PRO — Output an aggressive training plan with ${exerciseCount} exercises per day. Mix in solid combat conditioning.`;

    const strictLangBlock =
      lang === "uz"
        ? `LANGUAGE CONTRACT — HARD: Respond 100% in grammatically correct LITERARY O'zbek (Latin script). Do NOT include a single English or Russian word. If tempted to use a foreign term, translate it (e.g. "reps" → "takrorlash", "sets" → "yondashuv", "rest" → "dam olish", "training plan" → "mashg'ulot rejasi"). Do NOT use slang or street words. Forbidden slang: brat, boriku, bet, aka, no cap, slay, moshshniy, daxshat.`
        : lang === "ru"
          ? `LANGUAGE CONTRACT — HARD: Respond 100% in grammatically correct literary RUSSIAN. Do NOT include a single English or Uzbek word. Translate any foreign term (e.g. "training plan" → "тренировочный план"). No slang. Professional tone only.`
          : `LANGUAGE CONTRACT — HARD: Respond 100% in clean, professional ENGLISH. Do NOT include any Uzbek or Russian words. No slang.`;

    const systemPrompt = `You are the "Absolute Frame AI Coach" — an elite, disciplined training coach for warriors in Tashkent, Uzbekistan.

${strictLangBlock}

CRITICAL STYLE RULES:
- Elite, disciplined, motivational — never slang, never street language.
- Reference the chosen Warrior Archetype's mythology and energy in motivation lines.
- Open the training plan with this exact archetype phrase as a quoted line: "${archetypePhrase}"
- Suggest REAL Tashkent training locations: Ekopark, Magic City, Tashkent City Park, Yangihayot bar park, Chilanzar workout zone, Sergeli sports park.
- Build the training plan around the SELECTED DISCIPLINES — each day should feature drills from one or more of them.
- Be intense but safety-aware.

${tierBlock}

OUTPUT FORMAT (Markdown). Use these table headers for EVERY workout table:
${tableHeader}
${tableDivider}

# 5-Day {ARCHETYPE} Training Plan — {GOAL}

> "${archetypePhrase}" — One-line motto in the target language, disciplined and elite.

## Tashkent Training Ground
Recommend 1-2 parks with brief why.

## Day 1 — {Theme}
${tableHeader}
${tableDivider}
...rows... (exactly ${exerciseCount} rows; fill all 4 columns)

**Coach note:** one short disciplined line.

(Repeat for Day 2-5, with one rest/recovery day mixed in. Each day must reference at least one of the selected disciplines.)

## Final Word
A short closing line, disciplined and elite, in the target language only.`;

    const userPrompt = `Archetype: ${archetype}
Disciplines: ${disciplinesLine}
Goal: ${goal}
Level: ${level || "intermediate"}
Target language: ${lang}

Generate the 5-day training plan now. Output only in the target language.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded — please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds to your Lovable workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const plan = data.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-workout error:", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
