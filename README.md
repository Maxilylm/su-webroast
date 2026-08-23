# WebRoast

> Paste a page's HTML source and four AI critics roast it — copy, SEO, accessibility, and UX — each with a score.

**[Live demo](https://su-webroast.vercel.app)**

Design feedback is more useful when it comes from several angles at once. WebRoast takes raw HTML source — right-click, View Source, paste — and runs it past four separate Llama 3.3 70B personas, each with its own system prompt and its own agenda. The Copywriter goes after headlines and CTAs, the SEO Expert after meta tags and heading structure, the Accessibility Auditor after aria labels and form labels, and the UX Designer after hierarchy and navigation. Each returns a score out of ten, a handful of roast-style findings, and two or three concrete fixes.

## Features

- Four independent expert passes over the same HTML, run sequentially on the server
- Score out of ten per persona plus an averaged overall score and verdict
- Findings and actionable fixes separated, so the jokes stay out of the to-do list
- "Copy Full Report" button that exports every persona's findings as text
- HTML truncated to 6,000 characters with graceful fallbacks if a persona's JSON fails to parse

## Stack

- Next.js 16 (App Router) with React 19 and TypeScript
- Tailwind CSS v4
- Groq Chat Completions API — `llama-3.3-70b-versatile`, four calls per roast

## Running locally

```bash
npm install
npm run dev
```

Requires `GROQ_API_KEY` in `.env.local`.

---

Part of a series of 91 small web apps. [Browse them all](https://su-slopmachine.vercel.app).
