# jarrett

A custom [micro.blog](https://micro.blog) theme, synced via GitHub.

## Structure

- `layouts/_default/baseof.html` — base HTML shell (head, header, footer, main block)
- `layouts/index.html` — home page post list
- `layouts/_default/list.html` — category/tag/section archive pages
- `layouts/_default/single.html` — generic pages (About, etc.)
- `layouts/post/single.html` — individual post page
- `layouts/partials/` — shared header, footer, head, post preview, pagination
- `static/css/main.css` — all styling
- `theme.toml` / `config.json` — theme metadata and Hugo config

## Buttondown

`buttondown/web.css` is the matching stylesheet for Buttondown newsletter archives. Copy it into **Settings → Archives → Custom CSS** (paid feature), or set the newsletter's `web_css` field via the Buttondown API. It overrides Buttondown's design tokens (`--color-action`, `--font-prose`, etc.) so it adapts to Buttondown's dark mode.

## Updating the live site

1. Edit files in this repo, commit, push to `main`.
2. In the micro.blog dashboard: **Design → Edit Custom Themes → Jarrett → Update from GitHub**.
3. Check the live site.

There's no API for step 2 — it's a manual pull from the dashboard.
