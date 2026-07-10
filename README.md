# SpiceRoute

SpiceRoute is a recipe discovery and weekly meal-planning app focused on Kerala dishes and globally inspired home cooking.

Live site: https://rohanrhz22.github.io/Ready2Cook/

## Features

- Browse curated recipes by cuisine, category, collection, and tag.
- "Cook with what I have" — rank recipes by pantry match and see what's missing.
- Recently viewed strip and drag-and-drop planning onto any day.
- Scale ingredients by servings.
- Estimated nutrition per serving plus health benefits and cautions (cholesterol, blood pressure, fatty liver) — informational only, not medical advice.
- Weekly meal planner with a shopping list grouped by store aisle.
- Recipe cover images (with themed fallbacks) and shareable recipe URLs.
- Dark mode, toast notifications, and a full-screen cooking mode with a timer.
- Print the shopping list, and export/import your meal plan as JSON.
- Installable PWA with offline support.

## Data

Recipes live in `src/data/recipes.ts` and are compiled to `public/recipes.json`
by `scripts/generate-recipes.mjs` (runs automatically on `prebuild`). The app
fetches that JSON at runtime, keeping the initial bundle small.

## Project structure

- `src/components`: presentational UI sections.
- `src/data`: recipe types, source data, and the runtime loader.
- `src/lib`: shared config, helpers, storage, theme, toasts, and the nutrition engine.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run generate:recipes
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`,
which runs the tests, builds the app, and publishes to GitHub Pages.
