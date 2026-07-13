import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './App.css'
import { CookingMode } from './components/CookingMode'
import { FilterPanel } from './components/FilterPanel'
import { Hero } from './components/Hero'
import { MealPlanner } from './components/MealPlanner'
import { RecipeDetail } from './components/RecipeDetail'
import { RecipeGrid } from './components/RecipeGrid'
import { ShoppingList } from './components/ShoppingList'
import { ThemeToggle } from './components/ThemeToggle'
import { loadRecipes } from './data/loadRecipes'
import type { Recipe } from './data/recipesTypes'
import {
  FAVORITES_KEY,
  IMPORTANT_CUISINES,
  IMPORTANT_TAGS,
  LEGACY_FAVORITES_KEY,
  LEGACY_SHOPPING_CHECKED_KEY,
  MEAL_DAYS,
  MEAL_PLAN_KEY,
  SHOPPING_CHECKED_KEY,
  createEmptyMealPlan,
  difficultyRank,
  tasteScore,
  totalRecipeTime,
  type MealDay,
  type SortOption,
} from './lib/appConfig'
import { parseMealPlan, readStoredMealPlan, readStoredStringArray } from './lib/storage'
import { buildSearchSuggestions, recipeMatchesQuery } from './lib/search'
import { readCookedLog, writeCookedLog, markCooked } from './lib/cooked'
import { readReviews, writeReviews } from './lib/reviews'
import { useToast } from './lib/toast'
import { useTheme } from './lib/useTheme'

const RECENT_KEY = 'spice-route-recent'

