import { COLLECTIONS, SORT_OPTIONS, type SortOption } from '../lib/appConfig'

type FilterPanelProps = {
  query: string
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
  onQueryChange: (value: string) => void
  onCuisineChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onCollectionChange: (value: string) => void
  onTagChange: (value: string) => void
  onSortChange: (value: SortOption) => void
  onFavoritesOnlyChange: (value: boolean) => void
  onPantryInputChange: (value: string) => void
}

export function FilterPanel({
  query,
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
  onQueryChange,
  onCuisineChange,
  onCategoryChange,
  onCollectionChange,
  onTagChange,
  onSortChange,
  onFavoritesOnlyChange,
  onPantryInputChange,
}: FilterPanelProps) {
  return (
    <section className="control-panel">
      <div className="search-field">
        <span aria-hidden="true">🔍</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by recipe or ingredient"
          aria-label="Search recipes"
        />
      </div>
      <select value={cuisine} onChange={(event) => onCuisineChange(event.target.value)}>
        {cuisines.map((item) => (
          <option key={item} value={item}>
            {item === 'All' ? 'All cuisines' : item}
          </option>
        ))}
      </select>
      <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
        <option value="All">All categories</option>
        {categories
          .filter((item) => item !== 'All')
          .map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
      </select>
      <select value={collection} onChange={(event) => onCollectionChange(event.target.value)}>
        <option value="All">All collections</option>
        {COLLECTIONS.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select value={tag} onChange={(event) => onTagChange(event.target.value)}>
        {tags.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
      <select
        value={sort}
        onChange={(event) => onSortChange(event.target.value as SortOption)}
        aria-label="Sort recipes"
      >
        {SORT_OPTIONS.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <label className="checkbox">
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={(event) => onFavoritesOnlyChange(event.target.checked)}
        />
        Favorites only
      </label>
      <div className="pantry-field">
        <input
          value={pantryInput}
          onChange={(event) => onPantryInputChange(event.target.value)}
          placeholder="Pantry boost: coconut, rice, curry leaves"
          aria-label="Pantry ingredients"
        />
      </div>
    </section>
  )
}