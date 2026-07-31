import { describe, it, expect } from 'vitest'
import { ITEMS, TIERS } from './items'

describe('body item data', () => {
  it('has 11 tiers', () => {
    expect(TIERS).toHaveLength(11)
  })

  it('has contiguous zero-based tier indices', () => {
    TIERS.forEach((tier, i) => expect(tier.index).toBe(i))
  })

  it('has exactly 55 items', () => {
    expect(ITEMS).toHaveLength(55)
  })

  it('has exactly 5 items per tier', () => {
    for (const tier of TIERS) {
      const count = ITEMS.filter((item) => item.tierIndex === tier.index).length
      expect(count).toBe(5)
    }
  })

  it('has unique item ids', () => {
    const ids = ITEMS.map((item) => item.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every item a non-empty name, glyph, and fact', () => {
    for (const item of ITEMS) {
      expect(item.name.length).toBeGreaterThan(0)
      expect(item.glyph.length).toBeGreaterThan(0)
      expect(item.fact.length).toBeGreaterThan(10)
    }
  })

  it('only references valid tier indices', () => {
    const validIndices = new Set(TIERS.map((t) => t.index))
    for (const item of ITEMS) {
      expect(validIndices.has(item.tierIndex)).toBe(true)
    }
  })
})
