import { useRef } from 'react'
import { recipes } from '../data/recipes'
import { MEAL_DAYS, type MealDay } from '../lib/appConfig'

type MealPlannerProps = {
  selectedDay: MealDay
  selectedRecipeId: string
  mealPlan: Record<MealDay, string[]>
  onDayChange: (day: MealDay) => void
  onAddSelectedRecipe: () => void
  onClearPlanner: () => void
  onRemoveMealItem: (day: MealDay, index: number) => void
  onExportPlan: () => void
  onImportPlan: (file: File) => void
}

export function MealPlanner({
  selectedDay,
  selectedRecipeId,
  mealPlan,
  onDayChange,
  onAddSelectedRecipe,
  onClearPlanner,
  onRemoveMealItem,
  onExportPlan,
  onImportPlan,
}: MealPlannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  return (
    <section className="planner">
      <div className="planner-header">
        <h2>Weekly Meal Planner</h2>
        <div className="planner-actions">
          <select value={selectedDay} onChange={(event) => onDayChange(event.target.value as MealDay)}>
            {MEAL_DAYS.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
          <button type="button" onClick={onAddSelectedRecipe} disabled={!selectedRecipeId}>
            Add selected recipe
          </button>
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
        </div>
      </div>

      <div className="meal-grid">
        {MEAL_DAYS.map((day) => (
          <article key={day} className="day-card">
            <h3>{day}</h3>
            {mealPlan[day].length === 0 && <p className="empty">No meals planned.</p>}
            <ul>
              {mealPlan[day].map((recipeId, index) => {
                const recipe = recipes.find((item) => item.id === recipeId)
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