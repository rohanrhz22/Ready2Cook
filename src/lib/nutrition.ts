import type { Ingredient, Recipe } from '../data/recipesTypes'

// ---------------------------------------------------------------------------
// Estimation engine. These figures are heuristic approximations derived from
// ingredient keywords and rough unit-to-gram conversions. They are meant for
// quick guidance, not precise dietary tracking or medical use.
// ---------------------------------------------------------------------------

export type Nutrition = {
  calories: number
  protein: number
  carbs: number
  fat: number
  sodium: number
}

export type HealthInsights = {
  benefits: string[]
  cautions: string[]
}

type Profile = {
  kcalPerGram: number
  protein: number
  carbs: number
  fat: number
  sodiumPerGram: number
}

const UNIT_GRAMS: Record<string, number> = {
  g: 1,
  ml: 1,
  tbsp: 15,
  tsp: 5,
  pc: 50,
  slice: 30,
  sprig: 2,
  pinch: 1,
  cup: 200,
}

function unitToGrams(ingredient: Ingredient): number {
  const perUnit = UNIT_GRAMS[ingredient.unit] ?? 30
  return ingredient.amount * perUnit
}

// Ordered keyword rules — the first match wins, so list specifics before generics.
const PROFILE_RULES: { match: string[]; profile: Profile }[] = [
  { match: ['oil', 'butter', 'ghee'], profile: { kcalPerGram: 8.8, protein: 0, carbs: 0, fat: 1, sodiumPerGram: 0 } },
  { match: ['almond', 'sesame', 'chia', 'peanut', 'cashew', 'nuts'], profile: { kcalPerGram: 6, protein: 0.15, carbs: 0.15, fat: 0.7, sodiumPerGram: 0 } },
  { match: ['chocolate', 'cocoa'], profile: { kcalPerGram: 5.4, protein: 0.05, carbs: 0.5, fat: 0.45, sodiumPerGram: 0.1 } },
  { match: ['heavy cream', 'mascarpone'], profile: { kcalPerGram: 3.4, protein: 0.05, carbs: 0.05, fat: 0.9, sodiumPerGram: 0.3 } },
  { match: ['cheese', 'paneer', 'feta', 'mozzarella', 'parmesan', 'ricotta', 'halloumi'], profile: { kcalPerGram: 3.5, protein: 0.25, carbs: 0.03, fat: 0.72, sodiumPerGram: 6 } },
  { match: ['coconut milk', 'cream'], profile: { kcalPerGram: 2.3, protein: 0.05, carbs: 0.15, fat: 0.8, sodiumPerGram: 0.2 } },
  { match: ['coconut'], profile: { kcalPerGram: 3.5, protein: 0.05, carbs: 0.25, fat: 0.7, sodiumPerGram: 0.2 } },
  { match: ['sugar', 'honey', 'syrup', 'jaggery', 'glaze'], profile: { kcalPerGram: 3.3, protein: 0, carbs: 1, fat: 0, sodiumPerGram: 0.1 } },
  { match: ['flour', 'rice', 'pasta', 'oats', 'bread', 'noodle', 'tortilla', 'bun', 'brioche', 'semolina', 'quinoa', 'bulgur', 'dough', 'biscuit', 'granola', 'muffin'], profile: { kcalPerGram: 3.5, protein: 0.12, carbs: 0.85, fat: 0.03, sodiumPerGram: 0.5 } },
  { match: ['bacon', 'ham', 'sausage'], profile: { kcalPerGram: 3, protein: 0.4, carbs: 0.02, fat: 0.58, sodiumPerGram: 12 } },
  { match: ['chicken', 'beef', 'pork', 'mutton', 'lamb', 'turkey'], profile: { kcalPerGram: 2, protein: 0.55, carbs: 0, fat: 0.45, sodiumPerGram: 0.7 } },
  { match: ['salmon', 'tuna', 'fish', 'cod', 'tilapia', 'shrimp', 'prawn', 'squid', 'mussel', 'lobster', 'seafood', 'calamari', 'kingfish'], profile: { kcalPerGram: 1.4, protein: 0.65, carbs: 0, fat: 0.35, sodiumPerGram: 0.9 } },
  { match: ['egg'], profile: { kcalPerGram: 1.5, protein: 0.35, carbs: 0.02, fat: 0.63, sodiumPerGram: 1.4 } },
  { match: ['tofu', 'beans', 'chickpea', 'lentil', 'dal', 'kadala'], profile: { kcalPerGram: 1.4, protein: 0.3, carbs: 0.5, fat: 0.2, sodiumPerGram: 0.5 } },
  { match: ['yogurt', 'curd', 'milk', 'buttermilk'], profile: { kcalPerGram: 0.7, protein: 0.3, carbs: 0.4, fat: 0.3, sodiumPerGram: 0.5 } },
  { match: ['soy sauce', 'fish sauce', 'miso', 'gochujang', 'oyster sauce'], profile: { kcalPerGram: 1, protein: 0.1, carbs: 0.6, fat: 0, sodiumPerGram: 55 } },
  { match: ['salt'], profile: { kcalPerGram: 0, protein: 0, carbs: 0, fat: 0, sodiumPerGram: 390 } },
  { match: ['sauce', 'ketchup', 'mayonnaise', 'dressing', 'paste', 'stock', 'seasoning', 'masala', 'powder'], profile: { kcalPerGram: 1.2, protein: 0.05, carbs: 0.4, fat: 0.2, sodiumPerGram: 12 } },
]

