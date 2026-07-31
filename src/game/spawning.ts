export interface SpawnWeight {
  tierIndex: number
  weight: number
}

export function getSpawnWeights(currentTier: number, totalTiers: number): SpawnWeight[] {
  const hasHazard = currentTier < totalTiers - 1
  const hasCleared = currentTier > 0

  let currentWeight = 70
  const hazardWeight = hasHazard ? 10 : 0
  let clearedTotalWeight = 100 - currentWeight - hazardWeight

  if (!hasCleared) {
    currentWeight += clearedTotalWeight
    clearedTotalWeight = 0
  }

  const weights: SpawnWeight[] = [{ tierIndex: currentTier, weight: currentWeight }]

  if (hasHazard) {
    weights.push({ tierIndex: currentTier + 1, weight: hazardWeight })
  }

  if (hasCleared) {
    const each = clearedTotalWeight / currentTier
    for (let t = 0; t < currentTier; t++) {
      weights.push({ tierIndex: t, weight: each })
    }
  }

  return weights
}

export function pickWeighted<T extends { weight: number }>(entries: T[], roll: number): T {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0)
  let target = roll * total
  for (const entry of entries) {
    if (target < entry.weight) return entry
    target -= entry.weight
  }
  return entries[entries.length - 1]
}

export function pickSpawnTier(currentTier: number, totalTiers: number, roll: number): number {
  const weights = getSpawnWeights(currentTier, totalTiers)
  return pickWeighted(weights, roll).tierIndex
}

export function pickItemIndexInTier(roll: number, itemsInTier = 5): number {
  return Math.floor(roll * itemsInTier)
}
