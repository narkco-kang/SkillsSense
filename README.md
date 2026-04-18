# SkillsSense

> AI-Powered Skill Discovery — Describe what you want to do, get the perfect skill with a vivid tutorial in seconds.

[![Tests](https://img.shields.io/badge/tests-19%20passed-brightgreen)](https://github.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

## What is SkillsSense?

SkillsSense is an AI-driven skill discovery platform that solves the **"can't find, can't use, can't trust"** problem. Instead of searching keywords, you describe your goal in natural language — the AI understands your intent, recommends the best skills from multiple sources, and generates a vivid step-by-step tutorial just for you.

**No more** Googling "best XXX tools" for 30 minutes.
**No more** reading generic docs without context.
**No more** guessing which tool actually fits your need.

## Features

- **🎯 Intent Parsing** — Natural language → structured AI understanding
- **🔍 Multi-Source Search** — Hugging Face, GitHub Topics, Awesome Lists (in parallel)
- **📖 Auto-Generated Tutorials** — Vivid, step-by-step guides tailored to your specific need
- **🆕 AI Skill Generation** — When no existing skill fits, AI composes a new one
- **🌊 Streaming Responses** — See results progressively, no waiting 12+ seconds
- **🇨🇳 Bilingual** — Full support for English and Traditional Chinese

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-username/skillssense.git
cd skillssense

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local and add your OPENROUTER_API_KEY

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and try: *"我想做一個 Discord 客服機器人"*

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | API key from [OpenRouter](https://openrouter.ai) | Yes |
| `OPENROUTER_MODEL` | Model to use (default: `anthropic/claude-3.5-haiku`) | No |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking | No |

## Tech Stack

- **Framework**: Next.js 15 + TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenRouter API (Claude, DeepSeek, Gemini models)
- **Testing**: Vitest
- **Deployment**: Vercel (recommended)

## Project Structure

```
src/
├── app/
│   ├── api/search/route.ts   # Main search API (streaming SSE)
│   ├── page.tsx              # Homepage
│   └── layout.tsx            # Root layout + metadata
├── lib/
│   ├── skills-data.ts        # Local skill database
│   ├── skill-generator.ts    # AI new skill generation
│   ├── guidance.ts           # Intent clarification flow
│   ├── sources/              # Multi-source scrapers
│   │   ├── huggingface.ts
│   │   ├── github.ts
│   │   └── awesome.ts
│   └── ...
└── __tests__/                # Unit tests (19 passing)
```

## API

### POST `/api/search`

**Request:**
```json
{
  "query": "我想做一個 Discord 客服機器人",
  "language": "auto",
  "stream": true
}
```

**Response (SSE stream):**
- `event: status` — Current step message
- `event: intent` — Parsed intent (keywords, summary)
- `event: sources` — Source search results
- `event: tutorial` — Each skill's tutorial as it completes
- `event: done` — All results complete

**Non-streaming fallback:**
```json
{
  "query": "...",
  "intent": { "summary": "...", "keywords": [...] },
  "results": [{ "skill": {...}, "tutorial": "..." }],
  "language": "zh"
}
```

## Roadmap

See [ROADMAP.md](ROADMAP.md) for full project plan.

### Version 1.0 — MVP (Current)
- [x] Multi-source search architecture
- [x] AI intent parsing
- [x] Tutorial auto-generation
- [x] Streaming responses
- [ ] Production deployment

### Version 2.0 — Community
- [ ] GitHub OAuth
- [ ] Skill favorites / likes
- [ ] User reviews and ratings
- [ ] Personalized recommendations

### Version 3.0 — Platform
- [ ] Open API
- [ ] Paid skill marketplace
- [ ] Enterprise tier

## Contributing

Contributions welcome! Please read the project docs and open an issue first.

## License

MIT
