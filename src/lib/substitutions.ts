// India-friendly ingredient substitutions. Each entry maps a keyword found in an
// ingredient name to an easy-to-source swap, so cooks can make a recipe even when
// the original item is hard to find locally.

type Substitution = {
  match: string
  swap: string
}

// Ordered longest-match-first so more specific names win (e.g. "brown sugar"
// before "sugar", "sour cream" before "cream").
const SUBSTITUTIONS: Substitution[] = [
  { match: 'parmesan', swap: 'aged/grated processed cheese or dried paneer' },
  { match: 'pecorino romano', swap: 'grated processed cheese' },
  { match: 'mozzarella pearls', swap: 'diced fresh paneer' },
  { match: 'fresh mozzarella', swap: 'fresh paneer or Amul cheese' },
  { match: 'mozzarella', swap: 'grated Amul cheese or paneer' },
  { match: 'mascarpone', swap: 'thick malai or hung curd + cream' },
  { match: 'cream cheese', swap: 'thick hung curd + a little butter' },
  { match: 'ricotta', swap: 'crumbled fresh paneer' },
  { match: 'halloumi', swap: 'firm paneer (grilled)' },
  { match: 'feta', swap: 'crumbled salted paneer' },
  { match: 'sour cream', swap: 'thick hung curd (dahi)' },
  { match: 'heavy cream', swap: 'fresh malai or Amul cream' },
  { match: 'buttermilk', swap: 'thin curd + a splash of water' },
  { match: 'mirin', swap: 'rice vinegar + a pinch of sugar' },
  { match: 'oyster sauce', swap: 'soy sauce + a little sugar' },
  { match: 'gochujang', swap: 'red chili paste + a little jaggery' },
  { match: 'white miso', swap: 'a little salt + soy paste' },
  { match: 'miso paste', swap: 'a little salt + soy paste' },
  { match: 'tahini', swap: 'sesame (til) paste or peanut butter' },
  { match: 'quinoa', swap: 'broken wheat (dalia) or millet' },
  { match: 'gelatin', swap: 'agar-agar (china grass)' },
  { match: 'red curry paste', swap: 'chili + garlic + ginger + coriander paste' },
  { match: 'green curry paste', swap: 'green chili + coriander + ginger paste' },
  { match: 'curry paste', swap: 'chili + garlic + ginger paste' },
  { match: 'cayenne pepper', swap: 'Kashmiri or regular red chili powder' },
  { match: 'maple syrup', swap: 'honey or jaggery syrup' },
  { match: 'balsamic glaze', swap: 'reduced vinegar + a little sugar' },
  { match: 'brown sugar', swap: 'jaggery (gur) or regular sugar' },
  { match: 'arborio rice', swap: 'short-grain sona masoori rice' },
  { match: 'sushi rice', swap: 'short-grain rice' },
  { match: 'panko', swap: 'coarse fresh breadcrumbs or rava' },
  { match: 'thai basil', swap: 'regular basil or mint + coriander' },
  { match: 'lemongrass', swap: 'lemon zest + a little ginger' },
  { match: 'shallots', swap: 'small (sambar) onions or regular onion' },
  { match: 'shallot', swap: 'small (sambar) onion or regular onion' },
  { match: 'kokum', swap: 'tamarind or dried mango (amchur)' },
]

/** Returns an India-friendly swap for the given ingredient, or null if none. */
export function findSubstitution(ingredientName: string): string | null {
  const name = ingredientName.toLowerCase()
  for (const { match, swap } of SUBSTITUTIONS) {
    if (name.includes(match)) return swap
  }
  return null
}