function pantryMatchRatio(recipe: Recipe, pantryTokens: string[]): number {
  if (pantryTokens.length === 0) return 0
  const have = recipe.ingredients.filter((ingredient) =>
    pantryTokens.some((token) => ingredient.name.toLowerCase().includes(token)),
  ).length
  return have / recipe.ingredients.length
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const routeParams = useParams()
  const [searchParams] = useSearchParams()

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')

  const [cookingRecipe, setCookingRecipe] = useState<Recipe | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cuisine, setCuisine] = useState('All')
  const [category, setCategory] = useState('All')
  const [collection, setCollection] = useState('All')
  const [tag, setTag] = useState('All')
  const [sort, setSort] = useState<SortOption>('featured')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [pantryInput, setPantryInput] = useState('')
  const [selectedDay, setSelectedDay] = useState<MealDay>('Monday')
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() =>
    readStoredStringArray(FAVORITES_KEY, LEGACY_FAVORITES_KEY),
  )
  const [mealPlan, setMealPlan] = useState<Record<MealDay, string[]>>(() =>
    readStoredMealPlan(MEAL_PLAN_KEY),
  )
  const [checkedShoppingItems, setCheckedShoppingItems] = useState<string[]>(() =>
    readStoredStringArray(SHOPPING_CHECKED_KEY, LEGACY_SHOPPING_CHECKED_KEY),
  )
  const [recentIds, setRecentIds] = useState<string[]>(() =>
    readStoredStringArray(RECENT_KEY, RECENT_KEY),
  )
  const [servings, setServings] = useState(1)

  useEffect(() => {
    const controller = new AbortController()
    loadRecipes(controller.signal)
      .then((data) => {
        setRecipes(data)
        setLoadState('ready')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        console.error(error)
        setLoadState('error')
      })
    return () => controller.abort()
  }, [])

  const cuisines = useMemo(() => {
    const present = new Set(recipes.map((recipe) => recipe.cuisine))
    return ['All', ...IMPORTANT_CUISINES.filter((item) => present.has(item))]
  }, [recipes])
  const categories = useMemo(
    () => ['All', ...new Set(recipes.map((recipe) => recipe.category))].sort(),
    [recipes],
  )
  const tags = useMemo(() => {
    const present = new Set(recipes.flatMap((recipe) => recipe.tags))
    return ['All', ...IMPORTANT_TAGS.filter((item) => present.has(item))]
  }, [recipes])

  const pantryTokens = useMemo(
    () =>
      pantryInput
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    [pantryInput],
  )

  const filteredRecipes = useMemo(() => {
    const matched = recipes.filter((recipe) => {
      const matchesCuisine = cuisine === 'All' || recipe.cuisine === cuisine
      const matchesCategory = category === 'All' || recipe.category === category
      const matchesCollection =
        collection === 'All' || (recipe.collections ?? []).includes(collection)
      const matchesTag = tag === 'All' || recipe.tags.includes(tag)
      const matchesFavorite = !favoritesOnly || favoriteIds.includes(recipe.id)
      const matchesQuery = recipeMatchesQuery(recipe, query)

      return (
        matchesCuisine &&
        matchesCategory &&
        matchesCollection &&
        matchesTag &&
        matchesFavorite &&
        matchesQuery
      )
    })

    const sorted = [...matched]
    switch (sort) {
      case 'pantry-match':
        sorted.sort(
          (a, b) =>
            pantryMatchRatio(b, pantryTokens) - pantryMatchRatio(a, pantryTokens) ||
            tasteScore(b) - tasteScore(a),
        )
        break
      case 'easy-first':
        sorted.sort((a, b) => difficultyRank(a) - difficultyRank(b) || tasteScore(b) - tasteScore(a))
        break
      case 'hard-first':
        sorted.sort((a, b) => difficultyRank(b) - difficultyRank(a) || tasteScore(b) - tasteScore(a))
        break
      case 'tastiest':
        sorted.sort((a, b) => tasteScore(b) - tasteScore(a))
        break
      case 'quickest':
        sorted.sort((a, b) => totalRecipeTime(a) - totalRecipeTime(b))
        break
      case 'fewest-ingredients':
        sorted.sort(
          (a, b) =>
            a.ingredients.length - b.ingredients.length || totalRecipeTime(a) - totalRecipeTime(b),
        )
        break
      case 'easy-tasty':
        sorted.sort(
          (a, b) =>
            tasteScore(b) - difficultyRank(b) - (tasteScore(a) - difficultyRank(a)) ||
            a.ingredients.length - b.ingredients.length ||
            totalRecipeTime(a) - totalRecipeTime(b),
        )
        break
      default:
        break
    }

    return sorted
  }, [recipes, query, cuisine, category, collection, tag, sort, favoritesOnly, favoriteIds, pantryTokens])

  const activeRecipe = useMemo(
    () =>
      routeParams.recipeId
        ? recipes.find((recipe) => recipe.id === routeParams.recipeId) ?? null
        : null,
    [routeParams.recipeId, recipes],
  )

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (cuisine !== 'All') count += 1
    if (category !== 'All') count += 1
    if (collection !== 'All') count += 1
    if (tag !== 'All') count += 1
    if (sort !== 'featured') count += 1
    if (favoritesOnly) count += 1
    if (pantryTokens.length > 0) count += 1
    return count
  }, [cuisine, category, collection, tag, sort, favoritesOnly, pantryTokens])

  const pantryScoreByRecipe = useMemo(() => {
    const tokenSet = new Set(pantryTokens)
    const scores = new Map<string, number>()

    for (const recipe of filteredRecipes) {
      const matchCount = recipe.ingredients.filter((ingredient) => {
        const ingredientName = ingredient.name.toLowerCase()
        return Array.from(tokenSet).some((token) => ingredientName.includes(token))
      }).length
      scores.set(recipe.id, matchCount)
    }

    return scores
  }, [filteredRecipes, pantryTokens])

  const shoppingList = useMemo(() => {
    const totals = new Map<string, { name: string; amount: number; unit: string }>()

    for (const day of MEAL_DAYS) {
      for (const recipeId of mealPlan[day]) {
        const recipe = recipes.find((item) => item.id === recipeId)
        if (!recipe) continue

        for (const ingredient of recipe.ingredients) {
          const key = `${ingredient.name}|${ingredient.unit}`
          const current = totals.get(key)
          if (current) {
            current.amount += ingredient.amount
            continue
          }
          totals.set(key, { ...ingredient })
        }
      }
    }

    return Array.from(totals.entries())
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [recipes, mealPlan])

  const plannedMealCount = useMemo(
    () => MEAL_DAYS.reduce((total, day) => total + mealPlan[day].length, 0),
    [mealPlan],
  )

  const searchSuggestions = useMemo(() => buildSearchSuggestions(recipes), [recipes])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds))
  }, [favoriteIds])

  useEffect(() => {
    localStorage.setItem(MEAL_PLAN_KEY, JSON.stringify(mealPlan))
  }, [mealPlan])

  useEffect(() => {
    localStorage.setItem(SHOPPING_CHECKED_KEY, JSON.stringify(checkedShoppingItems))
  }, [checkedShoppingItems])

  useEffect(() => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds))
  }, [recentIds])

  useEffect(() => {
    if (!activeRecipe) return
    setServings(activeRecipe.servings)
  }, [activeRecipe])

  // Backward compatibility: redirect old ?recipe=<id> links to /recipe/<id>.
  useEffect(() => {
    const legacyId = searchParams.get('recipe')
    if (legacyId && !routeParams.recipeId) {
      navigate(`/recipe/${legacyId}`, { replace: true })
    }
  }, [searchParams, routeParams.recipeId, navigate])

  // If a shared link points to a missing recipe, return to browse.
  useEffect(() => {
    if (
      routeParams.recipeId &&
      loadState === 'ready' &&
      !recipes.some((recipe) => recipe.id === routeParams.recipeId)
    ) {
      navigate('/', { replace: true })
    }
  }, [routeParams.recipeId, loadState, recipes, navigate])

  // Lock body scroll and close on Escape while the recipe modal is open.
  useEffect(() => {
    if (!activeRecipe) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [activeRecipe, navigate])

  const selectRecipe = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`)
    setRecentIds((current) => [recipeId, ...current.filter((id) => id !== recipeId)].slice(0, 8))
  }

  const closeDetail = () => navigate('/')

  const toggleFavorite = (recipeId: string) => {
    const isFavorite = favoriteIds.includes(recipeId)
    setFavoriteIds((current) =>
      current.includes(recipeId)
        ? current.filter((id) => id !== recipeId)
        : [...current, recipeId],
    )
    showToast(isFavorite ? 'Removed from favorites' : 'Added to favorites')
  }

  const addRecipeToDay = (day: MealDay, recipeId: string) => {
    setMealPlan((current) => ({
      ...current,
      [day]: [...current[day], recipeId],
    }))
    const recipe = recipes.find((item) => item.id === recipeId)
    if (recipe) showToast(`Added “${recipe.title}” to ${day}`)
  }

  const removeMealItem = (day: MealDay, index: number) => {
    setMealPlan((current) => ({
      ...current,
      [day]: current[day].filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const toggleShoppingCheck = (itemId: string) => {
    setCheckedShoppingItems((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    )
  }

  const clearPlanner = () => {
    setMealPlan(createEmptyMealPlan())
    setCheckedShoppingItems([])
    showToast('Weekly plan cleared')
  }

  const clearFilters = () => {
    setQuery('')
    setCuisine('All')
    setCategory('All')
    setCollection('All')
    setTag('All')
    setSort('featured')
    setFavoritesOnly(false)
    setPantryInput('')
  }

  const exportPlan = () => {
    const payload = JSON.stringify({ mealPlan, favoriteIds }, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'spice-route-plan.json'
    link.click()
    URL.revokeObjectURL(url)
    showToast('Meal plan exported')
  }

  const importPlan = async (file: File) => {
    try {
      const text = await file.text()
      const parsed: unknown = JSON.parse(text)
      const source = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>
      const planSource = 'mealPlan' in source ? source.mealPlan : source
      setMealPlan(parseMealPlan(JSON.stringify(planSource)))

      const importedFavorites = source.favoriteIds
      if (Array.isArray(importedFavorites)) {
        setFavoriteIds(importedFavorites.filter((id): id is string => typeof id === 'string'))
      }
      showToast('Meal plan imported')
    } catch {
      showToast('Could not import that file')
    }
  }

  // Full local backup of everything the app stores — the offline stand-in for
  // cloud sync. Move this file between devices to carry your data across.
  const backupAllData = () => {
    const payload = JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        mealPlan,
        favoriteIds,
        recentIds,
        checkedShoppingItems,
        reviews: readReviews(),
        cooked: readCookedLog(),
      },
      null,
      2,
    )
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'spice-route-backup.json'
    link.click()
    URL.revokeObjectURL(url)
    showToast('Backup downloaded')
  }

  const restoreAllData = async (file: File) => {
    try {
      const text = await file.text()
      const parsed: unknown = JSON.parse(text)
      if (!parsed || typeof parsed !== 'object') throw new Error('bad file')
      const source = parsed as Record<string, unknown>

      if ('mealPlan' in source) setMealPlan(parseMealPlan(JSON.stringify(source.mealPlan)))
      if (Array.isArray(source.favoriteIds)) {
        setFavoriteIds(source.favoriteIds.filter((id): id is string => typeof id === 'string'))
      }
      if (Array.isArray(source.recentIds)) {
        setRecentIds(source.recentIds.filter((id): id is string => typeof id === 'string'))
      }
      if (Array.isArray(source.checkedShoppingItems)) {
        setCheckedShoppingItems(
          source.checkedShoppingItems.filter((id): id is string => typeof id === 'string'),
        )
      }
      if (source.reviews && typeof source.reviews === 'object') {
        writeReviews(source.reviews as Parameters<typeof writeReviews>[0])
      }
      if (source.cooked && typeof source.cooked === 'object') {
        writeCookedLog(source.cooked as Parameters<typeof writeCookedLog>[0])
      }
      showToast('Backup restored')
    } catch {
      showToast('Could not restore that file')
    }
  }

  const shareSelected = async () => {
    if (!activeRecipe) return
    const base = `${window.location.origin}${window.location.pathname}`
    const shareUrl = `${base}#/recipe/${encodeURIComponent(activeRecipe.id)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: activeRecipe.title, url: shareUrl })
      } else {
        await navigator.clipboard.writeText(shareUrl)
        showToast('Link copied to clipboard')
      }
    } catch {
      // Share cancelled or clipboard unavailable — no action needed.
    }
  }

  if (loadState !== 'ready') {
    return (
      <div className="app-shell">
        <div className="app-topbar">
          <span className="brand-mini">🌿 SpiceRoute</span>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <div className="loading-state">
          {loadState === 'loading' ? (
            <p>Loading recipes…</p>
          ) : (
            <p>Could not load recipes. Please refresh to try again.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <span className="brand-mini">🌿 SpiceRoute</span>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <Hero
        recipeCount={recipes.length}
        cuisineCount={cuisines.length - 1}
        favoriteCount={favoriteIds.length}
        plannedMealCount={plannedMealCount}
      />

      <div className="browse-toolbar">
        <div className="search-field">
          <span aria-hidden="true">🔍</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search recipes or ingredients"
            aria-label="Search recipes"
            list="recipe-suggestions"
          />
          <datalist id="recipe-suggestions">
            {searchSuggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        </div>
        <button
          type="button"
          className={`filters-toggle ${filtersOpen ? 'open' : ''}`}
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
        >
          ⚙ Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
        </button>
      </div>

      <div className="browse-meta">
        <span>
          {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
        </span>
        {activeFilterCount > 0 && (
          <button type="button" className="link-btn" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {filtersOpen && (
        <FilterPanel
          cuisine={cuisine}
          category={category}
          collection={collection}
          tag={tag}
          sort={sort}
          favoritesOnly={favoritesOnly}
          pantryInput={pantryInput}
          cuisines={cuisines}
          categories={categories}
          tags={tags}
          onCuisineChange={setCuisine}
          onCategoryChange={setCategory}
          onCollectionChange={setCollection}
          onTagChange={setTag}
          onSortChange={setSort}
          onFavoritesOnlyChange={setFavoritesOnly}
          onPantryInputChange={setPantryInput}
          onClear={clearFilters}
        />
      )}

      <RecipeGrid
        recipes={filteredRecipes}
        favoriteIds={favoriteIds}
        pantryTokens={pantryTokens}
        pantryScoreByRecipe={pantryScoreByRecipe}
        onSelectRecipe={selectRecipe}
        onToggleFavorite={toggleFavorite}
      />

      <MealPlanner
        recipes={recipes}
        mealPlan={mealPlan}
        onClearPlanner={clearPlanner}
        onRemoveMealItem={removeMealItem}
        onExportPlan={exportPlan}
        onImportPlan={importPlan}
        onBackupAll={backupAllData}
        onRestoreAll={restoreAllData}
        onDropRecipe={addRecipeToDay}
      />

      <ShoppingList
        items={shoppingList}
        checkedItemIds={checkedShoppingItems}
        onToggleItem={toggleShoppingCheck}
      />

      {activeRecipe && (
        <div className="recipe-modal-overlay" onClick={closeDetail}>
          <div
            className="recipe-modal"
            role="dialog"
            aria-modal="true"
            aria-label={activeRecipe.title}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="recipe-modal-bar">
              <button type="button" className="back-link" onClick={closeDetail}>
                ← All recipes
              </button>
              <div className="modal-plan">
                <select
                  value={selectedDay}
                  onChange={(event) => setSelectedDay(event.target.value as MealDay)}
                  aria-label="Day to plan"
                >
                  {MEAL_DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="plan-add"
                  onClick={() => addRecipeToDay(selectedDay, activeRecipe.id)}
                >
                  Add to plan
                </button>
              </div>
              <button
                type="button"
                className="recipe-modal-close"
                onClick={closeDetail}
                aria-label="Close recipe"
              >
                ✕
              </button>
            </div>

            <RecipeDetail
              recipe={activeRecipe}
              servings={servings}
              onDecreaseServings={() => setServings((current) => Math.max(1, current - 1))}
              onIncreaseServings={() => setServings((current) => current + 1)}
              onStartCooking={() => setCookingRecipe(activeRecipe)}
              onShare={shareSelected}
            />
          </div>
        </div>
      )}

      {cookingRecipe && (
        <CookingMode
          recipe={cookingRecipe}
          onClose={() => setCookingRecipe(null)}
          onCooked={() => markCooked(cookingRecipe.id)}
        />
      )}
    </div>
  )
}

export default App
