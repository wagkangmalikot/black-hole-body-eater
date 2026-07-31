import { describe, it, expect } from 'vitest'
import { getSpawnWeights, pickSpawnTier, pickItemIndexInTier } from './spawning'

describe('getSpawnWeights', () => {
  it('sums to 100 at every tier', () => {
    for (let tier = 0; tier < 11; tier++) {
      const weights = getSpawnWeights(tier, 11)
      const total = weights.reduce((sum, w) => sum + w.weight, 0)
      expect(total).toBeCloseTo(100)
    }
  })

  it('has only the current tier and a hazard tier at tier 0', () => {
    const weights = getSpawnWeights(0, 11)
    const tiers = weights.map((w) => w.tierIndex).sort()
    expect(tiers).toEqual([0, 1])
  })

  it('has no hazard tier at the final tier', () => {
    const weights = getSpawnWeights(10, 11)
    expect(weights.some((w) => w.tierIndex === 11)).toBe(false)
  })

  it('includes every cleared tier below the current tier', () => {
    const weights = getSpawnWeights(3, 11)
    const tiers = weights.map((w) => w.tierIndex)
    expect(tiers).toEqual(expect.arrayContaining([0, 1, 2, 3, 4]))
  })
})

describe('pickSpawnTier', () => {
  it('picks the current tier for a low roll', () => {
    expect(pickSpawnTier(3, 11, 0)).toBe(3)
  })

  it('never returns a tier more than one above current', () => {
    for (let roll = 0; roll < 1; roll += 0.05) {
      const tier = pickSpawnTier(3, 11, roll)
      expect(tier).toBeLessThanOrEqual(4)
    }
  })
})

describe('pickItemIndexInTier', () => {
  it('maps roll 0 to index 0 and roll just under 1 to the last index', () => {
    expect(pickItemIndexInTier(0)).toBe(0)
    expect(pickItemIndexInTier(0.999)).toBe(4)
  })
})
