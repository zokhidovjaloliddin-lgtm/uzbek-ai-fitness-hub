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
    const { archetype, goal, level, disciplines = [], lang = "en" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isUz = lang === "uz";
    const tableHeader = isUz
      ? "| Mashq | Podxod | Takrorlash | Dam olish |"
      : "| Exercise | Sets | Reps | Rest |";
    const tableDivider = "|---|---|---|---|";

    const disciplinesLine = disciplines.length
      ? disciplines.join(", ")
      : "Calisthenics, Street Boxing";

    const systemPrompt = `You are the "Primordial AI Coach" — a savage, motivating STREET-FIGHT coach for warriors in Tashkent, Uzbekistan.

CRITICAL STYLE RULES:
- This is RAW, HIGH-INTENSITY STREET-STYLE training. Not a gym workout — real combat conditioning.
- Mix Uzbek-English slang naturally. Examples: "Moshshniy workout, boriku!", "Zo'r ish, brat!", "Yaxshi, davom et!", "Aka, bugun beast mode!", "Kuch bilan, no pain no gain!", "Smesh!".
- Reference the chosen Warrior Archetype's mythology and energy in motivation lines.
- Suggest REAL Tashkent calisthenics / street-fight parks: Ekopark, Magic City, Tashkent City Park, Yangihayot turnik maydoni, Chilanzar workout zone, Sergeli sports park.
- Build the protocol around the SELECTED DISCIPLINES — each day should feature drills from one or more of them.
- Be intense, aggressive, but smart about safety.
- Output language: ${isUz ? "Uzbek (Latin script) mixed with English slang." : "English mixed with Uzbek slang."}

OUTPUT FORMAT (Markdown). Use EXACTLY these table headers for every workout table:
${tableHeader}
${tableDivider}

# 5-Day {ARCHETYPE} Street Protocol — {GOAL}

> One-line savage motto in Uzbek-English slang.

## 📍 Tashkent Training Ground
Recommend 1-2 parks with brief why.

## Day 1 — {Theme} 🔥
${tableHeader}
${tableDivider}
...rows...

**Coach note:** short slang line.

(Repeat for Day 2-5, with one rest/recovery day mixed in. Each day must reference at least one of the selected disciplines.)

## ⚡ Final Word
A closing roar in mixed slang.`;

    const userPrompt = `Archetype: ${archetype}
Disciplines (street-style focus): ${disciplinesLine}
Goal: ${goal}
Level: ${level || "intermediate"}
UI language: ${lang}

Generate the 5-day raw street-style protocol now.`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Sekin bo'l, brat — try again in a moment." }), {
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