const VEGETABLE_PROFILE: Profile = { kcalPerGram: 0.4, protein: 0.2, carbs: 0.75, fat: 0.05, sodiumPerGram: 0.2 }

function profileFor(name: string): Profile {
  const lowered = name.toLowerCase()
  for (const rule of PROFILE_RULES) {
    if (rule.match.some((keyword) => lowered.includes(keyword))) {
      return rule.profile
    }
  }
  return VEGETABLE_PROFILE
}

export function estimateNutrition(recipe: Recipe): Nutrition {
  let calories = 0
  let proteinCal = 0
  let carbsCal = 0
  let fatCal = 0
  let sodium = 0

  for (const ingredient of recipe.ingredients) {
    const grams = unitToGrams(ingredient)
    const profile = profileFor(ingredient.name)
    const kcal = grams * profile.kcalPerGram

    calories += kcal
    proteinCal += kcal * profile.protein
    carbsCal += kcal * profile.carbs
    fatCal += kcal * profile.fat
    sodium += grams * profile.sodiumPerGram
  }

  const servings = Math.max(1, recipe.servings)
  return {
    calories: Math.round(calories / servings),
    protein: Math.round(proteinCal / 4 / servings),
    carbs: Math.round(carbsCal / 4 / servings),
    fat: Math.round(fatCal / 9 / servings),
    sodium: Math.round(sodium / servings),
  }
}

function hasIngredient(recipe: Recipe, keywords: string[]): boolean {
  return recipe.ingredients.some((ingredient) => {
    const lowered = ingredient.name.toLowerCase()
    return keywords.some((keyword) => lowered.includes(keyword))
  })
}

function isFried(recipe: Recipe): boolean {
  const text = `${recipe.title} ${recipe.tags.join(' ')}`.toLowerCase()
  return (
    hasIngredient(recipe, ['frying oil']) ||
    text.includes('fried') ||
    text.includes('crispy') ||
    text.includes('deep')
  )
}

export function healthInsights(recipe: Recipe): HealthInsights {
  const nutrition = estimateNutrition(recipe)
  const benefits: string[] = []
  const cautions: string[] = []

  // Benefits
  if (hasIngredient(recipe, ['salmon', 'tuna', 'fish', 'cod', 'kingfish'])) {
    benefits.push('Omega-3 rich fish supports heart health and healthy cholesterol.')
  }
  if (hasIngredient(recipe, ['spinach', 'vegetable', 'cabbage', 'broccoli', 'greens', 'cauliflower', 'beans', 'chickpea', 'lentil', 'oats'])) {
    benefits.push('Fiber from vegetables and legumes aids digestion and heart health.')
  }
  if (hasIngredient(recipe, ['turmeric', 'ginger', 'garlic'])) {
    benefits.push('Turmeric, ginger, and garlic add anti-inflammatory compounds.')
  }
  if (nutrition.protein >= 25) {
    benefits.push(`High protein (~${nutrition.protein} g/serving) supports muscle and satiety.`)
  }
  if (nutrition.calories > 0 && nutrition.calories <= 350 && !isFried(recipe)) {
    benefits.push('Light on calories — friendly for weight management.')
  }

  // Cautions
  if (hasIngredient(recipe, ['butter', 'ghee', 'cream', 'cheese', 'coconut oil', 'coconut milk']) || isFried(recipe)) {
    cautions.push('High in saturated fat — go easy if managing cholesterol or fatty liver.')
  }
  if (nutrition.sodium >= 700) {
    cautions.push(`High estimated sodium (~${nutrition.sodium} mg/serving) — watch if managing blood pressure.`)
  }
  if (isFried(recipe)) {
    cautions.push('Deep-fried — occasional treat; frequent frying strains the liver and waistline.')
  }
  if (recipe.category === 'Dessert' || hasIngredient(recipe, ['sugar', 'honey', 'syrup', 'chocolate'])) {
    cautions.push('Added sugars — enjoy in moderation to steady blood sugar.')
  }
  if (nutrition.calories >= 650) {
    cautions.push(`Calorie-dense (~${nutrition.calories} kcal/serving) — mind the portion size.`)
  }

  return { benefits, cautions }
}

