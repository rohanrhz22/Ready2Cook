import type { Recipe } from '../data/recipes'
import { COLLECTIONS, categoryEmoji } from '../lib/appConfig'

type CategoryBarProps = {
  recipes: Recipe[]
  categories: string[]
  selectedCategory: string
  selectedCollection: string
  onCategoryChange: (value: string) => void
  onCollectionChange: (value: string) => void
}

export function CategoryBar({
  recipes,
  categories,
  selectedCategory,
  selectedCollection,
  onCategoryChange,
  onCollectionChange,
}: CategoryBarProps) {
  return (
    <nav className="category-bar" aria-label="Recipe categories">
      {COLLECTIONS.map((item) => {
        const count = recipes.filter((recipe) => (recipe.collections ?? []).includes(item)).length

        return (
          <button
            key={item}
            type="button"
            className={`category-chip featured ${selectedCollection === item ? 'active' : ''}`}
            onClick={() => onCollectionChange(selectedCollection === item ? 'All' : item)}
          >
            <span aria-hidden="true">{categoryEmoji(item)}</span>
            {item}
            <em>{count}</em>
          </button>
        )
      })}
      <span className="chip-divider" aria-hidden="true" />
      {categories.map((item) => {
        const count =
          item === 'All' ? recipes.length : recipes.filter((recipe) => recipe.category === item).length

        return (
          <button
            key={item}
            type="button"
            className={`category-chip ${selectedCategory === item ? 'active' : ''}`}
            onClick={() => onCategoryChange(item)}
          >
            <span aria-hidden="true">{categoryEmoji(item)}</span>
            {item === 'All' ? 'All' : item}
            <em>{count}</em>
          </button>
        )
      })}
    </nav>
  )
}