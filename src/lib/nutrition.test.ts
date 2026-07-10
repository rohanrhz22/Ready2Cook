import { describe, expect, it } from 'vitest'
import type { Recipe } from '../data/recipesTypes'
import { estimateNutrition, healthInsights, ingredientAisle } from './nutrition'

function makeRecipe(overrides: Partial<Recipe>): Recipe {
  return {
    id: 'test',
    title: 'Test',
    description: '',
    cuisine: 'Kerala',
    category: 'Vegetarian',
    difficulty: 'Easy',
    prepMinutes: 5,
    cookMinutes: 5,
    servings: 2,
    tags: [],
    ingredients: [],
    steps: [],
    ...overrides,
  }
}

describe('ingredientAisle', () => {
  it('routes proteins to Meat & Seafood', () => {
    expect(ingredientAisle('chicken thighs')).toBe('Meat & Seafood')
    expect(ingredientAisle('salmon fillet')).toBe('Meat & Seafood')
  })

  it('routes dairy correctly', () => {
    expect(ingredientAisle('paneer')).toBe('Dairy & Eggs')
    expect(ingredientAisle('eggs')).toBe('Dairy & Eggs')
  })

  it('routes produce correctly', () => {
    expect(ingredientAisle('red onion')).toBe('Produce')
    expect(ingredientAisle('curry leaves')).toBe('Produce')
  })

  it('falls back to Other', () => {
    expect(ingredientAisle('mystery item')).toBe('Other')
  })
})

describe('estimateNutrition', () => {
  it('returns per-serving values that scale with servings', () => {
    const single = makeRecipe({
      servings: 1,
      ingredients: [{ name: 'chicken breast', amount: 200, unit: 'g' }],
    })
    const double = makeRecipe({
      servings: 2,
      ingredients: [{ name: 'chicken breast', amount: 200, unit: 'g' }],
    })
    expect(single.servings).toBe(1)
    expect(estimateNutrition(single).calories).toBeGreaterThan(estimateNutrition(double).calories)
  })

  it('estimates protein for a protein-rich recipe', () => {
    const recipe = makeRecipe({
      servings: 1,
      ingredients: [{ name: 'chicken breast', amount: 300, unit: 'g' }],
    })
    expect(estimateNutrition(recipe).protein).toBeGreaterThan(0)
  })
})

describe('healthInsights', () => {
  it('flags saturated fat cautions for creamy/fried dishes', () => {
    const recipe = makeRecipe({
      tags: ['Crispy'],
      ingredients: [
        { name: 'butter', amount: 60, unit: 'g' },
        { name: 'frying oil', amount: 500, unit: 'ml' },
      ],
    })
    const insights = healthInsights(recipe)
    expect(insights.cautions.some((line) => line.toLowerCase().includes('saturated fat'))).toBe(true)
  })

  it('credits omega-3 benefits for fish', () => {
    const recipe = makeRecipe({
      ingredients: [{ name: 'salmon fillet', amount: 300, unit: 'g' }],
    })
    const insights = healthInsights(recipe)
    expect(insights.benefits.some((line) => line.toLowerCase().includes('omega-3'))).toBe(true)
  })
})
