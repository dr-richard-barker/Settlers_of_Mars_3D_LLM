---
description: >-
  "Settlers of Mars and D&D Role Player Adventure: The Gateway to Space Science
  Mastery"
---

# 🪐 Settlers of Mars

**Space-science through play.** A choose-your-own-adventure that blends
**Settlers of Catan**, **Dungeons & Dragons**, and **SimCity** to teach space
biology, biotechnology, and aerospace engineering. Play it three ways — in your
browser, as an AI-guided tabletop role-play, or as a 3D-printed board.

### ▶️ Website: <https://dr-richard-barker.github.io/Settlers_of_Mars_3D_LLM/>

> This README is the project's **single source of truth** — the running list of
> ideas, goals, and loose ends so nothing gets lost. If you do something, tick
> it. If you dream something up, add it under *Ideas*.

---

## The three ways to play

| Mode | What it is | Where |
|------|-----------|-------|
| 🎮 **Browser colony sim** | *Lunar & Martian Frontier* — a standalone SimCity × Catan × Civ game. No sign-up, runs in-browser. | [Play now](https://dr-richard-barker.github.io/Lunar-and-Martian-frontier-game-prototype/) · [source repo](https://github.com/dr-richard-barker/Lunar-and-Martian-frontier-game-prototype) |
| 🧙 **AI role-play** | Copy-paste prompts turn any chatbot into a "Space Wizard" Dungeon Master for a D&D-style mission to Mars. | [`roleplay.html`](roleplay.html) |
| 🖨️ **Physical board** | Download STL files, 3D-print and paint the Martian terrain, lay out your hex map. | [`build.html`](build.html) |

## The website (this repo → GitHub Pages)

Plain static HTML at the repo root — no build step. Deployed automatically by
[`.github/workflows/pages.yml`](.github/workflows/pages.yml) on every push to `main`.

| Page | Purpose |
|------|---------|
| [`index.html`](index.html) | Home — the vision and the two paths (play / build) |
| [`play.html`](play.html) | Embeds the live browser game + intro to the tabletop role-play |
| [`roleplay.html`](roleplay.html) | Character roles + copy-paste AI Dungeon-Master prompts (Levels 1–5) |
| [`build.html`](build.html) | STL downloads, 3D-printing steps, AI board-art generation, layout gallery |
| [`biosim.html`](biosim.html) | **BioSim Lab** — intro to bioregenerative life support + an in-browser habitat simulator (run, save, compare) + the live BioSim GUI |
| [`about.html`](about.html) | Story, credits, license, how to cite, roadmap |

## Repo map

```
Settlers_of_Mars_3D_LLM/
├── index.html  play.html  roleplay.html  build.html  about.html   # the website
├── 404.html   .nojekyll                                           # Pages plumbing
├── assets/css/site.css   assets/js/site.js                        # shared theme + behaviour
├── .github/workflows/pages.yml                                    # auto-deploy to Pages
│
├── STL files/                # 3D-printable board pieces (Olympus Mons, Valles Marineris,
│                             #   Gale Crater, Ice Caps, Dome) + board photos
├── Example board layout/     # example hex-map layouts (real + AI-generated)
├── Prompt engineering/       # DALL·E board-art prompts + results
├── Characters/               # character art + role descriptions
├── Images/                   # story-board imagery (Mars, Moon, montages)
├── ChatBot_priming_for_DnD_game/   # long-form DM priming templates
├── templates/                # AI-studio Gemini prompt notebook
├── chatbot_priming_for_dnd_game-*.md  example*.md   # 5 levels of DM prompts + playthroughs
├── astrobotany-board-game.md  characters.md  Simple_minimal_game_plan_20_page.md
├── SUMMARY.md                # GitBook table of contents (legacy)
│
├── README.md                 # ← you are here (project tracker)
├── PUBLISHING.md             # GitHub Pages + Zenodo release checklist
├── CITATION.cff  .zenodo.json  LICENSE   # citation + archive metadata (CC-BY-4.0)
```

---

## 🎯 Goals

1. **One website** where anyone can arrive and immediately either *play* the game
   or *learn to build* it.
2. **Lower every barrier to entry** — browser game for zero-setup players, AI
   guide for people new to D&D, printable board for makers, paper board for
   everyone else.
3. **Smuggle in real science** — every mechanic maps to a genuine space-biology,
   biotech, or engineering challenge.
4. **Be citable and reusable** — open license + Zenodo DOI so educators can
   reference and remix it.

## ✅ Roadmap / loose-end tracker

### Done
- [x] Browser colony sim (*Lunar & Martian Frontier*) built and deployed
- [x] 3D-printable STL board pieces
- [x] Five levels of AI "Space Wizard" Dungeon-Master prompts + example playthroughs
- [x] Example board layouts + DALL·E board-art prompt-engineering examples
- [x] **GitHub Pages website** (this hub: play / role-play / build / biosim / about)
- [x] **Zenodo-ready metadata** — `LICENSE` (CC-BY-4.0), `CITATION.cff`, `.zenodo.json`, `PUBLISHING.md`
- [x] **BioSim Lab page** — intro to bioregenerative life support (BLSS) grounded in the Kortenkamp & Bell BioSim paper; embeds the [SALAD-project BioSim GUI](https://biosim.saladproject.org/); in-browser "AstroBotany BioSim Lite" mass-balance sandbox with save-to-browser + CSV/JSON export to compare designs by mission length & ESM

### In progress / to confirm (the actual loose ends)
- [x] **Enable Pages** (done — Source set to GitHub Actions; site live at the URL above)
- [x] **Verify the embedded game loads** inside `play.html`'s iframe (confirmed working; a fallback "open full-screen" link is provided too)
- [ ] **Credit the original Insight Wisconsin students** as co-creators in `CITATION.cff` + `.zenodo.json` (check consent for minors)
- [ ] **Add real ORCID** + confirmed release date in `CITATION.cff`
- [ ] **Flip on the Zenodo–GitHub integration** and cut a `v1.0.0` release to mint a DOI; add the DOI badge here
- [ ] Confirm the two PDF/PPTX action-plan downloads still resolve (they point at old GitHub `/files/` upload URLs) and re-host in-repo if broken

### 🔬 BioSim / life-support track
- [ ] **Run the real model, not just Lite** — server-side BioSim (`biosim_astrobotany` is Java/CORBA) behind an API the site can call, or a WASM/compiled port; persist runs to a shared DB instead of just `localStorage`
- [ ] **ML habitat optimisation** — genetic algorithm / reinforcement learning over the design space (crew, crop area & mix, recycling efficiency, store sizing) to minimise ESM while staying closed-loop, exactly as the BioSim paper does; seed it from the saved-run dataset
- [x] **Tune BioSim Lite's coefficients** against NASA data — human loads from BVAD REV2 (Tables 3‑31 & 4‑51); crop O₂/biomass/water/light from the Wheeler (2008) / SIMOC plant table; added a lighting-power term to the ESM so the wheat-vs-potato power trade-off shows up
- [ ] **AIRI-course module** — lesson plan + worksheet: design a habitat, defend the trade-offs, export runs, then race a human design vs. the ML optimiser
- [ ] **Shared model-comparison gallery** — let learners submit their BioSim runs and leaderboard them by ESM / sustainability

### 💡 Ideas (someday / maybe)
- [ ] Printable **rulebook PDF** + a one-page quick-start
- [ ] **Classroom lesson plans** mapping each stage to a curriculum standard
- [ ] A **community gallery** of player-made boards, characters, and mission stories (issue template or a submissions page)
- [ ] Deeper **space-biology tie-ins** — use real NASA GeneLab / OSDR datasets as in-game "discoveries"
- [ ] **Print-and-play** paper board (PDF) for players without a 3D printer
- [ ] Short **demo video / GIF** of the browser game for the home page
- [ ] Package the DM prompts as a shareable **custom GPT / assistant**
- [ ] Tighten spelling/typos in the legacy markdown lore files

---

## Run the site locally

It's plain static HTML — just open `index.html`, or serve the folder:

```bash
python -m http.server 8000   # then visit http://localhost:8000
```

## License & citation

Creative content (designs, art, STL, text, prompts) is **CC BY 4.0**; any code is
also **MIT**. See [`LICENSE`](LICENSE). To cite, see [`CITATION.cff`](CITATION.cff)
or the "How to cite" section on [`about.html`](about.html).

## Credits

Created by **Dr Richard Barker** on behalf of
[The Collaborative Science Environment](https://www.cosecloud.com), building on
the original **Insight Wisconsin** inventors'-club prototype. An independent
**educational** project — not affiliated with or endorsed by NASA, ESA, or the
makers of Settlers of Catan or Dungeons & Dragons.
