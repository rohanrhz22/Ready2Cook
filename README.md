# SpiceRoute

SpiceRoute is a recipe discovery and weekly meal-planning app focused on Kerala dishes and globally inspired home cooking.

Live site: https://rohanrhz22.github.io/Ready2Cook/

## Features

- Browse curated recipes by cuisine, category, collection, and tag.
- Filter by pantry ingredients and save favorites locally.
- Scale ingredients by servings.
- Build a weekly meal plan and generate a shopping list automatically.
- Dark mode with system preference detection.
- Toast notifications for planner and favorite actions.
- Full-screen cooking mode with step navigation and a built-in timer.
- Print the shopping list, and export/import your meal plan as JSON.
- Installable PWA with offline support.

## Project structure

- `src/components`: presentational UI sections.
- `src/data`: recipe data and types.
- `src/lib`: shared config, helpers, local-storage parsing, theme, and toasts.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
```

## Deployment

Pushing to `main` triggers the GitHub Actions workflow in `.github/workflows/deploy.yml`,
which runs the tests, builds the app, and publishes to GitHub Pages.
