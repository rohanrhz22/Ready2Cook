// Per-recipe user ratings and personal cooking notes, persisted to localStorage.

export type RecipeReview = {
  rating: number // 0 = unrated, 1..5 stars
  note: string
}

const REVIEWS_KEY = 'spice-route-reviews'

const EMPTY_REVIEW: RecipeReview = { rating: 0, note: '' }

function isReview(value: unknown): value is RecipeReview {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.rating === 'number' && typeof record.note === 'string'
}

export function readReviews(): Record<string, RecipeReview> {
  const raw = localStorage.getItem(REVIEWS_KEY)
  if (raw === null) return {}

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    const result: Record<string, RecipeReview> = {}
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (isReview(value)) result[id] = value
    }
    return result
  } catch (error) {
    console.error('Failed to parse recipe reviews from storage', error)
    return {}
  }
}

export function readReview(recipeId: string): RecipeReview {
  return readReviews()[recipeId] ?? { ...EMPTY_REVIEW }
}

export function writeReview(recipeId: string, review: RecipeReview): void {
  const all = readReviews()
  if (review.rating === 0 && review.note.trim() === '') {
    delete all[recipeId]
  } else {
    all[recipeId] = { rating: review.rating, note: review.note }
  }
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all))
}

export function writeReviews(all: Record<string, RecipeReview>): void {
  localStorage.setItem(REVIEWS_KEY, JSON.stringify(all))
}
