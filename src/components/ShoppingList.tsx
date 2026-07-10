import { formatAmount } from '../lib/appConfig'

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
  return (
    <section className="shopping">
      <h2>Auto Shopping List</h2>
      {items.length === 0 ? (
        <p className="empty">Plan a few meals to generate your shopping list.</p>
      ) : (
        <ul>
          {items.map((item) => {
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
      )}
    </section>
  )
}