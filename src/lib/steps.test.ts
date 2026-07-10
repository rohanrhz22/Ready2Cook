import { describe, expect, it } from 'vitest'
import { describeStep } from './steps'

describe('describeStep', () => {
  it('extracts an explicit time and normalizes the unit', () => {
    const detail = describeStep('Soak kokum in warm water for 10 minutes.')
    expect(detail.time).toBe('10 min')
  })

  it('reads hours', () => {
    expect(describeStep('Ferment batter 8 hours until frothy.').time).toBe('8 hr')
  })

  it('infers a frying method', () => {
    expect(describeStep('Saute shallots until golden.').method).toBe('Fry / Sear')
  })

  it('infers a simmer method', () => {
    expect(describeStep('Simmer to a thick gravy.').method).toBe('Simmer / Boil')
  })

  it('infers a bake method', () => {
    expect(describeStep('Bake until the edges set.').method).toBe('Bake / Roast')
  })

  it('leaves time undefined when none is stated', () => {
    expect(describeStep('Season with salt and serve.').time).toBeUndefined()
  })
})
