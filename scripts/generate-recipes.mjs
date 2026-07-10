// Generates public/recipes.json from the TypeScript recipe source so the app can
// fetch the catalog at runtime instead of bundling it into the main JS chunk.
// Run with: node scripts/generate-recipes.mjs (Node >= 22.6 strips TS types).
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const source = new URL('../src/data/recipes.ts', import.meta.url).href
const module = await import(source)

if (!Array.isArray(module.recipes)) {
  throw new Error('Expected a `recipes` array export from src/data/recipes.ts')
}

const outputPath = fileURLToPath(new URL('../public/recipes.json', import.meta.url))
writeFileSync(outputPath, JSON.stringify(module.recipes))
console.log(`Wrote ${module.recipes.length} recipes to public/recipes.json`)
