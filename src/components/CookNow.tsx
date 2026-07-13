import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { tasteScore } from '../lib/appConfig'
import { loadRecipes } from '../data/loadRecipes'
import type { Recipe } from '../data/recipesTypes'
import { useTheme } from '../lib/useTheme'
import { ThemeToggle } from './ThemeToggle'
import { RecipeCover } from './RecipeCover'

const PANTRY_KEY = 'spice-route-cooknow-pantry'

// Basics most kitchens always have — optionally treated as "on hand" so the
// results aren't dominated by salt/water/oil.
const STAPLES = ['salt', 'water', 'oil', 'sugar', 'pepper']

// One-tap familiar kitchen ingredients, grouped by category.
const QUICK_GROUPS: { label: string; items: string[] }[] = [
  {
    label: 'Vegetables & herbs',
    items: [
      'onion',
      'tomato',
      'potato',
      'garlic',
      'ginger',
      'green chili',
      'carrot',
      'green beans',
      'cabbage',
      'bell pepper',
      'spinach',
      'cauliflower',
      'mushroom',
      'shallots',
      'spring onion',
      'lemon',
      'coriander',
      'mint',
      'curry leaves',
    ],
  },
  {
    label: 'Proteins',
    items: [
      'egg',
      'chicken',
      'fish',
      'prawns',
      'paneer',
      'mutton',
      'chickpeas',
      'toor dal',
      'moong dal',
      'black chickpeas',
    ],
  },
  {
    label: 'Dairy & staples',
    items: [
      'milk',
      'yogurt',
      'butter',
      'ghee',
      'cheese',
      'cream',
      'coconut',
      'coconut milk',
      'rice',
      'basmati rice',
      'wheat flour',
      'flour',
      'bread',
      'pasta',
      'noodles',
      'semolina',
      'besan',
      'poha',
      'oats',
    ],
  },
  {
    label: 'Spices & extras',
    items: [
      'turmeric',
      'mustard seeds',
      'cumin',
      'red chili powder',
      'coriander powder',
      'garam masala',
      'black pepper',
      'tamarind',
      'jaggery',
      'coconut oil',
      'honey',
      'soy sauce',
    ],
  },
]

