import {
  LEGACY_MEAL_PLAN_KEY,
  MEAL_DAYS,
  createEmptyMealPlan,
  type MealDay,
} from './appConfig'

export function parseStringArray(value: string | null, key: string): string[] {
  if (value === null) return []

  try {
    const parsed: unknown = JSON.parse(value)
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
      return parsed
    }
    console.error(`Invalid storage format for key ${key}`)
    return []
  } catch (error) {
    console.error(`Failed to parse storage key ${key}`, error)
    return []
  }
}

export function parseMealPlan(value: string | null): Record<MealDay, string[]> {
  const emptyPlan = createEmptyMealPlan()
  if (value === null) return emptyPlan

  try {
    const parsed: unknown = JSON.parse(value)
    if (!parsed || typeof parsed !== 'object') return emptyPlan

    const merged = { ...emptyPlan }
    for (const day of MEAL_DAYS) {
      const dayValue = (parsed as Record<string, unknown>)[day]
      merged[day] =
        Array.isArray(dayValue) && dayValue.every((item) => typeof item === 'string')
          ? dayValue
          : []
    }

    return merged
  } catch (error) {
    console.error('Failed to parse meal plan from storage', error)
    return emptyPlan
  }
}

export function readStoredStringArray(primaryKey: string, legacyKey: string): string[] {
  const primaryValue = localStorage.getItem(primaryKey)
  if (primaryValue !== null) {
    return parseStringArray(primaryValue, primaryKey)
  }

  return parseStringArray(localStorage.getItem(legacyKey), legacyKey)
}

export function readStoredMealPlan(primaryKey: string): Record<MealDay, string[]> {
  const primaryValue = localStorage.getItem(primaryKey)
  if (primaryValue !== null) {
    return parseMealPlan(primaryValue)
  }

  return parseMealPlan(localStorage.getItem(LEGACY_MEAL_PLAN_KEY))
}