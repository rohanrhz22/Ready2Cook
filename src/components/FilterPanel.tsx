import { COLLECTIONS, SORT_OPTIONS, type SortOption } from '../lib/appConfig'

type FilterPanelProps = {
  cuisine: string
  category: string
  collection: string
  tag: string
  sort: SortOption
  favoritesOnly: boolean
  pantryInput: string
  cuisines: string[]
  categories: string[]
  tags: string[]
  onCuisineChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onCollectionChange: (value: string) => void
  onTagChange: (value: string) => void
  onSortChange: (value: SortOption) => void
  onFavoritesOnlyChange: (value: boolean) => void
  onPantryInputChange: (value: string) => void
  onClear: () => void
}

export function FilterPanel({
  cuisine,
  category,
  collection,
  tag,
  sort,
  favoritesOnly,
  pantryInput,
  cuisines,
  categories,
  tags,
  onCuisineChange,
  onCategoryChange,
  onCollectionChange,
  onTagChange,
  onSortChange,
  onFavoritesOnlyChange,
  onPantryInputChange,
  onClear,
}: FilterPanelProps) {
  return (
    <section className="filters-panel">
      <label className="field">
        <span>Sort by</span>
        <select value={sort} onChange={(event) => onSortChange(event.target.value as SortOption)}>
          {SORT_OPTIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Cuisine</span>
        <select value={cuisine} onChange={(event) => onCuisineChange(event.target.value)}>
          {cuisines.map((item) => (
            <option key={item} value={item}>
              {item === 'All' ? 'All cuisines' : item}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Category</span>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item === 'All' ? 'All categories' : item}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Collection</span>
        <select value={collection} onChange={(event) => onCollectionChange(event.target.value)}>
          <option value="All">All collections</option>
          {COLLECTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Tag</span>
        <select value={tag} onChange={(event) => onTagChange(event.target.value)}>
          {tags.map((item) => (
            <option key={item} value={item}>
              {item === 'All' ? 'All tags' : item}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Cook with what I have</span>
        <input
          value={pantryInput}
          onChange={(event) => onPantryInputChange(event.target.value)}
          placeholder="coconut, rice, curry leaves"
        />
      </label>

      <label className="checkbox filter-fav">
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={(event) => onFavoritesOnlyChange(event.target.checked)}
        />
        Favorites only
      </label>

      <button type="button" className="clear-filters" onClick={onClear}>
        Clear all
      </button>
    </section>
  )
}