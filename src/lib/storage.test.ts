import { describe, expect, it } from 'vitest'
import { parseMealPlan, parseStringArray } from './storage'

describe('parseStringArray', () => {
  it('returns an empty array for null', () => {
    expect(parseStringArray(null, 'k')).toEqual([])
  })

  it('parses a valid string array', () => {
    expect(parseStringArray('["a","b"]', 'k')).toEqual(['a', 'b'])
  })

  it('rejects arrays with non-string items', () => {
    expect(parseStringArray('[1,2]', 'k')).toEqual([])
  })

  it('returns an empty array for invalid JSON', () => {
    expect(parseStringArray('not-json', 'k')).toEqual([])
  })
})

describe('parseMealPlan', () => {
  it('returns an empty plan for null', () => {
    const plan = parseMealPlan(null)
    expect(Object.keys(plan)).toHaveLength(7)
    expect(plan.Monday).toEqual([])
  })

  it('merges stored days and ignores unknown keys', () => {
    const plan = parseMealPlan(JSON.stringify({ Monday: ['a'], Nope: ['x'] }))
    expect(plan.Monday).toEqual(['a'])
    expect(plan.Tuesday).toEqual([])
    expect('Nope' in plan).toBe(false)
  })

  it('drops non-string entries in a day', () => {
    const plan = parseMealPlan(JSON.stringify({ Monday: ['a', 5] }))
    expect(plan.Monday).toEqual([])
  })

  it('returns an empty plan for invalid JSON', () => {
    const plan = parseMealPlan('broken')
    expect(plan.Sunday).toEqual([])
  })
})