function parseTokens(text: string): string[] {
  return text
    .split(/[,\n]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
}

type Analysis = {
  recipe: Recipe
  have: number
  missing: string[]
}

function analyze(recipe: Recipe, tokens: string[], assumeStaples: boolean): Analysis {
  const missing: string[] = []
  let have = 0

  for (const ingredient of recipe.ingredients) {
    const name = ingredient.name.toLowerCase()
    const matched = tokens.some((token) => name.includes(token) || token.includes(name))
    const isStaple = assumeStaples && STAPLES.some((staple) => name.includes(staple))
    if (matched || isStaple) {
      have += 1
    } else {
      missing.push(ingredient.name)
    }
  }

  return { recipe, have, missing }
}

export function CookNow() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [pantry, setPantry] = useState<string>(() => localStorage.getItem(PANTRY_KEY) ?? '')
  const [maxMissing, setMaxMissing] = useState(0)
  const [assumeStaples, setAssumeStaples] = useState(true)
  const [topPicks, setTopPicks] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    loadRecipes(controller.signal)
      .then((data) => {
        setRecipes(data)
        setLoadState('ready')
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        console.error(error)
        setLoadState('error')
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    localStorage.setItem(PANTRY_KEY, pantry)
  }, [pantry])

  const tokens = useMemo(() => parseTokens(pantry), [pantry])

  // Analyze every recipe against the pantry, sorted by fewest missing items.
  const analyzed = useMemo(() => {
    if (tokens.length === 0) return []
    return recipes
      .map((recipe) => analyze(recipe, tokens, assumeStaples))
      .sort(
        (a, b) =>
          a.missing.length - b.missing.length ||
          b.have / b.recipe.ingredients.length - a.have / a.recipe.ingredients.length ||
          tasteScore(b.recipe) - tasteScore(a.recipe),
      )
  }, [recipes, tokens, assumeStaples])

  const within = useMemo(
    () => analyzed.filter((item) => item.missing.length <= maxMissing),
    [analyzed, maxMissing],
  )

  const makeNowCount = useMemo(
    () => analyzed.filter((item) => item.missing.length === 0).length,
    [analyzed],
  )

  // If nothing fits the "allow missing" limit, fall back to the closest matches
  // so the page always shows something useful.
  const showClosest = within.length === 0 && analyzed.length > 0
  const displayed = showClosest ? analyzed.slice(0, 12) : within

  // Smart "top 10" ranking: favours dishes that use many of your ingredients
  // and need the fewest extras, with tastiness as a tie-breaker.
  const topPicksList = useMemo(() => {
    if (tokens.length === 0) return []
    const score = (item: Analysis) => {
      const used = tokens.filter((token) =>
        item.recipe.ingredients.some((ingredient) => {
          const name = ingredient.name.toLowerCase()
          return name.includes(token) || token.includes(name)
        }),
      ).length
      const haveRatio = item.have / item.recipe.ingredients.length
      return used * 2.5 + haveRatio * 3 - item.missing.length * 0.6 + tasteScore(item.recipe) * 0.4
    }
    return [...analyzed].sort((a, b) => score(b) - score(a)).slice(0, 10)
  }, [analyzed, tokens])

  const toggleQuickItem = (item: string) => {
    const current = parseTokens(pantry)
    const exists = current.includes(item)
    const next = exists ? current.filter((token) => token !== item) : [...current, item]
    setPantry(next.join(', '))
  }

  const activeTokens = new Set(tokens)

  return (
    <div className="app-shell cooknow-page">
      <div className="app-topbar">
        <Link to="/" className="brand-mini">
          🌿 SpiceRoute
        </Link>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <header className="cooknow-head">
        <Link to="/" className="back-link">
          ← Back to browse
        </Link>
        <h1>What can I cook right now?</h1>
        <p className="cooknow-intro">
          List what you already have and we&apos;ll show recipes you can make now — or that need
          just a couple more items.
        </p>
      </header>

      <div className="pantry-box">
        <label className="field">
          <span>Your ingredients</span>
          <textarea
            value={pantry}
            onChange={(event) => setPantry(event.target.value)}
            placeholder="e.g. rice, onion, coconut, curry leaves, egg"
            rows={3}
          />
        </label>

        <div className="staple-groups" aria-label="Quick add common items">
          {QUICK_GROUPS.map((group) => (
            <div className="staple-group" key={group.label}>
              <span className="chip-group-label">{group.label}</span>
              <div className="staple-chips">
                {group.items.map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`staple-chip ${activeTokens.has(item) ? 'on' : ''}`}
                    onClick={() => toggleQuickItem(item)}
                    aria-pressed={activeTokens.has(item)}
                  >
                    {activeTokens.has(item) ? '✓ ' : '+ '}
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="cooknow-controls">
          <label className="field control-inline">
            <span>Allow missing</span>
            <select
              value={maxMissing}
              onChange={(event) => setMaxMissing(Number(event.target.value))}
            >
              <option value={0}>0 — I can make it now</option>
              <option value={1}>Up to 1 item</option>
              <option value={2}>Up to 2 items</option>
              <option value={3}>Up to 3 items</option>
            </select>
          </label>

          <label className="staples-toggle">
            <input
              type="checkbox"
              checked={assumeStaples}
              onChange={(event) => setAssumeStaples(event.target.checked)}
            />
            <span>I have basics (salt, water, oil, sugar)</span>
          </label>

          <button
            type="button"
            className={`top-picks-btn ${topPicks ? 'on' : ''}`}
            onClick={() => setTopPicks((value) => !value)}
            disabled={tokens.length === 0}
          >
            {topPicks ? '← Show all matches' : '✨ Top 10 picks for me'}
          </button>

          {tokens.length > 0 && (
            <button type="button" className="link-btn" onClick={() => setPantry('')}>
              Clear
            </button>
          )}
        </div>
      </div>

      {loadState === 'loading' && <p className="empty">Loading recipes…</p>}
      {loadState === 'error' && <p className="empty">Could not load recipes. Please refresh.</p>}

      {loadState === 'ready' && (
        <>
          {tokens.length === 0 ? (
            <p className="empty cooknow-empty">
              Add a few ingredients above to see what you can cook.
            </p>
          ) : topPicks ? (
            <>
              <p className="cooknow-note">
                ✨ Top 10 dishes that best use your ingredients — ranked for you.
              </p>
              <section className="cooknow-results" aria-label="Top 10 recommended recipes">
                {topPicksList.map(({ recipe, have, missing }, index) => (
                  <article
                    key={recipe.id}
                    className="makenow-card ranked"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/recipe/${recipe.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/recipe/${recipe.id}`)
                      }
                    }}
                  >
                    <span className="pick-rank">#{index + 1}</span>
                    <RecipeCover recipe={recipe} className="grid-cover" />
                    <div className="makenow-body">
                      <h3>{recipe.title}</h3>
                      <p className="have-count">
                        You have {have}/{recipe.ingredients.length} ingredients
                      </p>
                      {missing.length === 0 ? (
                        <span className="makenow-ready">✅ Ready to cook</span>
                      ) : (
                        <div className="makenow-missing">
                          <span className="missing-label">Need:</span>
                          {missing.map((item) => (
                            <span key={item} className="missing-chip">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            </>
          ) : (
            <>
              <div className="cooknow-summary">
                <strong>{makeNowCount}</strong> ready to cook now
                {maxMissing > 0 && (
                  <>
                    {' · '}
                    <strong>{Math.max(0, within.length - makeNowCount)}</strong> almost there
                  </>
                )}
              </div>

              {showClosest && (
                <p className="cooknow-note">
                  No recipes fit that limit yet — here are the closest matches.
                </p>
              )}

              {displayed.length === 0 ? (
                <p className="empty cooknow-empty">
                  Nothing matches yet — try adding a few more ingredients.
                </p>
              ) : (
                <section className="cooknow-results" aria-label="Recipes you can make">
                  {displayed.map(({ recipe, have, missing }) => (
                    <article
                      key={recipe.id}
                      className="makenow-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/recipe/${recipe.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigate(`/recipe/${recipe.id}`)
                        }
                      }}
                    >
                      <RecipeCover recipe={recipe} className="grid-cover" />
                      <div className="makenow-body">
                        <h3>{recipe.title}</h3>
                        <p className="have-count">
                          You have {have}/{recipe.ingredients.length} ingredients
                        </p>
                        {missing.length === 0 ? (
                          <span className="makenow-ready">✅ Ready to cook</span>
                        ) : (
                          <div className="makenow-missing">
                            <span className="missing-label">Need:</span>
                            {missing.map((item) => (
                              <span key={item} className="missing-chip">
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
