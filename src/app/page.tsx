"use client";

import { useState } from "react";

interface PersonaResult {
  persona: string;
  emoji: string;
  score: number;
  findings: string[];
  fixes: string[];
}

interface RoastResponse {
  results: PersonaResult[];
  avgScore: number;
  error?: string;
}

function getVerdict(score: number): string {
  if (score >= 8) return "Your site is fire \ud83d\udd25";
  if (score >= 6) return "Not bad, but room to grow \ud83d\udcaa";
  if (score >= 4) return "Needs some serious TLC \ud83e\ude79";
  return "Needs CPR \ud83c\udfe5";
}

function getScoreColor(score: number): string {
  if (score >= 8) return "text-green-400";
  if (score >= 6) return "text-yellow-400";
  if (score >= 4) return "text-orange-400";
  return "text-red-400";
}

export default function Home() {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RoastResponse | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleRoast() {
    if (!html.trim()) return;
    setLoading(true);
    setResults(null);
    setError("");

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });

      const data: RoastResponse = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  function copyReport() {
    if (!results) return;
    const lines: string[] = [
      `WebRoast Report - Overall Score: ${results.avgScore}/10`,
      `Verdict: ${getVerdict(results.avgScore)}`,
      "",
    ];
    for (const r of results.results) {
      lines.push(`${r.emoji} ${r.persona} - ${r.score}/10`);
      lines.push("Findings:");
      r.findings.forEach((f, i) => lines.push(`  ${i + 1}. ${f}`));
      lines.push("Fixes:");
      r.fixes.forEach((f, i) => lines.push(`  ${i + 1}. ${f}`));
      lines.push("");
    }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">
            \ud83d\udd25 WebRoast
          </h1>
          <p className="text-zinc-400 text-lg">
            Paste your HTML source code. Get roasted by 4 AI experts.
          </p>
        </header>

        <div className="space-y-4">
          <textarea
            value={html}
            onChange={(e) => setHtml(e.target.value)}
            placeholder="Right-click &rarr; View Source on any page, paste the HTML here..."
            className="w-full h-48 bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-sm font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-y"
          />

          <button
            onClick={handleRoast}
            disabled={loading || !html.trim()}
            className="w-full py-3 px-6 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold rounded-lg transition-colors"
          >
            {loading ? "Roasting... (4 expert passes)" : "\ud83d\udd25 Roast My Site"}
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {results && (
          <div className="mt-8 space-y-6">
            {/* Overall Score */}
            <div className="text-center p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className={`text-5xl font-bold ${getScoreColor(results.avgScore)}`}>
                {results.avgScore}/10
              </div>
              <div className="text-xl mt-2 text-zinc-300">
                {getVerdict(results.avgScore)}
              </div>
            </div>

            {/* Persona Cards */}
            <div className="grid gap-4">
              {results.results.map((r, i) => (
                <div
                  key={i}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                      {r.emoji} {r.persona}
                    </h2>
                    <span
                      className={`text-2xl font-bold ${getScoreColor(r.score)}`}
                    >
                      {r.score}/10
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
                      Findings
                    </h3>
                    <ul className="space-y-2">
                      {r.findings.map((f, j) => (
                        <li key={j} className="text-zinc-300 text-sm pl-4 border-l-2 border-zinc-700">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-2">
                      Fixes
                    </h3>
                    <ul className="space-y-2">
                      {r.fixes.map((f, j) => (
                        <li key={j} className="text-green-300 text-sm pl-4 border-l-2 border-green-700">
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Copy Button */}
            <button
              onClick={copyReport}
              className="w-full py-3 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-lg transition-colors border border-zinc-700"
            >
              {copied ? "\u2705 Copied!" : "\ud83d\udccb Copy Full Report"}
            </button>
          </div>
        )}

        <footer className="mt-16 text-center text-zinc-600 text-sm">
          Powered by Groq + Llama 3.3 70B
        </footer>
      </div>
    </div>
  );
}
