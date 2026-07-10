export type Ingredient = {
  name: string
  amount: number
  unit: string
}

export type Recipe = {
  id: string
  title: string
  description: string
  cuisine: string
  category: string
  collections?: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  prepMinutes: number
  cookMinutes: number
  servings: number
  taste?: number
  tags: string[]
  ingredients: Ingredient[]
  steps: string[]
  image?: string
}
