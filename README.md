[AI INFORMATION Banner](./icon-maskable-512.png)

# AI-INFORMATION

AI Platform that helps people check information and stay safe from scams — no ads, privacy first.

### Live Demo

- **AI Platform:** https://ai-information.pages.dev/
- **AI Platform Beta:** https://beta-ai-information.pages.dev/

> Open the link — no install needed. Works on phone and desktop.

## What is this?

AI-INFORMATION is an open-source AI platform. You can check information, compare, ask AI, and test if something is a scam — all in one place, without ads and without tracking your data.

I built the idea, I directed the project, and AI helped me write the code. I understand how every part works and I maintain it.

## Features

- **AI Assistant** — ask questions, get clear answers
- **Scam Lab** — check links, messages and offers for scams (AI Security)
- **Search & Compare** — search information and compare two things
- **Quiz, Weather, Video, Tools** — everyday tools in one place
- **Privacy first** — no ads, no selling data, open source

## How it is built — 6 parts

1. **Face — `index.html`** — what the user sees
2. **Brain — `app.js` + `core.js`** — main logic, connects all parts
3. **AI — `ai.js`** — talks to the AI, sends questions, gets answers
4. **Guardian — `scamlab.js` — Scam Lab** — checks for scams and protects the user
5. **Tools — `search.js`, `compare.js`, `quiz.js`, `weather.js`, `video.js`** — daily tools
6. **Cloud — `_worker.js` + Cloudflare Pages / Workers** — hosted on fast global servers

## Tech Stack

- HTML / CSS / JavaScript
- Cloudflare Pages + Cloudflare Workers
- Cloudflare Workers AI
- PWA — works as an app on phone

## How to use

1. Open https://ai-information.pages.dev/
2. Choose a tool — AI, Scam Lab, Search, Quiz
3. Use it — no account, no install

## For developers

```bash
# No build needed — static site
# Just open index.html or deploy to Cloudflare Pages
```

Main files: `index.html`, `app.js`, `core.js`, `ai.js`, `scamlab.js`

## Privacy & Security

- No ads
- Open source — you can check the code
- Be careful with your data while browsing

## Project

- **Author:** GeorgeMasterBG
- **License:** Open source
