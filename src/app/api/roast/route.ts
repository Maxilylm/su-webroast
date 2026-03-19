import { NextRequest, NextResponse } from "next/server";

interface PersonaResult {
  persona: string;
  emoji: string;
  score: number;
  findings: string[];
  fixes: string[];
}

const personas = [
  {
    name: "Copywriter",
    emoji: "\u270d\ufe0f",
    system: `You are a brutally honest copywriter reviewing website HTML source code. You roast bad copy with humor but provide actionable feedback. Analyze the text content, headlines, CTAs, and overall messaging. Be funny but helpful.

Respond in this exact JSON format:
{"score": <1-10>, "findings": ["<3-5 roast-style findings with humor>"], "fixes": ["<2-3 actionable fixes>"]}

Only respond with valid JSON, nothing else.`,
  },
  {
    name: "SEO Expert",
    emoji: "\ud83d\udd0d",
    system: `You are a brutally honest SEO expert reviewing website HTML source code. You roast poor SEO practices with humor but provide actionable feedback. Check meta tags, headings structure, alt texts, semantic HTML, and overall SEO health. Be funny but helpful.

Respond in this exact JSON format:
{"score": <1-10>, "findings": ["<3-5 roast-style findings with humor>"], "fixes": ["<2-3 actionable fixes>"]}

Only respond with valid JSON, nothing else.`,
  },
  {
    name: "Accessibility Auditor",
    emoji: "\u267f",
    system: `You are a brutally honest accessibility auditor reviewing website HTML source code. You roast a11y issues with humor but provide actionable feedback. Check for missing aria labels, color contrast hints, form labels, alt texts, semantic structure, and keyboard navigation patterns. Be funny but helpful.

Respond in this exact JSON format:
{"score": <1-10>, "findings": ["<3-5 roast-style findings with humor>"], "fixes": ["<2-3 actionable fixes>"]}

Only respond with valid JSON, nothing else.`,
  },
  {
    name: "UX Designer",
    emoji: "\ud83c\udfa8",
    system: `You are a brutally honest UX designer reviewing website HTML source code. You roast poor UX patterns with humor but provide actionable feedback. Evaluate structure, navigation patterns, information hierarchy, layout decisions, and overall user experience. Be funny but helpful.

Respond in this exact JSON format:
{"score": <1-10>, "findings": ["<3-5 roast-style findings with humor>"], "fixes": ["<2-3 actionable fixes>"]}

Only respond with valid JSON, nothing else.`,
  },
];

async function callGroq(systemPrompt: string, html: string): Promise<PersonaResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the HTML source code to review:\n\n${html}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${res.status} ${err}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let html: string = body.html || "";

    if (!html.trim()) {
      return NextResponse.json({ error: "No HTML provided" }, { status: 400 });
    }

    // Truncate to 6000 chars
    if (html.length > 6000) {
      html = html.substring(0, 6000) + "\n<!-- ...truncated -->";
    }

    const results: PersonaResult[] = [];

    // Sequential calls - 4 expert personas
    for (const persona of personas) {
      const result = await callGroq(persona.system, html);
      if (result) {
        results.push({
          persona: persona.name,
          emoji: persona.emoji,
          score: Math.min(10, Math.max(1, result.score || 5)),
          findings: result.findings || ["No findings"],
          fixes: result.fixes || ["No fixes"],
        });
      } else {
        results.push({
          persona: persona.name,
          emoji: persona.emoji,
          score: 5,
          findings: ["Could not parse AI response for this category"],
          fixes: ["Try again with different HTML"],
        });
      }
    }

    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;

    return NextResponse.json({ results, avgScore: Math.round(avgScore * 10) / 10 });
  } catch (error) {
    console.error("Roast API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
