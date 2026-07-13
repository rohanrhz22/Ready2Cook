// Convert metric recipe amounts (g / ml / l) into approximate cook-friendly
// volume measures (cups, tbsp, tsp). Conversions are intentionally approximate —
// good enough for home cooking, not lab precision.

const ML_PER_CUP = 240
const ML_PER_TBSP = 15
const ML_PER_TSP = 5

// Approximate grams per cup for common dry ingredients, used to turn a weight
// into a volume. Falls back to treating 1 g as 1 ml when unknown.
const GRAMS_PER_CUP: { match: string; grams: number }[] = [
  { match: 'flour', grams: 120 },
  { match: 'sugar', grams: 200 },
  { match: 'rice', grams: 185 },
  { match: 'butter', grams: 227 },
  { match: 'coconut', grams: 85 },
  { match: 'oats', grams: 90 },
  { match: 'lentil', grams: 190 },
  { match: 'dal', grams: 190 },
  { match: 'chickpea', grams: 190 },
  { match: 'beans', grams: 180 },
  { match: 'cheese', grams: 110 },
  { match: 'paneer', grams: 120 },
]

// Units we leave untouched — they are already intuitive or count-based.
const PASSTHROUGH_UNITS = new Set([
  'pc',
  'pcs',
  'piece',
  'pinch',
  'sprig',
  'clove',
  'slice',
  'stalk',
  'cup',
  'tbsp',
  'tsp',
  'can',
  'cake',
])

function gramsPerCupFor(ingredientName: string): number | null {
  const name = ingredientName.toLowerCase()
  for (const { match, grams } of GRAMS_PER_CUP) {
    if (name.includes(match)) return grams
  }
  return null
}

function roundNice(value: number): number {
  // Round to the nearest 1/4 for readability.
  return Math.round(value * 4) / 4
}

function fromMilliliters(ml: number): { amount: number; unit: string } {
  if (ml >= ML_PER_CUP) return { amount: roundNice(ml / ML_PER_CUP), unit: 'cup' }
  if (ml >= ML_PER_TBSP) return { amount: roundNice(ml / ML_PER_TBSP), unit: 'tbsp' }
  return { amount: roundNice(ml / ML_PER_TSP), unit: 'tsp' }
}

/**
 * Converts a metric amount to an imperial/volume measure. Non-metric or
 * count-based units are returned unchanged.
 */
export function toImperial(
  amount: number,
  unit: string,
  ingredientName: string,
): { amount: number; unit: string } {
  const normalizedUnit = unit.toLowerCase()

  if (PASSTHROUGH_UNITS.has(normalizedUnit)) return { amount, unit }

  if (normalizedUnit === 'l') return fromMilliliters(amount * 1000)
  if (normalizedUnit === 'ml') return fromMilliliters(amount)

  if (normalizedUnit === 'kg') return fromGrams(amount * 1000, ingredientName)
  if (normalizedUnit === 'g') return fromGrams(amount, ingredientName)

  return { amount, unit }
}

function fromGrams(grams: number, ingredientName: string): { amount: number; unit: string } {
  const perCup = gramsPerCupFor(ingredientName)
  // Without a known density, approximate 1 g ≈ 1 ml (works for watery items).
  const ml = perCup ? (grams / perCup) * ML_PER_CUP : grams
  return fromMilliliters(ml)
}
