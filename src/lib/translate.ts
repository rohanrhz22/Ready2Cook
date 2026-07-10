// On-demand English → Malayalam translation for recipe steps.
// Uses the free MyMemory API (no key, CORS-friendly) and caches every result
// in localStorage so repeat views are instant and offline-friendly.
const CACHE_PREFIX = 'ml-translate:'

function extractTranslation(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  const record = data as {
    responseStatus?: number | string
    responseData?: { translatedText?: unknown }
  }
  if (Number(record.responseStatus) !== 200) return null
  const text = record.responseData?.translatedText
  return typeof text === 'string' && text.trim() ? text : null
}

export async function translateToMalayalam(text: string, signal?: AbortSignal): Promise<string> {
  const trimmed = text.trim()
  if (!trimmed) return text

  const cacheKey = CACHE_PREFIX + trimmed
  const cached = localStorage.getItem(cacheKey)
  if (cached) return cached

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    trimmed,
  )}&langpair=en|ml`
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new Error(`Translation request failed: ${response.status}`)
  }

  const data: unknown = await response.json()
  const translated = extractTranslation(data)
  if (!translated) {
    throw new Error('No translation returned')
  }

  try {
    localStorage.setItem(cacheKey, translated)
  } catch {
    // localStorage full/unavailable — still return the translation.
  }
  return translated
}
