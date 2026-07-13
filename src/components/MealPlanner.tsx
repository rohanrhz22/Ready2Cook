import { useRef } from 'react'
import type { Recipe } from '../data/recipesTypes'
import { MEAL_DAYS, type MealDay } from '../lib/appConfig'
import { estimateNutrition } from '../lib/nutrition'

type MealPlannerProps = {
  recipes: Recipe[]
  mealPlan: Record<MealDay, string[]>
  onClearPlanner: () => void
  onRemoveMealItem: (day: MealDay, index: number) => void
  onExportPlan: () => void
  onImportPlan: (file: File) => void
  onBackupAll: () => void
  onRestoreAll: (file: File) => void
  onDropRecipe: (day: MealDay, recipeId: string) => void
}

export function MealPlanner({
  recipes,
  mealPlan,
  onClearPlanner,
  onRemoveMealItem,
  onExportPlan,
  onImportPlan,
  onBackupAll,
  onRestoreAll,
  onDropRecipe,
}: MealPlannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const restoreInputRef = useRef<HTMLInputElement>(null)
  const recipeById = new Map(recipes.map((recipe) => [recipe.id, recipe]))

  const weekTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  let plannedCount = 0
  for (const day of MEAL_DAYS) {
    for (const recipeId of mealPlan[day]) {
      const recipe = recipeById.get(recipeId)
      if (!recipe) continue
      const nutrition = estimateNutrition(recipe)
      weekTotals.calories += nutrition.calories
      weekTotals.protein += nutrition.protein
      weekTotals.carbs += nutrition.carbs
      weekTotals.fat += nutrition.fat
      plannedCount += 1
    }
  }

  return (
    <section className="planner">
      <div className="planner-header">
        <h2>Weekly Meal Planner</h2>
        <div className="planner-actions">
          <button type="button" onClick={onClearPlanner} className="secondary">
            Clear week
          </button>
          <button type="button" onClick={onExportPlan} className="secondary">
            Export
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="secondary">
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="visually-hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onImportPlan(file)
              event.target.value = ''
            }}
          />
          <button type="button" onClick={onBackupAll} className="secondary">
            ⬇ Backup all
          </button>
          <button
            type="button"
            onClick={() => restoreInputRef.current?.click()}
            className="secondary"
          >
            ⬆ Restore all
          </button>
          <input
            ref={restoreInputRef}
            type="file"
            accept="application/json"
            className="visually-hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) onRestoreAll(file)
              event.target.value = ''
            }}
          />
        </div>
      </div>

      {plannedCount > 0 && (
        <div className="week-nutrition">
          <span>Week total (est.):</span>
          <strong>{weekTotals.calories}</strong> kcal · <strong>{weekTotals.protein} g</strong> protein
          · <strong>{weekTotals.carbs} g</strong> carbs · <strong>{weekTotals.fat} g</strong> fat
        </div>
      )}

      <p className="planner-hint">Open a recipe and tap “Add to plan”, or drag a recipe onto a day.</p>

      <div className="meal-grid">
        {MEAL_DAYS.map((day) => (
          <article
            key={day}
            className="day-card"
            onDragOver={(event) => {
              event.preventDefault()
              event.dataTransfer.dropEffect = 'copy'
            }}
            onDrop={(event) => {
              event.preventDefault()
              const recipeId = event.dataTransfer.getData('text/recipe-id')
              if (recipeId) onDropRecipe(day, recipeId)
            }}
          >
            <h3>{day}</h3>
            {mealPlan[day].length === 0 && <p className="empty">Drop a recipe here.</p>}
            <ul>
              {mealPlan[day].map((recipeId, index) => {
                const recipe = recipeById.get(recipeId)
                if (!recipe) return null

                return (
                  <li key={`${day}-${recipeId}-${index}`}>
                    <span>{recipe.title}</span>
                    <button type="button" onClick={() => onRemoveMealItem(day, index)}>
                      Remove
                    </button>
                  </li>
                )
              })}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}