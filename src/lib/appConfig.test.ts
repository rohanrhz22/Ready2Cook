import { describe, expect, it } from 'vitest'
import {
  createEmptyMealPlan,
  difficultyRank,
  formatAmount,
  tasteScore,
  totalRecipeTime,
} from './appConfig'

describe('formatAmount', () => {
  it('keeps whole numbers clean', () => {
    expect(formatAmount(4)).toBe('4')
  })

  it('rounds to two decimals', () => {
    expect(formatAmount(1.333333)).toBe('1.33')
  })

  it('strips trailing zeros', () => {
    expect(formatAmount(2.5)).toBe('2.5')
  })
})

describe('tasteScore', () => {
  it('uses explicit taste when present', () => {
    expect(tasteScore({ taste: 4.8, collections: [] })).toBe(4.8)
  })

  it('rewards recipes that belong to collections', () => {
    expect(tasteScore({ collections: ['Must Try'] })).toBe(4.5)
  })

  it('falls back to a base score', () => {
    expect(tasteScore({})).toBe(4)
  })
})

describe('difficultyRank', () => {
  it('ranks known difficulties', () => {
    expect(difficultyRank({ difficulty: 'Easy' })).toBe(0)
    expect(difficultyRank({ difficulty: 'Medium' })).toBe(1)
    expect(difficultyRank({ difficulty: 'Hard' })).toBe(2)
  })
})

describe('totalRecipeTime', () => {
  it('adds prep and cook minutes', () => {
    expect(totalRecipeTime({ prepMinutes: 10, cookMinutes: 25 })).toBe(35)
  })
})

describe('createEmptyMealPlan', () => {
  it('creates seven empty days', () => {
    const plan = createEmptyMealPlan()
    expect(Object.keys(plan)).toHaveLength(7)
    expect(Object.values(plan).every((meals) => meals.length === 0)).toBe(true)
  })
})
