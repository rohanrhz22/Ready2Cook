import type { Recipe } from '../data/recipes'
import { categoryEmoji, cuisineEmoji, tasteScore } from '../lib/appConfig'

type RecipeListProps = {
  recipes: Recipe[]
  selectedRecipeId: string
  favoriteIds: string[]
  pantryTokens: string[]
  pantryScoreByRecipe: Map<string, number>
  onSelectRecipe: (recipeId: string) => void
  onToggleFavorite: (recipeId: string) => void
}

export function RecipeList({
  recipes,
  selectedRecipeId,
  favoriteIds,
  pantryTokens,
  pantryScoreByRecipe,
  onSelectRecipe,
  onToggleFavorite,
}: RecipeListProps) {
  return (
    <aside className="recipe-list">
      {recipes.map((recipe) => {
        const isFavorite = favoriteIds.includes(recipe.id)
        const pantryMatch = pantryScoreByRecipe.get(recipe.id) ?? 0

        return (
          <article
            key={recipe.id}
            className={`recipe-card ${selectedRecipeId === recipe.id ? 'active' : ''}`}
          >
            <button
              type="button"
              className="recipe-card-main"
              onClick={() => onSelectRecipe(recipe.id)}
            >
              <div className="thumb" aria-hidden="true">
                {cuisineEmoji(recipe.cuisine)}
              </div>
              <div className="card-body">
                <h2>{recipe.title}</h2>
                <p>{recipe.description}</p>
                {(recipe.collections?.length ?? 0) > 0 && (
                  <div className="badge-row">
                    {recipe.collections?.map((collection) => (
                      <span key={collection} className="collection-badge">
                        {categoryEmoji(collection)} {collection}
                      </span>
                    ))}
                  </div>
                )}
                <div className="meta-row">
                  <span>{recipe.cuisine}</span>
                  <span>{recipe.prepMinutes + recipe.cookMinutes} min</span>
                  <span>{recipe.difficulty}</span>
                  <span className="taste-meter" title={`Taste ${tasteScore(recipe).toFixed(1)}/5`}>
                    {'★'.repeat(Math.round(tasteScore(recipe)))}
                    <em>{tasteScore(recipe).toFixed(1)}</em>
                  </span>
                </div>
                {pantryTokens.length > 0 && (
                  <p className="hint">
                    Pantry match: {pantryMatch}/{recipe.ingredients.length} ingredients
                  </p>
                )}
              </div>
            </button>
            <button
              type="button"
              className={`favorite-button ${isFavorite ? 'on' : ''}`}
              onClick={() => onToggleFavorite(recipe.id)}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          </article>
        )
      })}
      {recipes.length === 0 && <p className="empty">No recipes match your filters.</p>}
    </aside>
  )
}