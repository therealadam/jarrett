# jarrett

A custom [micro.blog](https://micro.blog) theme, synced via GitHub.

## Structure

- `layouts/_default/baseof.html` — base HTML shell (head, header, footer, main block)
- `layouts/index.html` — home page post list
- `layouts/_default/list.html` — category/tag/section archive pages
- `layouts/_default/single.html` — generic pages (About, etc.)
- `layouts/post/single.html` — individual post page
- `layouts/list.archivehtml.html` — `/archive/`, rendered with the layout named in `params.archive_style`
- `layouts/list.photoshtml.html` — `/photos/`, a grid of every photo (not just the first of each post) linking back to its post; replaces micro.blog's built-in photos template. `layouts/partials/gallery-photos.html` picks the photos out of a post and skips non-image attachments
- `layouts/shortcodes/bookshelves.html` + `static/js/bookshelf.js` — `{{< bookshelves >}}` renders every bookshelf as a cover grid with a nav to switch shelves (`shelf="..."` for just one). Clicking a book pulls it onto its own row with a list of posts that link to its ISBN (micro.blog's `books` front matter). Shelf names come from `params.bookshelf_labels` (shelf key → name), else built-in defaults, else the key capitalized (`finished` → Finished). It isn't called `bookshelf` because the "Bookshelf shortcode" plug-in's `bookshelf` shortcode overrides the theme's. Replaces the bookshelf plug-in's shortcode
- `layouts/list.archive<layout>.html` — a preview of every archive layout at `/archive/<layout>/`; their output formats are declared in `config.json`
- `layouts/partials/archive.html` and `layouts/partials/archive/` — the archive layouts (classic, ledger, rhythm, lanes, almanac, index, quilt, receipt) and shared pieces: post classification (titled, note, photo, photos), thumbnails, year links
- `layouts/partials/` — shared header, footer, head (including the font pairing and page layout), post preview, pagination
- `static/css/main.css` — all styling
- `theme.toml` / `config.json` — theme metadata and Hugo config. `config.json` repeats theme-blank's `outputFormats`/`outputs` so adding the archive formats can't drop micro.blog's feeds if it replaces those keys instead of merging them

## Archive layout

Pick the `/archive/` layout with `archive_style`: `classic`, `ledger`, `rhythm` (default), `lanes`, `almanac`, `index`, `quilt`, or `receipt`. Unknown values fall back to `rhythm`.

- **Theme settings:** `plugin.json` declares the field, so micro.blog shows it under the theme's settings.
- **Theme config:** change the default in `config.json` → `params.archive_style`.
- **A plug-in:** any plug-in that sets `params.archive_style` overrides the theme (micro.blog merges defaults, then theme, then plug-in params).

## Fonts

Pick a font pairing with `font_style` (theme settings, or `config.json` → `params.font_style`): `instrument` (default), `charter` (system fonts), `geist`, `garamond`, `baskerville`, `mono`, `bricolage`, `paper` (self-hosted [Paper Mono](https://paper.design/mono)), or one of the newer classic (`playfair`, `merriweather`, `crimson`), trendy (`fraunces`, `dmserif`, `jakarta`), and weird (`typewriter`, `syne`, `blackletter`), and automotive (`highway`, `futura`, `dashboard`, `chrome`) pairings. The pairings live in `layouts/partials/fonts.html` (Google Fonts stylesheets) and the `[data-font]` blocks at the top of `static/css/main.css`.

Add `?font=<name>` to any page URL to preview a pairing; it sticks for that browser tab and `?font=` clears it.

## Page layout

Pick how the header, navigation, and footer are arranged with `layout_style` (theme settings, or `config.json` → `params.layout_style`). Unknown values fall back to `masthead`.

- `centered` — avatar, title, and nav stacked in the middle
- `masthead` (default) — avatar and title on the left, nav on the right, one row
- `nameplate` — a newspaper flag: big title, nav between a rule and a double rule
- `minimal` — title and nav as one plain line of text (`Title / About / Archive`)
- `sidebar` — a sticky left column with the title and a stacked nav, à la Daring Fireball (centered on narrow screens)
- `spine` — the header is a dark book spine down the left edge, title and nav set vertically (a band across the top on narrow screens)
- `palette` — the nav hides behind a "Go to…" button (or `/`) that opens a full-screen, filterable index of pages in big display type

Every layout uses the same markup; each is a `[data-layout]` block in `main.css`, and the list lives in `layouts/partials/site-layout.html`. The palette's button and dialog are built by `theme.js`, and the nav only hides once the button exists, so it still shows without JavaScript.

Add `?layout=<name>` to any page URL to preview one; like `?font=`, it sticks for the tab and `?layout=` clears it.

## Tinker mode

A toolbar for trying the font pairings and archive layouts without touching settings. Open it with `?tinker` on any page or by pressing `t` (ignored while typing or with a modifier held); close it with `t`, `Esc`, the × button, or `?tinker=off`. It stays open for that browser tab.

- **Font** applies a pairing live (same as `?font=`).
- **Layout** applies a page layout live (same as `?layout=`).
- **Archive** swaps in the chosen layout on `/archive/` without reloading (it fetches `/archive/<layout>/`); elsewhere it jumps to that preview page. The pick sticks for the tab.
- **Reset** returns to the site's configured font, page layout, and archive layout.

It's all in `static/js/theme.js` (toolbar built on demand) and the `.tinker` block in `main.css`. The fonts, page layouts, and archive list reach the script through the `theme-options` JSON in `layouts/partials/head.html`; add a new archive layout to that list too.

## Buttondown

`buttondown/web.css` is the matching stylesheet for Buttondown newsletter archives. Copy it into **Settings → Archives → Custom CSS** (paid feature), or set the newsletter's `web_css` field via the Buttondown API. It overrides Buttondown's design tokens (`--color-action`, `--font-prose`, etc.) so it adapts to Buttondown's dark mode.

## Updating the live site

1. Edit files in this repo, commit, push to `main`.
2. In the micro.blog dashboard: **Design → Edit Custom Themes → Jarrett → Update from GitHub**.
3. Check the live site.

There's no API for step 2 — it's a manual pull from the dashboard.
