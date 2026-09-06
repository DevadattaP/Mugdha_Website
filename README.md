# Mugdha Pokharanakar | Portfolio website

Served as static files via GitHub Pages. No build step, no framework, no bundler — plain HTML/CSS/JS (Bootstrap 5 for styling/components) that loads shared layout and page content at runtime.

Live at: <https://mmpokharanakar.github.io/>

## How it works

Every page is a static `.html` file with the full page markup already in it, plus two placeholder `<div data-include="...">` elements for the shared navbar and footer. On load, `js/script.js`:

1. Fetches `partials/head.html` and appends its contents (charset, viewport, favicon) to `<head>`.
2. Finds every `[data-include]` element on the page and replaces its contents with the fetched HTML from the referenced partial (`partials/navbar.html`, `partials/footer.html`).
3. Marks the current page's nav link `active` by comparing `location.pathname` against each link's `href`.
4. Runs a couple of page-specific UI behaviors (hiding the hero name from the navbar while it's on-screen on the homepage; smooth-scroll from the "scroll to education" chevron on mobile).
5. Hides the full-screen logo spinner (`#loading`) once everything above has finished.

This is a **partial-include pattern**, not a full SPA — there's no router and no client-side page-to-page navigation; every `.html` file is a real, independently-loadable page and normal `<a href="...">` links do full page loads.

Separately, most pages fetch a `data/*.json` (or `.bib`) file with their own dedicated script (`js/<page>.js`) and render it into an empty list/container already present in the page's markup. This part **is** the same content-from-JSON approach used on my own site, just scoped per-page instead of going through a shared `Site.init()` helper.

Because content is fetched with `fetch()`, **the site must be served over HTTP(S)**, not opened directly as a `file://` URL (browsers block local fetches under that scheme). For local development:

```bash
python3 -m http.server
# then open http://localhost:8000/
```

> In VSCode, the "Live Server" extension is a convenient way to serve the site locally.

### Pages and their data sources

| Page | Script(s) | Data file | Notes |
| --- | --- | --- | --- |
| `index.html` | — (content is static in the HTML) | — | Hero/about + education timeline are hand-written directly in the page, not JSON-driven. |
| `research.html` | `js/research.js` | `data/research.bib` | Parses BibTeX client-side with a small hand-rolled regex parser (`parseBibTeX`) — not a library. Renders `@article` entries with journal/volume/pages, and falls back to a generic format (e.g. `@misc` arXiv preprints) otherwise. |
| `talks.html` | `js/talks.js` | `data/talks.json`, `data/posters.json` | Renders two separate lists (talks, poster presentations) on the same page. |
| `conference-workshop.html` | `js/conference.js` | `data/conferences.json` | Flat list of attended conferences/workshops. |
| `teaching-assistance.html` | `js/teaching-assistance.js` | `data/teaching-assistance.json` | TA and mentoring roles. |
| `outreach.html` | `js/outreach.js` | `data/outreach.json` | Science-communication writing (Marathi-language articles, etc.). |

### `event`/`title` markdown-style links

`talks.json`, `posters.json`, `conferences.json`, and `teaching-assistance.json` allow a field to be plain text **or** a single Markdown-style link, e.g.:

```json
"event": "[Summer School for Women in Mathematics and Statistics (SWMS) 2026](https://www.icts.res.in/program/swms2026)"
```

Each page script has its own small `formatEvent()`/inline regex (`/^\[(.+?)\]\((.+?)\)$/`) that converts that one pattern into a real `<a target="_blank">` link; plain strings pass through unchanged. This is not a Markdown renderer — it only recognizes exactly one `[text](url)` pair per field.

### Optional per-item PDF links

Talks/posters entries may include `slides_link` / `poster_link` pointing at a PDF under `assets/`; when present, the script renders an extra "Slides"/"Poster" button. Omit the field to hide the button.

## Data files (`data/*`)

- `research.bib` — standard BibTeX, hand-parsed (see above). Add a new entry to add a new publication; no other file needs updating.
- `talks.json` / `posters.json` — arrays of `{ title, event, location, date, slides_link? | poster_link? }`.
- `conferences.json` — array of `{ title, link, location, date }`.
- `teaching-assistance.json` — array of `{ title, organization, dates, extra? }`. `title` may embed a Markdown-style link.
- `outreach.json` — array of `{ title, description, link, year }`.

## Structure

```text
├── index.html, research.html, ...   # one static page per section, full markup inline
├── partials/
│   ├── head.html                    # charset/viewport/favicon, appended to <head> at runtime
│   ├── navbar.html                  # shared nav, injected into [data-include] placeholders
│   └── footer.html                  # shared footer, injected the same way
├── css/
│   ├── style.css                    # shared site-wide styles
│   ├── index.css, education.css     # homepage-specific styles
├── js/
│   ├── script.js                    # partial-include loader, active-nav, homepage/mobile UI behaviors
│   └── research.js, talks.js, conference.js, teaching-assistance.js, outreach.js  # one fetch+render script per data-driven page
├── data/                            # JSON/BibTeX content consumed by the scripts above
├── images/                          # logo, profile photo, favicon
├── assets/                          # PDFs (thesis, talk slides, posters)
├── robots.txt, sitemap.xml          # crawler config
└── googleaxxxxxxxxxxxxxxx.html      # Search Console ownership file
```

## SEO

Each page's `<head>` carries a hand-written, page-specific SEO block directly in the `.html` file (not in `partials/head.html`, since that partial is only injected *after* the page has already loaded — SEO tags need to be present in the initial HTML response for crawlers and link-preview bots that don't run JavaScript):

- Unique `<title>` and `<meta name="description">` per page.
- `<link rel="canonical">` pointing at the absolute `https://mmpokharanakar.github.io/...` URL.
- Open Graph tags (`og:type`, `og:title`, `og:description`, `og:url`, `og:image`) for link previews on social/chat platforms.
- Twitter Card tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
- Shared favicon (`images/favicon.ico`, wired via `partials/head.html`) and a shared og/twitter image (`images/mugdha.jpg`) across all pages.
- `robots.txt` allows all crawling and points to `sitemap.xml`.
- `sitemap.xml` lists every page with `lastmod`/`changefreq`/`priority` hints (homepage and research weighted highest; outreach weighted lowest).
- Google Search Console ownership can be verified two ways: the google-site-verification meta tag on index.html and the googleaxxxxxxxxxxxxxxx.html verification file at the site root.

**Caveat — more significant here than on a typical static site:** unlike the page content, which is fetched via JSON, the **navbar and footer themselves** are also injected client-side via `data-include` + `fetch`. A crawler that does not execute JavaScript (or times out before the include finishes) will see a page with a working `<head>` and main content, but no navigation or footer links at all — meaning it may never discover the other pages by crawling links, and would have to rely entirely on `sitemap.xml` to find them. Google's crawler generally renders JS and follows the include, but this is worth keeping in mind for other crawlers/bots and for the general robustness of internal link discovery. Because of this, `sitemap.xml` is the primary way search engines will find every page here, not in-page navigation links.

When copying an existing page's `<head>` for a new page, remember to update: `<title>`, `meta description`, `canonical`, and both `og:url`/`og:title`/`og:description` and `twitter:title`/`twitter:description` — then add the URL to `sitemap.xml`.

## Deployment

Static hosting via GitHub Pages, served directly from the repo root — no build/CI step. Pushing to the deployed branch is the deploy.
