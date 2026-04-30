# Lampstand landing page — deployment

Static HTML/CSS/JS. No build step. Reads `sources.json` at runtime and
renders one card per published video.

## Live URL

**https://lampstand-landing.vercel.app/** \u2014 this is the bio link in
the @lampstand.stories Instagram profile.

## What goes in the bio link

Every Lampstand Instagram caption ends with `\u2192 link in bio`. The IG
profile's single bio link points at this page. Each card gives viewers
the verified sources for that story plus a link back to the Reel.

## Hosting: Vercel + GitHub (already wired)

The whole landing page is six tiny static files. They live in their own
GitHub repo (`Jcrab13/lampstand-landing`), separate from the parent
workspace. Vercel watches the GitHub `main` branch and auto-deploys on
every push.

### Architecture

```
christian-reels/landing-page/   \u2190 local working tree (this folder)
   \u2502
   \u2502 git push
   \u25bc
github.com/Jcrab13/lampstand-landing   \u2190 source of truth
   \u2502
   \u2502 webhook
   \u25bc
Vercel  \u2192  https://lampstand-landing.vercel.app/
```

### Per-publish flow (Claude does this; user does not run any deploy command)

1. Human says in chat: **"Bruce is up, used caption A"** (or B). One sentence \u2014 no URL paste.
2. Claude updates `christian-reels/queue.json` for that entry: `chosen_caption: "a"` (or `"b"`), `status: "published"`, `published_date: <today>`.
3. Per the SKILL.md auto-sync rule, Claude immediately runs both sync scripts (`sync-queue-csv.mjs` + `sync-landing-sources.mjs`).
4. Claude commits + pushes from inside `christian-reels/landing-page/`:
   ```bash
   git -C christian-reels/landing-page add -A
   git -C christian-reels/landing-page commit -m "publish <slug>"
   git -C christian-reels/landing-page push
   ```
5. Vercel sees the push, builds (no build step \u2014 just static asset upload), and serves the new `sources.json` within ~30\u201360 seconds.
6. The new card appears on the page on next reload.

The user's per-video manual touchpoints: caption pick from `queue.csv`, CapCut mix, IG upload, one chat sentence. Everything else is automated.

## Local preview (when iterating on the page itself)

```bash
cd christian-reels/landing-page
npx serve . -p 8090 -n
# open http://localhost:8090
```

Useful when changing the layout, brand text, or styling. For pure
content updates (a new published story), the per-publish flow above
covers everything \u2014 no need for local preview.

## Custom domain (optional, future)

`lampstand.stories` is the locked wordmark and IG handle. To swap the
public URL to that domain:

1. Register `lampstand.stories` at any registrar (Namecheap, Cloudflare,
   Porkbun \u2014 ~$30\u201360/yr for the `.stories` TLD).
2. In the Vercel dashboard: Project (`lampstand-landing`) \u2192 Settings \u2192
   Domains \u2192 Add `lampstand.stories`. Vercel shows the DNS records to
   create.
3. At the registrar: add the records Vercel specified (typically a
   single `A` or `CNAME`). Vercel auto-provisions TLS.
4. Update Instagram bio to `https://lampstand.stories`.

The site doesn't hard-code the domain anywhere, so the migration is
zero-touch on this codebase.

## Auto-population from the pipeline

`sources.json` is regenerated from `christian-reels/queue.json` on every
publish step. Claude (running `/lampstand`) does both ends of this
automatically per the auto-sync rule in the skill \u2014 you don't run
the sync script by hand.

The sync script filters `queue.json` to entries where `status ===
"published"` and projects the public-safe fields (subject, summary,
source_urls, published_date, focus_statement) into `sources.json`.
**Pending or in-flight stories are never exposed publicly.**

### Optional field on queue entries

- `focus_statement` \u2014 the 3\u20135-word italic-gold tagline from the cover
  frame (e.g. `"saved by angels"`). Used as the card's italic tagline.
  If absent, the card renders without one.

Pass-through optional. `sync-landing-sources.mjs` includes it when
present, omits it when null.

### What's deliberately out of scope

The landing page does NOT track per-story Instagram Reel URLs. The hero
"Follow on Instagram" link in the page header is the only IG-side link.
Chasing IG permalinks would require either an IG Business account
upgrade + Meta Graph API integration (heavy) or scraping (fragile,
ToS-questionable). Neither is worth the trouble for the value gained \u2014
visitors who land on this page already came from Instagram.

## What's NOT auto-populated

The static text on the page itself:

- The hero wordmark (`LAMPSTAND.STORIES`) and tagline
  (`Verified miracles. Real testimonies.`)
- The about paragraph
- The footer attribution

Those live in `index.html` and only change when the channel's
positioning changes \u2014 manual edit, no pipeline involvement.

## File map

```
christian-reels/landing-page/
\u251c\u2500\u2500 index.html            \u2190 markup, semantic, mobile-first
\u251c\u2500\u2500 styles.css            \u2190 brand styles (navy / gold / cream)
\u251c\u2500\u2500 app.js                \u2190 fetches sources.json, renders cards
\u251c\u2500\u2500 sources.json          \u2190 auto-generated from queue.json (do NOT hand-edit)
\u251c\u2500\u2500 assets/
\u2502   \u2514\u2500\u2500 flame-bowl.png    \u2190 Variant B logo, served from page root
\u251c\u2500\u2500 .gitignore            \u2190 ignores .DS_Store
\u251c\u2500\u2500 .git/                 \u2190 nested git repo (origin: Jcrab13/lampstand-landing)
\u2514\u2500\u2500 DEPLOY.md             \u2190 this file
```

## Note on GitHub Pages

The `Jcrab13/lampstand-landing` repo also has GitHub Pages enabled from
the initial setup (it's serving the same content at
`https://jcrab13.github.io/lampstand-landing/`). It's harmless \u2014 just
a duplicate URL serving identical content \u2014 but if you want a single
canonical URL, disable Pages in: GitHub repo \u2192 Settings \u2192 Pages \u2192
Source = "None". Vercel remains the production deploy.
