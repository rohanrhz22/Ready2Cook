import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import './App.css'
import { CategoryBar } from './components/CategoryBar'
import { CookingMode } from './components/CookingMode'
import { FilterPanel } from './components/FilterPanel'
import { Hero } from './components/Hero'
import { MealPlanner } from './components/MealPlanner'
import { RecentlyViewed } from './components/RecentlyViewed'
import { RecipeDetail } from './components/RecipeDetail'
import { RecipeList } from './components/RecipeList'
import { ShoppingList } from './components/ShoppingList'
import { ThemeToggle } from './components/ThemeToggle'
import { loadRecipes } from './data/loadRecipes'
import type { Recipe } from './data/recipesTypes'
import {
  FAVORITES_KEY,
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

  const cuisines = useMemo(
    () => ['All', ...new Set(recipes.map((recipe) => recipe.cuisine))],
    [recipes],
  )
  const categories = useMemo(
    () => ['All', ...new Set(recipes.map((recipe) => recipe.category))].sort(),
    [recipes],
  )
  const tags = useMemo(
    () => ['All', ...new Set(recipes.flatMap((recipe) => recipe.tags))],
    [recipes],
  )

  const pantryTokens = useMemo(
    () =>
      pantryInput
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    [pantryInput],
  )

  const filteredRecipes = useMemo(() => {
    const loweredQuery = query.trim().toLowerCase()

    const matched = recipes.filter((recipe) => {
      const matchesCuisine = cuisine === 'All' || recipe.cuisine === cuisine
      const matchesCategory = category === 'All' || recipe.category === category
      const matchesCollection =
        collection === 'All' || (recipe.collections ?? []).includes(collection)
      const matchesTag = tag === 'All' || recipe.tags.includes(tag)
      const matchesFavorite = !favoritesOnly || favoriteIds.includes(recipe.id)
      const matchesQuery =
        loweredQuery.length === 0 ||
        recipe.title.toLowerCase().includes(loweredQuery) ||
        recipe.description.toLowerCase().includes(loweredQuery) ||
        recipe.ingredients.some((ingredient) =>
          ingredient.name.toLowerCase().includes(loweredQuery),
        )

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

  const selectedRecipeId = routeParams.recipeId ?? ''
  const selectedRecipe =
    filteredRecipes.find((recipe) => recipe.id === selectedRecipeId) ?? filteredRecipes[0] ?? null

  const recentRecipes = useMemo(() => {
    const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]))
    return recentIds
      .map((id) => byId.get(id))
      .filter((recipe): recipe is Recipe => Boolean(recipe))
  }, [recipes, recentIds])

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
    if (!selectedRecipe) return
    setServings(selectedRecipe.servings)
  }, [selectedRecipe])

  // Backward compatibility: redirect old ?recipe=<id> links to /recipe/<id>.
  useEffect(() => {
    const legacyId = searchParams.get('recipe')
    if (legacyId && !routeParams.recipeId) {
      navigate(`/recipe/${legacyId}`, { replace: true })
    }
  }, [searchParams, routeParams.recipeId, navigate])

  // Bring the selected recipe into view when opened or deep-linked.
  useEffect(() => {
    if (!routeParams.recipeId) return
    if (window.matchMedia('(max-width: 1080px)').matches) {
      requestAnimationFrame(() =>
        document
          .querySelector('.recipe-detail')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      )
    }
  }, [routeParams.recipeId])

  const selectRecipe = (recipeId: string) => {
    navigate(`/recipe/${recipeId}`)
    setRecentIds((current) => [recipeId, ...current.filter((id) => id !== recipeId)].slice(0, 8))
  }

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

  const addSelectedToMealPlan = () => {
    if (!selectedRecipe) return
    addRecipeToDay(selectedDay, selectedRecipe.id)
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

  const shareSelected = async () => {
    if (!selectedRecipe) return
    const base = `${window.location.origin}${window.location.pathname}`
    const shareUrl = `${base}#/recipe/${encodeURIComponent(selectedRecipe.id)}`
    try {
      if (navigator.share) {
        await navigator.share({ title: selectedRecipe.title, url: shareUrl })
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

      <FilterPanel
        query={query}
        cuisine={cuisine}
        tag={tag}
        sort={sort}
        favoritesOnly={favoritesOnly}
        pantryInput={pantryInput}
        cuisines={cuisines}
        tags={tags}
        onQueryChange={setQuery}
        onCuisineChange={setCuisine}
        onTagChange={setTag}
        onSortChange={setSort}
        onFavoritesOnlyChange={setFavoritesOnly}
        onPantryInputChange={setPantryInput}
      />

      <CategoryBar
        recipes={recipes}
        categories={categories}
        selectedCategory={category}
        selectedCollection={collection}
        onCategoryChange={setCategory}
        onCollectionChange={setCollection}
      />

      <RecentlyViewed recipes={recentRecipes} onSelect={selectRecipe} />

      <section className="content-grid">
        <RecipeList
          recipes={filteredRecipes}
          selectedRecipeId={selectedRecipe?.id ?? ''}
          favoriteIds={favoriteIds}
          pantryTokens={pantryTokens}
          pantryScoreByRecipe={pantryScoreByRecipe}
          onSelectRecipe={selectRecipe}
          onToggleFavorite={toggleFavorite}
        />

        <RecipeDetail
          recipe={selectedRecipe}
          servings={servings}
          onDecreaseServings={() => setServings((current) => Math.max(1, current - 1))}
          onIncreaseServings={() => setServings((current) => current + 1)}
          onStartCooking={() => selectedRecipe && setCookingRecipe(selectedRecipe)}
          onShare={shareSelected}
        />
      </section>

      <MealPlanner
        recipes={recipes}
        selectedDay={selectedDay}
        selectedRecipeId={selectedRecipe?.id ?? ''}
        mealPlan={mealPlan}
        onDayChange={setSelectedDay}
        onAddSelectedRecipe={addSelectedToMealPlan}
        onClearPlanner={clearPlanner}
        onRemoveMealItem={removeMealItem}
        onExportPlan={exportPlan}
        onImportPlan={importPlan}
        onDropRecipe={addRecipeToDay}
      />

      <ShoppingList
        items={shoppingList}
        checkedItemIds={checkedShoppingItems}
        onToggleItem={toggleShoppingCheck}
      />

      {cookingRecipe && (
        <CookingMode recipe={cookingRecipe} onClose={() => setCookingRecipe(null)} />
      )}
    </div>
  )
}

export default App
