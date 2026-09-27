# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Personal music portfolio for **黄硕羽 (Shuoyu Huang)** — composer, music producer, and music-product planner. She also posts on Douyin as 「小猫很想你」「追忆小猫」.

- Live site: https://shuoyuhuang.github.io
- Remote: https://github.com/shuoyuhuang/shuoyuhuang.github.io
- Deploy: GitHub Pages, served straight from the `main` branch root. Pushing to `main` publishes. There is no build step and no CI.

## Decision log (required)

`PROJECT_LOG.md` in the repo root records every step and decision made on this project.

- Add a dated entry to `PROJECT_LOG.md` for **every** change you make, in the same commit as the change.
- Record what changed, why, where the content came from (resume, Bilibili page, etc.), and any open questions for the owner.
- Write entries in Chinese, matching the existing log.
- Never rewrite old entries. If a decision gets reversed, add a new entry that says so.

## Stack & layout

Plain static site: hand-written HTML, CSS, and vanilla JS. No framework, bundler, or package manager. Keep it that way unless the owner asks otherwise.

```
index.html              # the only page; all content lives here
assets/css/style.css    # all styles; design tokens in :root
assets/js/main.js       # nav, audio player, i18n, scroll reveal
assets/images/          # photo.jpg, favicon.svg (seal), favicon.png (fallback)
assets/images/works/    # cover images for the "音乐产品企划" project cards
music/                  # .mp3 files played on the site (.wav masters are gitignored)
tmp/                    # local source material (resume etc.); gitignored, never commit
PROJECT_LOG.md          # step/decision log (see above)
```

## Languages (i18n)

- **Chinese is the default.** `index.html` is written in Chinese (`<html lang="zh-CN">`). The top-right toggle switches to English and back.
- Every translatable element has a `data-i18n="key"` attribute. On load, `main.js` reads the Chinese strings from the DOM. **Only English strings live in JS** (the `en` object). Never copy Chinese text into JS.
- Adding text: put the Chinese in HTML with a new `data-i18n` key, then add the same key to `en` in `main.js`. Values may contain inline HTML (`<strong>`, `<em>`).
- Check that the keys match after editing:
  ```sh
  diff <(grep -o 'data-i18n="[^"]*"' index.html | cut -d'"' -f2 | sort -u) \
       <(grep -oE "^    '[a-z0-9.]+'" assets/js/main.js | tr -d " '" | grep -v meta.title | sort -u)
  ```
- The language choice is deliberately not saved. Every visit starts in Chinese.

## Design system ("paper & seal")

The site should read as a crafted personal page, not a template. Keep to this direction.

- **Palette** (tokens in `:root`): warm paper `--paper #f3efe7`, ink `--ink #181614`, greys `--ink-2`/`--ink-3`, hairlines `--rule`, and **one** accent: seal red `--accent #b8321f`. Use the accent sparingly: index numbers, role labels, the playing state, and hovers. Don't add more colors, gradients, glows, or dark/neon themes.
- **Type**: Chinese display `Noto Serif SC` (`--font-cn-display`); Latin display `Instrument Serif` (`--font-display`, one weight only, so keep `font-synthesis: none` on titles); body `Geist` + `Noto Sans SC`; `Geist Mono` for indices and meta. All come from Google Fonts in `index.html`.
- **Structure**: every section uses `.section-grid`, with a sticky `.section-head` (mono `01`–`04` index + serif title) on the left and content on the right, each column topped by a 1px ink rule. Lists are separated by hairlines, not boxed cards.
- **Motifs**: the red seal (`.seal` 羽, also `assets/images/favicon.svg`), a subtle paper grain (`body::before`), and text links with a growing underline (`.text-link`). Motion stays minimal (`.reveal` fade-up) and respects `prefers-reduced-motion`.
- Avoid: particle backgrounds, glassy cards, purple/blue gradients, emoji, icon-heavy UI, and anything that looks mass-generated.

## Content conventions

Page order: 首屏 → 关于我 → **音乐产品企划** (`#projects`) → **音乐作品集** (`#portfolio`) → 联系. The two work sections are sibling top-level `<section>`s, and projects comes first. Nav order matches.

- **Titles**: for works whose only real name is Chinese, the Chinese page shows **only the Chinese name** (e.g. `《林》`). The English page shows `English <span class="track-cn">《中文》</span>`. So such titles carry a `data-i18n="….title"` key. Works that only have a Latin-script name (e.g. *Sparkling Love*, *Do*) use a plain title with no i18n key.
- **Music projects (音乐产品企划)**: `article.project` inside `.project-list`. Each has a cover (4:3 crop), a meta line with an index, a title, a description, a `.project-role` block (the "我的角色" label plus the roles), and a `.text-link` out. There is no audio player. `.project-role` starts with `<strong>` listing her roles exactly as she stated them (see `PROJECT_LOG.md`), separated by ` · `, followed by one sentence of specifics.
- **Original works (音乐作品集)**: a `.track` row inside `.track-list`: index, title and description, and an `.audio-player data-src="music/…mp3"`. `main.js` relies on the player's inner classes (`.play-btn`, `.progress-bar`, `.progress-fill`, `.current-time`, `.duration`), so don't rename them.
- **About (关于我)**: three short paragraphs based on the latest resume. Don't make it longer when updating it.
- Facts such as play counts, dates, and roles must come from a source (resume, official Bilibili/WeChat page). Don't invent numbers. Log the source in `PROJECT_LOG.md`.
- Don't publish private details (phone number, birth date) that appear in the source resume.

## Assets

- Cover images: JPEG, longest side ≤ 800px, roughly 80% quality (`sips -Z 800 -s formatOptions 82 file.jpg`). Name them in kebab-case pinyin, e.g. `youzhongyue.jpg`. Covers crop to 4:3 (16:10 on phones), so use an inline `object-position` to keep the subject in frame.
- Audio: commit web `.mp3` only. `.wav` masters are gitignored.
- Always give `<img>` a `width`/`height`, and add `loading="lazy"` below the fold.
- Bilibili blocks plain `curl` calls to its API (HTTP 412). To get metadata, open the video page in the browser and read `window.__INITIAL_STATE__.videoData` (title, pic, desc, stat). Cover URLs on `i*.hdslb.com` download fine with `curl`.

## Preview & verify

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

Before committing, check:
1. The page loads in Chinese, the toggle switches every string to English and back, and the tab title changes too.
2. There's no horizontal scroll at about 390px width. On phones, the section heads, project rows and track rows all stack.
3. Audio players still play, and every external link opens in a new tab (`target="_blank" rel="noopener"`).
4. `node --check assets/js/main.js` passes and the i18n key diff above prints nothing.

## Git

- Work on `main` (GitHub Pages serves from it). Use small, descriptive commits. Only commit or push when the owner asks.
- Never commit `tmp/`, `.DS_Store`, or `.wav` files.
