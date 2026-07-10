import type { Recipe } from './recipesTypes'

function isRecipe(value: unknown): value is Recipe {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    typeof record.title === 'string' &&
    Array.isArray(record.ingredients) &&
    Array.isArray(record.steps)
  )
}

export async function loadRecipes(signal?: AbortSignal): Promise<Recipe[]> {
  const response = await fetch(`${import.meta.env.BASE_URL}recipes.json`, { signal })
  if (!response.ok) {
    throw new Error(`Failed to load recipes: ${response.status}`)
  }

  const data: unknown = await response.json()
  if (!Array.isArray(data)) {
    throw new Error('Recipe data is not an array')
  }

  return data.filter(isRecipe)
}
