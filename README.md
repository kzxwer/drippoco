# Drippoco Blog

React + Tailwind markdown blog configured for GitHub Pages deployment.

## Content Model (No DB)

- Published articles are markdown files under `public/posts/**`.
- `/create-article` is an editor page with live markdown preview.
- Draft `Edit/Delete` is stored only in browser `localStorage`.
- There is no written date field.

## Local Development

```bash
npm install
npm start
```

Or with pnpm:

```bash
pnpm install
pnpm start
```

## Build

```bash
npm run build
```

Or with pnpm:

```bash
pnpm run build
```

Build/start automatically generates `public/posts/index.json` from files in `public/posts/**`.

## Write and Publish Flow

1. Open `/create-article`.
2. Write markdown and check live preview.
3. Save drafts locally if needed (edit/delete supported on that page).
4. Click `Download article file`.
5. Move downloaded `.md` file into `public/posts/[any-path]/`.
6. Deploy.
7. The file appears as a new article on `/`.

### Markdown File Format

```md
---
title: Your title
summary: Short summary
tags: tag1, tag2
cover: https://example.com/image.jpg
---

# Article heading

Your markdown body...
```

## Deploy to GitHub Pages

This repository is configured in two ways:

1. Automatic deploy with GitHub Actions on push to `main`.
2. Manual deploy with `npm run deploy` (uses `gh-pages`).

### One-time GitHub setup

1. Open repository settings in GitHub.
2. Go to `Settings > Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.

### Automatic deployment flow

1. Commit changes.
2. Push to `main`.
3. Wait for the `Deploy to GitHub Pages` workflow to finish in `Actions`.
4. Open: `https://kzxwer.github.io/drippoco/`

### Manual deployment flow

```bash
npm run deploy
```

Manual deployment publishes the `build/` folder to the `gh-pages` branch.

With pnpm, run script form (not `pnpm deploy`):

```bash
pnpm run deploy
```
