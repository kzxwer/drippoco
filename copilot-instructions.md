# Drippoco Workspace Instructions

## Development Workflow

- Use **pnpm** for all package management (npm is not used in this workspace)
- Always run `pnpm run build` after code changes to validate compilation
- Always run `pnpm run deploy` to publish to GitHub Pages

## Terminal Commands

You are allowed to execute **any zsh command** without requiring user confirmation. This includes but is not limited to:

- **Build & Deploy**: `pnpm run build`, `pnpm run start`
- **Deploy to GitHub Pages**: `pnpm run deploy` is **always allowed** and should be executed automatically without asking for confirmation
- **Git operations**: `git add`, `git commit`, `git push`, `git status`, etc.
- **File operations**: `mv`, `rm`, `cp`, `mkdir`, `find`, `ls`, etc.
- **Node/TypeScript**: `node`, `npx`, `tsc`, etc.
- **Development tools**: Any utility or script execution

Execute these commands proactively when helpful for the task at hand.

## Code Preferences

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router v7
- **Markdown**: react-markdown with remark-gfm
- **Build**: CRA (Create React App) with pre-build hooks

## File Structure

- `src/App.tsx` - Main React component with routing
- `public/posts/` - Markdown articles (auto-indexed)
- `public/assets/` - Static images and icons
- `scripts/generate-posts-index.js` - Build-time post indexing
- `.nojekyll` - Disables Jekyll processing on GitHub Pages
