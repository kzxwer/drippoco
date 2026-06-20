# Drippoco Blog

React app configured for GitHub Pages deployment.

## Local Development

```bash
npm install
npm start
```

## Build

```bash
npm run build
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
