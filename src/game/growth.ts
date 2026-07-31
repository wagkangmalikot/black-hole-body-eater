export const TOTAL_TIERS = 55
export const EATS_PER_TIER = 3
export const HAZARD_PENALTY = 2

export type ContactKind = 'eat' | 'hazard'

export function resolveContact(itemTierIndex: number, currentTier: number): ContactKind {
  return itemTierIndex <= currentTier ? 'eat' : 'hazard'
}

export interface GrowthState {
  currentTier: number
  tierProgress: number
  hasWon: boolean
}

export class GrowthController {
  private state: GrowthState = { currentTier: 0, tierProgress: 0, hasWon: false }

  constructor(private readonly eatsPerTier: number = EATS_PER_TIER) {}

  getState(): GrowthState {
    return { ...this.state }
  }

  recordEat(itemTierIndex: number): { advanced: boolean; won: boolean } {
    if (this.state.hasWon) return { advanced: false, won: false }
    if (itemTierIndex !== this.state.currentTier) {
      return { advanced: false, won: false }
    }

    this.state.tierProgress += 1
    if (this.state.tierProgress < this.eatsPerTier) {
      return { advanced: false, won: false }
    }

    if (this.state.currentTier === TOTAL_TIERS - 1) {
      this.state.hasWon = true
      this.state.tierProgress = 0
      return { advanced: false, won: true }
    }

    this.state.currentTier += 1
    this.state.tierProgress = 0
    return { advanced: true, won: false }
  }

  recordHazard(): void {
    if (this.state.hasWon) return
    this.state.tierProgress = Math.max(0, this.state.tierProgress - HAZARD_PENALTY)
  }

  reset(startingTier = 0): void {
    this.state = { currentTier: startingTier, tierProgress: 0, hasWon: false }
  }
}
