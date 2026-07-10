type HeroProps = {
  recipeCount: number
  cuisineCount: number
  favoriteCount: number
  plannedMealCount: number
}

export function Hero({ recipeCount, cuisineCount, favoriteCount, plannedMealCount }: HeroProps) {
  return (
    <header className="app-header">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-inner">
        <p className="eyebrow">🌿 SpiceRoute · Kerala & World Kitchen</p>
        <h1>
          Plan bold home cooking,
          <span className="hero-accent"> from Kerala to your table.</span>
        </h1>
        <p className="hero-sub">
          Discover authentic recipes, scale servings instantly, plan your week, and auto-build
          your shopping list.
        </p>
        <div className="hero-stats">
          <div>
            <strong>{recipeCount}</strong>
            <span>Recipes</span>
          </div>
          <div>
            <strong>{cuisineCount}</strong>
            <span>Cuisines</span>
          </div>
          <div>
            <strong>{favoriteCount}</strong>
            <span>Favorites</span>
          </div>
          <div>
            <strong>{plannedMealCount}</strong>
            <span>Planned</span>
          </div>
        </div>
      </div>
    </header>
  )
}