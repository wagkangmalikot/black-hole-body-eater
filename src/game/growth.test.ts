import { describe, it, expect, beforeEach } from 'vitest'
import { GrowthController, resolveContact, EATS_PER_TIER, TOTAL_TIERS } from './growth'

describe('resolveContact', () => {
  it('is an eat when item tier is at or below current tier', () => {
    expect(resolveContact(0, 0)).toBe('eat')
    expect(resolveContact(2, 5)).toBe('eat')
  })

  it('is a hazard when item tier is above current tier', () => {
    expect(resolveContact(3, 2)).toBe('hazard')
  })
})

describe('GrowthController', () => {
  let growth: GrowthController

  beforeEach(() => {
    growth = new GrowthController()
  })

  it('starts at tier 0 with zero progress', () => {
    expect(growth.getState()).toEqual({ currentTier: 0, tierProgress: 0, hasWon: false })
  })

  it('increments progress on an eat matching the current tier', () => {
    growth.recordEat(0)
    expect(growth.getState().tierProgress).toBe(1)
  })

  it('does not add progress for eats from tiers below the current tier', () => {
    for (let i = 0; i < EATS_PER_TIER; i++) growth.recordEat(0)
    expect(growth.getState().currentTier).toBe(1)
    growth.recordEat(0)
    expect(growth.getState().tierProgress).toBe(0)
  })

  it('advances to the next tier after EATS_PER_TIER eats', () => {
    for (let i = 0; i < EATS_PER_TIER - 1; i++) {
      const result = growth.recordEat(0)
      expect(result.advanced).toBe(false)
    }
    const result = growth.recordEat(0)
    expect(result.advanced).toBe(true)
    expect(growth.getState()).toEqual({ currentTier: 1, tierProgress: 0, hasWon: false })
  })

  it('wins after clearing the final tier instead of advancing past it', () => {
    growth.reset(TOTAL_TIERS - 1)
    for (let i = 0; i < EATS_PER_TIER - 1; i++) growth.recordEat(TOTAL_TIERS - 1)
    const result = growth.recordEat(TOTAL_TIERS - 1)
    expect(result.won).toBe(true)
    expect(growth.getState().hasWon).toBe(true)
  })

  it('reduces progress by the hazard penalty, floored at zero', () => {
    growth.recordEat(0)
    growth.recordEat(0)
    growth.recordHazard()
    expect(growth.getState().tierProgress).toBe(0)
  })

  it('does not go below zero progress from repeated hazards', () => {
    growth.recordHazard()
    growth.recordHazard()
    expect(growth.getState().tierProgress).toBe(0)
  })

  it('does nothing once the game is won', () => {
    growth.reset(TOTAL_TIERS - 1)
    for (let i = 0; i < EATS_PER_TIER; i++) growth.recordEat(TOTAL_TIERS - 1)
    growth.recordEat(TOTAL_TIERS - 1)
    expect(growth.getState().hasWon).toBe(true)
    expect(growth.getState().tierProgress).toBe(0)
  })

  it('supports a custom eats-per-tier threshold for hard mode', () => {
    const fast = new GrowthController(2)
    fast.recordEat(0)
    const result = fast.recordEat(0)
    expect(result.advanced).toBe(true)
  })
})
