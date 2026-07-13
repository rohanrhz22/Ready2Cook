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

type Chip = {
  key: string
  label: string
  onRemove: () => void
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
  const sortLabel = SORT_OPTIONS.find((item) => item.value === sort)?.label ?? sort

  // Build removable chips for whatever filters are currently active.
  const chips: Chip[] = []
  if (sort !== 'featured') {
    chips.push({ key: 'sort', label: sortLabel, onRemove: () => onSortChange('featured') })
  }
  if (cuisine !== 'All') {
    chips.push({ key: 'cuisine', label: cuisine, onRemove: () => onCuisineChange('All') })
  }
  if (category !== 'All') {
    chips.push({ key: 'category', label: category, onRemove: () => onCategoryChange('All') })
  }
  if (collection !== 'All') {
    chips.push({ key: 'collection', label: collection, onRemove: () => onCollectionChange('All') })
  }
  if (tag !== 'All') {
    chips.push({ key: 'tag', label: tag, onRemove: () => onTagChange('All') })
  }
  if (favoritesOnly) {
    chips.push({ key: 'fav', label: '★ Favorites', onRemove: () => onFavoritesOnlyChange(false) })
  }
  if (pantryInput.trim()) {
    chips.push({
      key: 'pantry',
      label: `🧺 ${pantryInput.trim()}`,
      onRemove: () => onPantryInputChange(''),
    })
  }

  return (
    <section className="filters-panel" aria-label="Filter and sort recipes">
      <div className="filters-head">
        <h3>Filter &amp; sort</h3>
        {chips.length > 0 && (
          <button type="button" className="filters-reset" onClick={onClear}>
            Reset all
          </button>
        )}
      </div>

      {chips.length > 0 && (
        <div className="active-chips" aria-label="Active filters">
          {chips.map((chip) => (
            <button
              type="button"
              key={chip.key}
              className="chip"
              onClick={chip.onRemove}
              aria-label={`Remove filter ${chip.label}`}
            >
              <span>{chip.label}</span>
              <span aria-hidden="true" className="chip-x">
                ✕
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="filter-section">
        <span className="filter-section-title">Sort</span>
        <label className="field">
          <select value={sort} onChange={(event) => onSortChange(event.target.value as SortOption)}>
            {SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filter-section">
        <span className="filter-section-title">Refine</span>
        <div className="filter-grid">
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
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-section-title">Cook with what I have</span>
        <label className="field pantry-field">
          <input
            value={pantryInput}
            onChange={(event) => onPantryInputChange(event.target.value)}
            placeholder="e.g. coconut, rice, curry leaves"
          />
          <span className="field-hint">
            Type ingredients you already have to find matching recipes.
          </span>
        </label>
      </div>

      <div className="filter-actions">
        <label className={`favorites-pill ${favoritesOnly ? 'on' : ''}`}>
          <input
            type="checkbox"
            checked={favoritesOnly}
            onChange={(event) => onFavoritesOnlyChange(event.target.checked)}
          />
          <span>★ Favorites only</span>
        </label>
        <button type="button" className="clear-filters" onClick={onClear}>
          Clear all
        </button>
      </div>
    </section>
  )
}