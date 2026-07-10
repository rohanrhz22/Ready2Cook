import { formatAmount } from '../lib/appConfig'
import { AISLE_ORDER, ingredientAisle, type Aisle } from '../lib/nutrition'

type ShoppingItem = {
  id: string
  name: string
  amount: number
  unit: string
}

type ShoppingListProps = {
  items: ShoppingItem[]
  checkedItemIds: string[]
  onToggleItem: (itemId: string) => void
}

export function ShoppingList({ items, checkedItemIds, onToggleItem }: ShoppingListProps) {
  const grouped = new Map<Aisle, ShoppingItem[]>()
  for (const item of items) {
    const aisle = ingredientAisle(item.name)
    const bucket = grouped.get(aisle)
    if (bucket) {
      bucket.push(item)
    } else {
      grouped.set(aisle, [item])
    }
  }

  const orderedAisles = AISLE_ORDER.filter((aisle) => grouped.has(aisle))

  return (
    <section className="shopping">
      <div className="shopping-header">
        <h2>Auto Shopping List</h2>
        {items.length > 0 && (
          <button type="button" className="secondary" onClick={() => window.print()}>
            🖨️ Print list
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="empty">Plan a few meals to generate your shopping list.</p>
      ) : (
        <div className="shopping-aisles">
          {orderedAisles.map((aisle) => (
            <div key={aisle} className="shopping-aisle">
              <h3>{aisle}</h3>
              <ul>
                {grouped.get(aisle)?.map((item) => {
                  const checked = checkedItemIds.includes(item.id)
                  return (
                    <li key={item.id} className={checked ? 'checked' : ''}>
                      <label>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => onToggleItem(item.id)}
                        />
                        <span>
                          {item.name} - {formatAmount(item.amount)} {item.unit}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}