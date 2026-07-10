import type { Recipe } from '../data/recipesTypes'

// Builds a real food photo URL for a recipe using LoremFlickr (real Creative
// Commons Flickr photos, keyword-based, no API key). The `lock` seed keeps the
// same photo for a given recipe so it doesn't change on every render.

const STOP_WORDS = new Set([
  'with',
  'and',
  'the',
  'in',
  'a',
  'an',
  'of',
  'on',
  'for',
  'style',
  'easy',
  'quick',
  'homemade',
  'classic',
  'simple',
  'fresh',
  'no',
  'bake',
  'baked',
  'one',
  'pan',
  'pot',
  'dry',
  'crispy',
  'creamy',
  'spicy',
  'sweet',
  'ingredient',
  'ingredients',
  'minute',
  'minutes',
])

function hashSeed(id: string): number {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0
  }
  return hash % 100000
}

export function recipeKeywords(recipe: Recipe): string {
  const words = recipe.title
    .replace(/\(.*?\)/g, ' ')
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 3)

  if (words.length === 0) {
    words.push(recipe.category.toLowerCase())
  }
  // For obscure single-word dishes, add a food hint so the photo stays food-related.
  if (words.length < 2) {
    words.push('food')
  }

  return words.join(',')
}

export function recipeImageUrl(recipe: Recipe): string {
  return `https://loremflickr.com/600/400/${recipeKeywords(recipe)}?lock=${hashSeed(recipe.id)}`
}
