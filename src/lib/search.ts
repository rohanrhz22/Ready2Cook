import type { Recipe } from '../data/recipesTypes'

// Lightweight fuzzy search: matches when every whitespace-separated term in the
// query is found in the recipe's searchable text either as a substring or as an
// in-order subsequence (so "chikn biry" still matches "Chicken Biryani").

function isSubsequence(needle: string, haystack: string): boolean {
  let index = 0
  for (const char of haystack) {
    if (char === needle[index]) index += 1
    if (index === needle.length) return true
  }
  return needle.length === 0
}

function searchableText(recipe: Recipe): string {
  return [
    recipe.title,
    recipe.description,
    recipe.cuisine,
    recipe.category,
    ...recipe.tags,
    ...recipe.ingredients.map((ingredient) => ingredient.name),
  ]
    .join(' ')
    .toLowerCase()
}

export function recipeMatchesQuery(recipe: Recipe, query: string): boolean {
  const trimmed = query.trim().toLowerCase()
  if (trimmed.length === 0) return true

  const haystack = searchableText(recipe)
  const terms = trimmed.split(/\s+/).filter(Boolean)

  return terms.every((term) => {
    if (haystack.includes(term)) return true
    // Only allow subsequence matching for terms long enough to be meaningful.
    return term.length >= 3 && isSubsequence(term, haystack)
  })
}

/** Builds a de-duplicated, sorted list of search suggestions from the catalog. */
export function buildSearchSuggestions(recipes: Recipe[]): string[] {
  const set = new Set<string>()
  for (const recipe of recipes) {
    set.add(recipe.title)
    set.add(recipe.cuisine)
    set.add(recipe.category)
    for (const ingredient of recipe.ingredients) set.add(ingredient.name)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}