// ---------------------------------------------------------------------------
// Shopping aisles
// ---------------------------------------------------------------------------

export const AISLE_ORDER = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Eggs',
  'Bakery & Grains',
  'Pantry & Canned',
  'Spices & Seasoning',
  'Condiments & Oils',
  'Other',
] as const

export type Aisle = (typeof AISLE_ORDER)[number]

const AISLE_RULES: { aisle: Aisle; match: string[] }[] = [
  { aisle: 'Meat & Seafood', match: ['chicken', 'beef', 'pork', 'mutton', 'lamb', 'turkey', 'bacon', 'ham', 'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'shrimp', 'prawn', 'squid', 'mussel', 'lobster', 'seafood', 'calamari', 'kingfish'] },
  { aisle: 'Dairy & Eggs', match: ['milk', 'butter', 'cheese', 'paneer', 'cream', 'yogurt', 'curd', 'ghee', 'egg', 'feta', 'mozzarella', 'parmesan', 'ricotta', 'mascarpone', 'buttermilk', 'halloumi'] },
  { aisle: 'Bakery & Grains', match: ['flour', 'rice', 'bread', 'pasta', 'noodle', 'oats', 'tortilla', 'bun', 'brioche', 'muffin', 'semolina', 'quinoa', 'bulgur', 'dough', 'ladyfinger', 'biscuit', 'fettuccine', 'penne', 'linguine', 'lasagna', 'cannelloni', 'idli', 'dosa', 'puttu', 'granola', 'english muffin', 'sourdough'] },
  { aisle: 'Spices & Seasoning', match: ['powder', 'masala', 'cumin', 'turmeric', 'pepper', 'paprika', 'seasoning', 'saffron', 'cardamom', 'cinnamon', 'fennel', 'fenugreek', 'mustard seeds', 'salt', 'garam', 'chili flakes', 'cayenne', 'oregano', 'thyme', 'coriander powder', 'yeast', 'baking powder'] },
  { aisle: 'Condiments & Oils', match: ['oil', 'sauce', 'soy', 'vinegar', 'honey', 'syrup', 'miso', 'tahini', 'paste', 'mayonnaise', 'ketchup', 'gochujang', 'wine', 'stock', 'sriracha', 'glaze', 'mirin', 'dressing', 'beer', 'espresso'] },
  { aisle: 'Pantry & Canned', match: ['beans', 'chickpea', 'lentil', 'dal', 'canned', 'tomato puree', 'crushed tomatoes', 'tomato sauce', 'marinara', 'coconut milk', 'sugar', 'chocolate', 'cocoa', 'nuts', 'almond', 'sesame', 'chia', 'kokum', 'tamarind', 'saffron', 'vanilla'] },
  { aisle: 'Produce', match: ['onion', 'tomato', 'garlic', 'ginger', 'chili', 'chilies', 'pepper', 'spinach', 'cabbage', 'potato', 'lemon', 'lime', 'avocado', 'herb', 'basil', 'coriander', 'parsley', 'mint', 'mushroom', 'carrot', 'celery', 'cucumber', 'banana', 'berry', 'berries', 'vegetable', 'greens', 'zucchini', 'cauliflower', 'curry leaves', 'shallot', 'broccoli', 'bok choy', 'lettuce', 'romaine', 'cilantro', 'coconut', 'sweet potato', 'chives', 'spring onion', 'bell pepper'] },
]

export function ingredientAisle(name: string): Aisle {
  const lowered = name.toLowerCase()
  for (const rule of AISLE_RULES) {
    if (rule.match.some((keyword) => lowered.includes(keyword))) {
      return rule.aisle
    }
  }
  return 'Other'
}
