# Lampstand landing page — deployment

Static HTML/CSS/JS. No build step. Reads `sources.json` at runtime and
renders one card per published video.

## What goes in the bio link

Every Lampstand Instagram caption ends with `\u2192 link in bio`. The IG profile's
single bio link points at this page. Each card gives viewers the verified
sources for that story plus a link back to the Reel.

## Hosting: GitHub Pages (recommended)

The whole landing page is six tiny static files, so a dedicated repo
served by GitHub Pages is the simplest path. The workspace's parent repo
is the upstream `hyperframes-student-kit` template, so the landing page
needs its own repo under your account.

### One-time setup (you do this)

1. **Create a new GitHub repo** under your account, called
   `lampstand-landing`. Make it **public** (GitHub Pages on free plans
   only deploys public repos). Don't initialize it with a README,
   `.gitignore`, or license \u2014 keep it empty so the first push is clean.
2. **Push the landing-page contents** as the initial commit (Claude
   handles this for you on request once the repo exists \u2014 see "First
   push" below).
3. **Enable Pages** in the new repo: Settings \u2192 Pages \u2192 Source =
   "Deploy from a branch" \u2192 Branch = `main`, Folder = `/` (root) \u2192
   Save.
4. **Wait ~30\u201360 seconds.** The page goes live at
   `https://<your-username>.github.io/lampstand-landing/`. That URL is
   now your Instagram bio link target.

### First push (Claude runs this once the repo exists)

The landing-page subfolder gets initialized as its own git repo,
separate from the parent workspace's git history. The parent workspace
already ignores nested `.git/` directories.

```bash
cd christian-reels/landing-page
git init
git branch -m main
git add .
git commit -m "Initial Lampstand landing page"
git remote add origin https://github.com/<your-username>/lampstand-landing.git
git push -u origin main
```

After this, the per-publish flow is just `git push` from inside
`christian-reels/landing-page/`.

### Custom domain (optional)

When you register `lampstand.stories` (the locked wordmark and IG
handle), point it at GitHub Pages: Settings \u2192 Pages \u2192 Custom domain \u2192
`lampstand.stories`. GitHub provisions TLS automatically.

The site doesn't hard-code the domain anywhere, so the migration is
free.

## Local preview

```bash
cd christian-reels/landing-page
npx serve . -p 8090 -n
# open http://localhost:8090
```

`npx serve` is preferred over `python -m http.server` because it
supports HTTP Range requests \u2014 matters if a future iteration drops a
video onto the page, doesn't matter for the current text-only build.

## Auto-population from the pipeline

`sources.json` is regenerated from `christian-reels/queue.json` on every
publish step. Claude (running `/lampstand`) does both ends of this
automatically \u2014 you don't run the sync script by hand:

1. Claude updates a queue entry: sets `status: "published"`, fills
   `published_date`, fills `instagram_url` once the Reel URL is known.
2. Claude immediately runs **`sync-queue-csv.mjs`** (CSV mirror) and
   **`sync-landing-sources.mjs`** (this page's data) in the same
   session.
3. Claude commits + pushes from inside `christian-reels/landing-page/`.
4. GitHub Pages redeploys within ~60 seconds.

Pending / in-flight queue entries are never exposed publicly \u2014 the
sync script filters to `status === "published"` only.

### Optional fields on queue entries

- `instagram_url` \u2014 the Reel's permalink, e.g.
  `https://www.instagram.com/reel/<code>/`. Populated after publish.
- `focus_statement` \u2014 the 3\u20135-word italic-gold tagline from the cover
  frame (e.g. `"saved by angels"`). Used as the card's italic tagline.
  If absent, the card renders without one.

Both are pass-through optional. `sync-landing-sources.mjs` includes
them when present, omits them when null.

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
\u2514\u2500\u2500 DEPLOY.md             \u2190 this file
```
