export type StepDetail = {
  text: string
  method?: string
  methodIcon?: string
  time?: string
}

// Inferred cooking method from the step's wording. First match wins, so the
// more specific / higher-heat techniques are listed before the generic ones.
const METHOD_RULES: { icon: string; label: string; keywords: string[] }[] = [
  {
    icon: '🔥',
    label: 'Fry / Sear',
    keywords: [
      'deep-fry',
      'deep fry',
      'shallow-fry',
      'shallow fry',
      'stir-fry',
      'stir fry',
      'pan-fry',
      'fry',
      'sear',
      'saute',
      'sauté',
      'crisp',
      'brown',
      'char',
      'griddle',
      'temper',
      'splutter',
    ],
  },
  {
    icon: '🍞',
    label: 'Bake / Roast',
    keywords: ['bake', 'roast', 'broil', 'grill', 'oven'],
  },
  {
    icon: '💨',
    label: 'Steam',
    keywords: ['steam'],
  },
  {
    icon: '🍲',
    label: 'Simmer / Boil',
    keywords: [
      'simmer',
      'boil',
      'poach',
      'stew',
      'reduce',
      'blanch',
      'parboil',
      'pressure cook',
      'pressure-cook',
      'cook',
    ],
  },
  {
    icon: '🥣',
    label: 'Prep / Mix',
    keywords: [
      'whisk',
      'mix',
      'stir',
      'beat',
      'fold',
      'blend',
      'knead',
      'grind',
      'mash',
      'combine',
      'marinate',
      'coat',
      'season',
      'dredge',
      'chop',
      'slice',
      'cube',
      'crush',
      'dip',
      'spread',
      'pipe',
    ],
  },
  {
    icon: '❄️',
    label: 'Rest / Chill',
    keywords: [
      'rest',
      'chill',
      'refrigerate',
      'ferment',
      'soak',
      'cool',
      'overnight',
      'freeze',
      'set aside',
      'macerate',
    ],
  },
  {
    icon: '🍽️',
    label: 'Finish / Serve',
    keywords: [
      'serve',
      'garnish',
      'assemble',
      'plate',
      'drizzle',
      'sprinkle',
      'fill',
      'roll',
      'layer',
      'stuff',
      'top with',
    ],
  },
]

const TIME_REGEX = /(\d+(?:\.\d+)?)\s*(seconds?|secs?|minutes?|mins?|hours?|hrs?)/i

function normalizeUnit(unit: string): string {
  const lowered = unit.toLowerCase()
  if (lowered.startsWith('hour') || lowered.startsWith('hr')) return 'hr'
  if (lowered.startsWith('sec')) return 'sec'
  return 'min'
}

export function describeStep(text: string): StepDetail {
  const lowered = text.toLowerCase()

  let method: string | undefined
  let methodIcon: string | undefined
  for (const rule of METHOD_RULES) {
    if (rule.keywords.some((keyword) => lowered.includes(keyword))) {
      method = rule.label
      methodIcon = rule.icon
      break
    }
  }

  const match = TIME_REGEX.exec(text)
  const time = match ? `${match[1]} ${normalizeUnit(match[2])}` : undefined

  return { text, method, methodIcon, time }
}
