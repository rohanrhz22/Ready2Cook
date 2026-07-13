import { useEffect, useState } from 'react'
import type { Recipe } from '../data/recipesTypes'
import { formatAmount } from '../lib/appConfig'
import { formatCookedDate, markCooked, readCooked, type CookedEntry } from '../lib/cooked'
import { estimateNutrition, healthInsights } from '../lib/nutrition'
import { readReview, writeReview } from '../lib/reviews'
import { describeStep } from '../lib/steps'
import { findSubstitution } from '../lib/substitutions'
import { translateToMalayalam } from '../lib/translate'
import { toImperial } from '../lib/units'
import { RecipeCover } from './RecipeCover'

type UnitSystem = 'metric' | 'imperial'

type RecipeDetailProps = {
  recipe: Recipe | null
  servings: number
  onDecreaseServings: () => void
  onIncreaseServings: () => void
  onStartCooking: () => void
  onShare: () => void
}

type StepLanguage = 'en' | 'ml'

export function RecipeDetail({
  recipe,
  servings,
  onDecreaseServings,
  onIncreaseServings,
  onStartCooking,
  onShare,
}: RecipeDetailProps) {
  const [stepLang, setStepLang] = useState<StepLanguage>('en')
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [translating, setTranslating] = useState(false)
  const [translateError, setTranslateError] = useState(false)
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric')
  const [rating, setRating] = useState(0)
  const [note, setNote] = useState('')
  const [cooked, setCooked] = useState<CookedEntry | null>(null)

  const recipeId = recipe?.id

  // Reset to English and reload the saved review whenever a different recipe opens.
  useEffect(() => {
    setStepLang('en')
    setTranslations({})
    setTranslateError(false)
    setUnitSystem('metric')
    if (recipeId) {
      const saved = readReview(recipeId)
      setRating(saved.rating)
      setNote(saved.note)
      setCooked(readCooked(recipeId))
    } else {
      setRating(0)
      setNote('')
      setCooked(null)
    }
  }, [recipeId])

  // Translate the steps on demand when Malayalam is selected.
  useEffect(() => {
    if (stepLang !== 'ml' || !recipe) return

    const controller = new AbortController()
    let cancelled = false
    setTranslating(true)
    setTranslateError(false)

    Promise.all(
      recipe.steps.map(
        async (step) => [step, await translateToMalayalam(step, controller.signal)] as const,
      ),
    )
      .then((pairs) => {
        if (!cancelled) setTranslations(Object.fromEntries(pairs))
      })
      .catch(() => {
        if (!cancelled) setTranslateError(true)
      })
      .finally(() => {
        if (!cancelled) setTranslating(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [stepLang, recipe])

  if (!recipe) {
    return (
      <section className="recipe-detail">
        <p className="empty">Choose a recipe to view details.</p>
      </section>
    )
  }

  const nutrition = estimateNutrition(recipe)
  const insights = healthInsights(recipe)

  const saveRating = (value: number) => {
    const next = value === rating ? 0 : value
    setRating(next)
    if (recipeId) writeReview(recipeId, { rating: next, note })
  }

  const saveNote = (value: string) => {
    setNote(value)
    if (recipeId) writeReview(recipeId, { rating, note: value })
  }

  const handleMadeIt = () => {
    if (!recipeId) return
    setCooked(markCooked(recipeId))
  }

  // Print just the recipe card by scoping print styles to the modal.
  const handlePrint = () => {
    const cleanup = () => {
      document.body.classList.remove('printing-recipe')
      window.removeEventListener('afterprint', cleanup)
    }
    window.addEventListener('afterprint', cleanup)
    document.body.classList.add('printing-recipe')
    window.print()
  }

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
        {cooked && (
          <p className="cooked-note">
            🍳 Cooked {cooked.count}× · last on {formatCookedDate(cooked.lastCookedAt)}
          </p>
        )}
      </div>

      <div className="detail-actions">
        <button type="button" className="cook-button" onClick={onStartCooking}>
          👩‍🍳 Start cooking mode
        </button>
        <button type="button" className="share-button" onClick={handleMadeIt}>
          🍳 I made this
        </button>
        <button type="button" className="share-button" onClick={handlePrint}>
          🖨️ Print
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

      <div className="steps-header">
        <h3>Ingredients</h3>
        <div className="unit-toggle" role="group" aria-label="Measurement units">
          <button
            type="button"
            className={unitSystem === 'metric' ? 'active' : ''}
            onClick={() => setUnitSystem('metric')}
          >
            Metric
          </button>
          <button
            type="button"
            className={unitSystem === 'imperial' ? 'active' : ''}
            onClick={() => setUnitSystem('imperial')}
          >
            Cups
          </button>
        </div>
      </div>
      <ul className="ingredient-list">
        {recipe.ingredients.map((ingredient) => {
          const scaledAmount = (ingredient.amount / recipe.servings) * servings
          const display =
            unitSystem === 'imperial'
              ? toImperial(scaledAmount, ingredient.unit, ingredient.name)
              : { amount: scaledAmount, unit: ingredient.unit }
          const substitution = findSubstitution(ingredient.name)
          return (
            <li key={`${recipe.id}-${ingredient.name}-${ingredient.unit}`}>
              <div className="ingredient-row">
                <span className="ingredient-name">{ingredient.name}</span>
                <span className="ingredient-amount">
                  {formatAmount(display.amount)} {display.unit}
                </span>
              </div>
              {substitution && (
                <span className="ingredient-sub">
                  <span className="sub-label">No {ingredient.name}?</span> use {substitution}
                </span>
              )}
            </li>
          )
        })}
      </ul>

      <div className="steps-header">
        <h3>Steps</h3>
        <div className="step-lang-toggle" role="group" aria-label="Step language">
          <button
            type="button"
            className={stepLang === 'en' ? 'active' : ''}
            onClick={() => setStepLang('en')}
          >
            English
          </button>
          <button
            type="button"
            className={stepLang === 'ml' ? 'active' : ''}
            onClick={() => setStepLang('ml')}
          >
            മലയാളം
          </button>
        </div>
      </div>
      {stepLang === 'ml' && translating && <p className="step-note">Translating to Malayalam…</p>}
      {stepLang === 'ml' && translateError && (
        <p className="step-note">Couldn’t translate right now — showing English.</p>
      )}
      <ol className="steps-list">
        {recipe.steps.map((step) => {
          const detail = describeStep(step)
          const display = stepLang === 'ml' && translations[step] ? translations[step] : detail.text
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
              <p className="step-text" lang={stepLang === 'ml' && translations[step] ? 'ml' : 'en'}>
                {display}
              </p>
            </li>
          )
        })}
      </ol>

      <div className="review-panel">
        <h3>Your rating &amp; notes</h3>
        <div
          className="star-rating"
          role="radiogroup"
          aria-label={`Rate ${recipe.title}`}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              className={`star ${value <= rating ? 'on' : ''}`}
              onClick={() => saveRating(value)}
              role="radio"
              aria-checked={value === rating}
              aria-label={`${value} star${value === 1 ? '' : 's'}`}
            >
              {value <= rating ? '★' : '☆'}
            </button>
          ))}
          {rating > 0 && <span className="star-value">{rating}/5</span>}
        </div>
        <textarea
          className="review-note"
          value={note}
          onChange={(event) => saveNote(event.target.value)}
          placeholder="Add your tweaks — spice level, swaps, timings…"
          rows={3}
        />
        <p className="review-hint">Saved on this device.</p>
      </div>
    </section>
  )
}