import type { Recipe } from '../data/recipes'

export const APP_NAME = 'SpiceRoute'

export const FAVORITES_KEY = 'spice-route-favorites'
export const MEAL_PLAN_KEY = 'spice-route-meal-plan'
export const SHOPPING_CHECKED_KEY = 'spice-route-shopping-checked'

export const LEGACY_FAVORITES_KEY = 'chefverse-favorites'
export const LEGACY_MEAL_PLAN_KEY = 'chefverse-meal-plan'
export const LEGACY_SHOPPING_CHECKED_KEY = 'chefverse-shopping-checked'

export const MEAL_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export type MealDay = (typeof MEAL_DAYS)[number]

const CUISINE_EMOJI: Record<string, string> = {
  Kerala: '🥥',
  Italian: '🍝',
  Thai: '🌶️',
  Mexican: '🌮',
  Japanese: '🍣',
  'Middle Eastern': '🍳',
  Baking: '🍪',
}

const CATEGORY_EMOJI: Record<string, string> = {
  All: '🍲',
  Chicken: '🍗',
  Seafood: '🐟',
  Beef: '🥩',
  Vegetarian: '🥗',
  Breakfast: '🌅',
  Dessert: '🍰',
  'Insta Viral': '🔥',
  'Must Try': '⭐',
  'Easy & Tasty': '⚡',
  'Easily Available': '🛒',
  'Keeps Without Fridge': '🫙',
}

export const COLLECTIONS = [
  'Easy & Tasty',
  'Easily Available',
  'Keeps Without Fridge',
  'Insta Viral',
  'Must Try',
] as const

// Curated short lists so the filter dropdowns stay focused on the popular options
// instead of every value that appears in the data.
export const IMPORTANT_CUISINES = [
  'Kerala',
  'Indian',
  'Italian',
  'Chinese',
  'Thai',
  'Japanese',
  'Mexican',
  'American',
  'Middle Eastern',
  'Mediterranean',
] as const

export const IMPORTANT_TAGS = [
  'Vegetarian',
  'Vegan',
  'High Protein',
  'Gluten Free',
  'Spicy',
  'Comfort Food',
  '30 Minutes',
  'Meal Prep',
  'Kid Friendly',
  'Crispy',
  'Creamy',
  'Healthy',
] as const

const DIFFICULTY_RANK: Record<string, number> = { Easy: 0, Medium: 1, Hard: 2 }

export const SORT_OPTIONS = [
  { value: 'featured', label: '✨ Featured' },
  { value: 'pantry-match', label: '🧑\u200d🍳 Cook with what I have' },
  { value: 'easy-tasty', label: '⚡ Easy & Tasty' },
  { value: 'easy-first', label: '🟢 Easy → Tough' },
  { value: 'hard-first', label: '🔴 Tough → Easy' },
  { value: 'tastiest', label: '😋 Tastiest first' },
  { value: 'quickest', label: '⏱️ Quickest first' },
  { value: 'fewest-ingredients', label: '🧺 Fewest ingredients' },
] as const

export type SortOption = (typeof SORT_OPTIONS)[number]['value']

export function createEmptyMealPlan(): Record<MealDay, string[]> {
  return {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  }
}

export function formatAmount(amount: number): string {
  return String(Number(amount.toFixed(2)))
}

export function cuisineEmoji(cuisine: string): string {
  return CUISINE_EMOJI[cuisine] ?? '🍽️'
}

export function categoryEmoji(category: string): string {
  return CATEGORY_EMOJI[category] ?? '🍽️'
}

export function tasteScore(recipe: Pick<Recipe, 'taste' | 'collections'>): number {
  return recipe.taste ?? (recipe.collections?.length ? 4.5 : 4)
}

export function totalRecipeTime(recipe: Pick<Recipe, 'prepMinutes' | 'cookMinutes'>): number {
  return recipe.prepMinutes + recipe.cookMinutes
}

export function difficultyRank(recipe: Pick<Recipe, 'difficulty'>): number {
  return DIFFICULTY_RANK[recipe.difficulty] ?? 1
}