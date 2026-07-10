import type { Recipe } from '../data/recipesTypes'

// Real food photos from LoremFlickr. Using a SINGLE well-chosen food keyword
// gives accurate, on-topic images — multiple comma keywords match "any" tag and
// often return unrelated photos. A per-recipe lock seed keeps the image stable
// and gives variety between recipes that share a keyword.

// Ordered from most specific dish names to broad ingredients; the first keyword
// found in the title wins.
const FOOD_KEYWORDS = [
  'biryani',
  'tacos',
  'taco',
  'pizza',
  'risotto',
  'lasagna',
  'cannelloni',
  'paella',
  'ramen',
  'sushi',
  'poke',
  'tiramisu',
  'cheesecake',
  'brownies',
  'brownie',
  'cupcakes',
  'cupcake',
  'pancakes',
  'waffles',
  'omelette',
  'frittata',
  'burrito',
  'quesadilla',
  'shawarma',
  'falafel',
  'schnitzel',
  'katsu',
  'satay',
  'tagine',
  'curry',
  'stew',
  'soup',
  'salad',
  'sandwich',
  'wrap',
  'burger',
  'sliders',
  'noodles',
  'spaghetti',
  'pasta',
  'dosa',
  'idli',
  'paratha',
  'appam',
  'payasam',
  'parotta',
  'pickle',
  'chips',
  'fries',
  'wings',
  'lollipop',
  'scramble',
  'toast',
  'muffins',
  'parfait',
  'smoothie',
  'ladoo',
  'jamun',
  'churros',
  'brulee',
  'mousse',
  'crumble',
  'shortcake',
  'cake',
  'cookies',
  'salmon',
  'tuna',
  'shrimp',
  'prawn',
  'prawns',
  'lobster',
  'mussels',
  'squid',
  'calamari',
  'cod',
  'tilapia',
  'fish',
  'chicken',
  'mutton',
  'beef',
  'pork',
  'lamb',
  'duck',
  'eggs',
  'egg',
  'tofu',
  'paneer',
  'chickpea',
  'chickpeas',
  'lentil',
  'dal',
  'beans',
  'mushroom',
  'potato',
  'cauliflower',
  'cabbage',
  'spinach',
  'avocado',
  'banana',
  'mango',
  'coconut',
  'rice',
  'bread',
  'oats',
  'pumpkin',
  'okra',
  'beetroot',
]

const CATEGORY_KEYWORD: Record<string, string> = {
  Chicken: 'chicken',
  Seafood: 'seafood',
  Vegetarian: 'vegetables',
  Beef: 'beef',
  Breakfast: 'breakfast',
  Dessert: 'dessert',
}

function hashSeed(id: string): number {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0
  }
  return hash % 100000
}

export function recipeKeyword(recipe: Recipe): string {
  const title = recipe.title.replace(/\(.*?\)/g, ' ').toLowerCase()
  for (const keyword of FOOD_KEYWORDS) {
    if (title.includes(keyword)) return keyword
  }
  return CATEGORY_KEYWORD[recipe.category] ?? 'food'
}

export function recipeImageUrl(recipe: Recipe): string {
  return `https://loremflickr.com/600/400/${recipeKeyword(recipe)}?lock=${hashSeed(recipe.id)}`
}
