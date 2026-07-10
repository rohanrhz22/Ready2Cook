import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { CategoryBar } from './components/CategoryBar'
import { FilterPanel } from './components/FilterPanel'
import { Hero } from './components/Hero'
import { MealPlanner } from './components/MealPlanner'
import { RecipeDetail } from './components/RecipeDetail'
import { RecipeList } from './components/RecipeList'
import { ShoppingList } from './components/ShoppingList'
import { recipes } from './data/recipes'
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
import { readStoredMealPlan, readStoredStringArray } from './lib/storage'

function App() {
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
  const [selectedRecipeId, setSelectedRecipeId] = useState(recipes[0]?.id ?? '')
  const [servings, setServings] = useState(recipes[0]?.servings ?? 1)

  const cuisines = useMemo(() => ['All', ...new Set(recipes.map((recipe) => recipe.cuisine))], [])
  const categories = useMemo(
    () => ['All', ...new Set(recipes.map((recipe) => recipe.category))].sort(),
    [],
  )
  const tags = useMemo(() => ['All', ...new Set(recipes.flatMap((recipe) => recipe.tags))], [])

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
  }, [query, cuisine, category, collection, tag, sort, favoritesOnly, favoriteIds])

  const selectedRecipe =
    filteredRecipes.find((recipe) => recipe.id === selectedRecipeId) ?? filteredRecipes[0] ?? null

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
  }, [mealPlan])

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
    if (!selectedRecipe) {
      setSelectedRecipeId('')
      return
    }

    if (!filteredRecipes.some((recipe) => recipe.id === selectedRecipeId)) {
      setSelectedRecipeId(selectedRecipe.id)
    }
  }, [filteredRecipes, selectedRecipe, selectedRecipeId])

  useEffect(() => {
    if (!selectedRecipe) return
    setServings(selectedRecipe.servings)
  }, [selectedRecipe])

  const toggleFavorite = (recipeId: string) => {
    setFavoriteIds((current) =>
      current.includes(recipeId)
        ? current.filter((id) => id !== recipeId)
        : [...current, recipeId],
    )
  }

  const addSelectedToMealPlan = () => {
    if (!selectedRecipe) return

    setMealPlan((current) => ({
      ...current,
      [selectedDay]: [...current[selectedDay], selectedRecipe.id],
    }))
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
  }

  return (
    <div className="app-shell">
      <Hero
        recipeCount={recipes.length}
        cuisineCount={cuisines.length - 1}
        favoriteCount={favoriteIds.length}
        plannedMealCount={plannedMealCount}
      />

      <FilterPanel
        query={query}
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
        onQueryChange={setQuery}
        onCuisineChange={setCuisine}
        onCategoryChange={setCategory}
        onCollectionChange={setCollection}
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

      <section className="content-grid">
        <RecipeList
          recipes={filteredRecipes}
          selectedRecipeId={selectedRecipe?.id ?? ''}
          favoriteIds={favoriteIds}
          pantryTokens={pantryTokens}
          pantryScoreByRecipe={pantryScoreByRecipe}
          onSelectRecipe={setSelectedRecipeId}
          onToggleFavorite={toggleFavorite}
        />

        <RecipeDetail
          recipe={selectedRecipe}
          servings={servings}
          onDecreaseServings={() => setServings((current) => Math.max(1, current - 1))}
          onIncreaseServings={() => setServings((current) => current + 1)}
        />
      </section>

      <MealPlanner
        selectedDay={selectedDay}
        selectedRecipeId={selectedRecipe?.id ?? ''}
        mealPlan={mealPlan}
        onDayChange={setSelectedDay}
        onAddSelectedRecipe={addSelectedToMealPlan}
        onClearPlanner={clearPlanner}
        onRemoveMealItem={removeMealItem}
      />

      <ShoppingList
        items={shoppingList}
        checkedItemIds={checkedShoppingItems}
        onToggleItem={toggleShoppingCheck}
      />
    </div>
  )
}

export default App
