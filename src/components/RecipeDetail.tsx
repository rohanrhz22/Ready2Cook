import type { Recipe } from '../data/recipes'
import { cuisineEmoji, formatAmount } from '../lib/appConfig'

type RecipeDetailProps = {
  recipe: Recipe | null
  servings: number
  onDecreaseServings: () => void
  onIncreaseServings: () => void
  onStartCooking: () => void
}

export function RecipeDetail({
  recipe,
  servings,
  onDecreaseServings,
  onIncreaseServings,
  onStartCooking,
}: RecipeDetailProps) {
  if (!recipe) {
    return (
      <section className="recipe-detail">
        <p className="empty">Choose a recipe to view details.</p>
      </section>
    )
  }

  return (
    <section className="recipe-detail">
      <div className="detail-header">
        <div className="detail-title">
          <span className="detail-thumb" aria-hidden="true">
            {cuisineEmoji(recipe.cuisine)}
          </span>
          <div>
            <h2>{recipe.title}</h2>
            <p>{recipe.description}</p>
          </div>
        </div>
        <div className="detail-meta">
          <span>{recipe.cuisine}</span>
          <span>{recipe.prepMinutes}m prep</span>
          <span>{recipe.cookMinutes}m cook</span>
        </div>
      </div>

      <button type="button" className="cook-button" onClick={onStartCooking}>
        👩‍🍳 Start cooking mode
      </button>

      <div className="servings-row">
        <p>Servings</p>
        <div>
          <button type="button" onClick={onDecreaseServings}>
            -
          </button>
          <strong>{servings}</strong>
          <button type="button" onClick={onIncreaseServings}>
            +
          </button>
        </div>
      </div>

      <h3>Ingredients</h3>
      <ul className="ingredient-list">
        {recipe.ingredients.map((ingredient) => {
          const scaledAmount = (ingredient.amount / recipe.servings) * servings
          return (
            <li key={`${recipe.id}-${ingredient.name}-${ingredient.unit}`}>
              <span>{ingredient.name}</span>
              <span>
                {formatAmount(scaledAmount)} {ingredient.unit}
              </span>
            </li>
          )
        })}
      </ul>

      <h3>Steps</h3>
      <ol className="steps-list">
        {recipe.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  )
}