# Copilot Instructions

Hugo-based personal blog hosted on GitHub Pages. Theme: [PaperMod](https://github.com/adityatelange/hugo-PaperMod) (git submodule).

## Commands

```bash
# Local development
hugo server                              # Serve at localhost:1313
hugo server --buildDrafts                # Include draft posts
hugo server --cleanDestinationDir --gc --buildDrafts  # Clean build with drafts

# Production build (outputs to /docs)
hugo --environment production

# Create a new post
hugo new content posts/my-post.md
```

## Architecture

- **Content** lives in `content/posts/` as `.md` files or page bundles (directories with `index.md`)
- **Published output** goes to `docs/` (used by GitHub Pages on the `deploy` branch)
- **Theme customizations** override PaperMod via `layouts/` (partials, shortcodes, `_default/list.html`)
- **Global CSS** in `assets/css/global/` is injected via `layouts/partials/extend_head.html`
- **Analytics** (Yandex.Metrika + Google Analytics) are only active when `--environment production`

CI pipeline: build → htmltest validation → push `docs/` to `deploy` branch.

## Post Naming & Draft Rules

A pre-commit hook (`scripts/post-enumerating/`) enforces these rules:

| Filename pattern | `draft` value |
|---|---|
| `YYYY-MM-DD-title.md` or `YYYY-MM-DD_title/index.md` | Must be `false` (or absent) |
| `0-anything.md` | Must be `true` |

**Published post filenames** must match: `202[45]-MM-DD[-_][a-z0-9]+([-_][a-z0-9]+)+`

## Front Matter

```yaml
---
title: 'Post Title'
date: '2025-01-15T00:00:00Z'
draft: false
summary: "Short description shown on post cards"   # optional
description: "Subtitle shown inside the post"      # optional
tags: ["tag1", "tag2"]                             # optional
styles:                                             # optional: CSS from page bundle
  - custom.css
scripts:                                            # optional: JS from page bundle
  - custom.js
aliases:                                            # optional: redirect old URLs
  - /old-path
---
```

## Page Bundles

When a post needs local assets (images, JS, CSS), use a page bundle:

```
content/posts/2025-01-15-my-post/
├── index.md        # Post content
├── demo.js         # Page-specific JS
├── demo.css        # Page-specific CSS
└── image.png
```

Reference bundle assets in front matter via `scripts`/`styles`, or in content with shortcodes.

## Custom Shortcodes

```
{{< load_resource "file.html" >}}     # Embed an HTML file from the page bundle
{{< load_script "script.js" >}}       # Load a JS file from the page bundle
{{< columns >}}
Left content
NEW_COLUMN
Right content
{{< /columns >}}                       # Multi-column layout
{{< builtin_icon "icon-name" >}}      # Render a built-in icon
```

Mermaid diagrams work in fenced code blocks with ` ```mermaid `.

## Pre-commit Hooks

Install with `pre-commit install`. Hooks run: trailing-whitespace, end-of-file-fixer, check-yaml, check-json, black (Python), actionlint, yamllint, mdformat (GFM + frontmatter), codespell, markdown-link-check, and the custom post-enumerating validator.

## Hugo Version

Pinned in `hugo_version.txt` (currently `0.147.8`). CI reads this file to install the exact version.
