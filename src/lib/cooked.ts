// Tracks how many times a recipe has been cooked and when it was last made.
// Persisted to localStorage so the "I made this" history survives reloads.

export type CookedEntry = {
  count: number
  lastCookedAt: string // ISO date string
}

const COOKED_KEY = 'spice-route-cooked'

function isCookedEntry(value: unknown): value is CookedEntry {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  return typeof record.count === 'number' && typeof record.lastCookedAt === 'string'
}

export function readCookedLog(): Record<string, CookedEntry> {
  const raw = localStorage.getItem(COOKED_KEY)
  if (raw === null) return {}

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}

    const result: Record<string, CookedEntry> = {}
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (isCookedEntry(value)) result[id] = value
    }
    return result
  } catch (error) {
    console.error('Failed to parse cooked log from storage', error)
    return {}
  }
}

export function readCooked(recipeId: string): CookedEntry | null {
  return readCookedLog()[recipeId] ?? null
}

/** Records that a recipe was cooked now, incrementing its counter. */
export function markCooked(recipeId: string): CookedEntry {
  const log = readCookedLog()
  const previous = log[recipeId]?.count ?? 0
  const entry: CookedEntry = { count: previous + 1, lastCookedAt: new Date().toISOString() }
  log[recipeId] = entry
  localStorage.setItem(COOKED_KEY, JSON.stringify(log))
  return entry
}

export function writeCookedLog(log: Record<string, CookedEntry>): void {
  localStorage.setItem(COOKED_KEY, JSON.stringify(log))
}

export function formatCookedDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
