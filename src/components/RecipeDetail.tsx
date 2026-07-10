import type { Recipe } from '../data/recipesTypes'
import { formatAmount } from '../lib/appConfig'
import { estimateNutrition, healthInsights } from '../lib/nutrition'
import { describeStep } from '../lib/steps'
import { RecipeCover } from './RecipeCover'

type RecipeDetailProps = {
  recipe: Recipe | null
  servings: number
  onDecreaseServings: () => void
  onIncreaseServings: () => void
  onStartCooking: () => void
  onShare: () => void
}

export function RecipeDetail({
  recipe,
  servings,
  onDecreaseServings,
  onIncreaseServings,
  onStartCooking,
  onShare,
}: RecipeDetailProps) {
  if (!recipe) {
    return (
      <section className="recipe-detail">
        <p className="empty">Choose a recipe to view details.</p>
      </section>
    )
  }

  const nutrition = estimateNutrition(recipe)
  const insights = healthInsights(recipe)

  return (
    <section className="recipe-detail">
      <RecipeCover recipe={recipe} className="detail-cover" />

      <div className="detail-header">
        <div className="detail-title">
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

      <div className="detail-actions">
        <button type="button" className="cook-button" onClick={onStartCooking}>
          👩‍🍳 Start cooking mode
        </button>
        <button type="button" className="share-button" onClick={onShare}>
          🔗 Share
        </button>
      </div>

      <div className="nutrition-panel">
        <div className="nutrition-stat">
          <strong>{nutrition.calories}</strong>
          <span>kcal</span>
        </div>
        <div className="nutrition-stat">
          <strong>{nutrition.protein} g</strong>
          <span>protein</span>
        </div>
        <div className="nutrition-stat">
          <strong>{nutrition.carbs} g</strong>
          <span>carbs</span>
        </div>
        <div className="nutrition-stat">
          <strong>{nutrition.fat} g</strong>
          <span>fat</span>
        </div>
        <div className="nutrition-stat">
          <strong>{nutrition.sodium} mg</strong>
          <span>sodium</span>
        </div>
      </div>
      <p className="nutrition-note">Estimated per serving · based on ingredients.</p>

      {(insights.benefits.length > 0 || insights.cautions.length > 0) && (
        <div className="health-panel">
          {insights.benefits.length > 0 && (
            <div className="health-column benefits">
              <h4>🟢 Benefits</h4>
              <ul>
                {insights.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {insights.cautions.length > 0 && (
            <div className="health-column cautions">
              <h4>🟠 Eat mindfully</h4>
              <ul>
                {insights.cautions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="health-disclaimer">
            Informational estimates only — not medical advice. Consult a professional for
            conditions like high cholesterol, blood pressure, or fatty liver.
          </p>
        </div>
      )}

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
        {recipe.steps.map((step) => {
          const detail = describeStep(step)
          return (
            <li key={step}>
              {(detail.method || detail.time) && (
                <div className="step-meta">
                  {detail.method && (
                    <span className="step-method">
                      {detail.methodIcon} {detail.method}
                    </span>
                  )}
                  {detail.time && <span className="step-time">⏱ {detail.time}</span>}
                </div>
              )}
              <p className="step-text">{detail.text}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}