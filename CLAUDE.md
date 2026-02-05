# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Element Plus Vite Starter** - a Vue 3 starter template demonstrating on-demand Element Plus component importing with Vite. It uses vite-ssg for static site generation.

- **Framework**: Vue 3 with TypeScript
- **UI Library**: Element Plus (with custom theming)
- **Build Tool**: Vite 7.x
- **Package Manager**: pnpm (v10.14.0)

## Common Commands

```bash
# Install dependencies
pnpm install

# Development server
npm run dev

# Production build
npm run build

# Static site generation (vite-ssg)
npm run generate

# Preview production build
npm run preview

# Type checking (vue-tsc)
npm run typecheck

# Linting (ESLint with @antfu/eslint-config)
npm run lint
```

## Architecture

### File-Based Routing
Routes are auto-generated from files in `src/pages/` using `unplugin-vue-router`. The router types are auto-generated to `src/typed-router.d.ts`.

- `src/pages/index.vue` → `/`
- `src/pages/nav/1.vue` → `/nav/1`
- `src/pages/nav/1/item-1.vue` → `/nav/1/item-1`

### Component Auto-Importing
Components are auto-imported using `unplugin-vue-components` with the Element Plus resolver. Component types are auto-generated to `src/components.d.ts`.

- Components in `src/components/` are auto-imported
- Element Plus components are auto-imported on-demand with Sass styles

### Path Aliases
- `~/` maps to `src/`

### Styling Architecture

**UnoCSS**: Atomic CSS engine configured in `uno.config.ts` with shortcuts like `btn` and `icon-btn`.

**Element Plus Theming**: Custom theme variables are defined in `src/styles/element/index.scss`:
- Uses Sass map `$--colors` for color overrides (primary is set to `green`)
- Namespace is set to `ep` instead of default `el`
- Custom SCSS variables are injected via Vite's `additionalData` option
- Dark theme variables in `src/styles/element/dark.scss`

**Global Styles**: Entry point is `src/styles/index.scss`.

### Vite SSG (Server-Side Generation)
The app uses `vite-ssg` for static site generation. The entry point is `src/main.ts` which exports a `createApp` function.

Modules under `src/modules/*.ts` are auto-installed during app initialization via `import.meta.glob`.

### Manual Style Imports for Dynamic Components
Element Plus components loaded dynamically (like `ElMessage`, `ElMessageBox`) require manual SCSS imports in `src/main.ts`:
```typescript
import 'element-plus/theme-chalk/src/message.scss'
import 'element-plus/theme-chalk/src/message-box.scss'
import 'element-plus/theme-chalk/src/overlay.scss'
```

## Important Configuration Files

- `vite.config.ts` - Vite configuration with Vue, Vue Router, Components, and UnoCSS plugins
- `uno.config.ts` - UnoCSS atomic CSS configuration
- `eslint.config.js` - ESLint using @antfu/eslint-config with formatters, UnoCSS, and Vue support
- `tsconfig.json` - TypeScript configuration
- `.npmrc` - pnpm configuration with `shamefully-hoist=true`

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `ci.yml` - Runs type checking on push to main
- `gh-pages.yml` - Builds and deploys to GitHub Pages on push to main
