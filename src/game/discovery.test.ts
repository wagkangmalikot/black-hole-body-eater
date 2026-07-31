import { describe, it, expect, beforeEach } from 'vitest'
import { DiscoveryTracker } from './discovery'

describe('DiscoveryTracker', () => {
  let tracker: DiscoveryTracker

  beforeEach(() => {
    tracker = new DiscoveryTracker()
  })

  it('reports the first eat of an item as first-time', () => {
    expect(tracker.recordEat('water')).toEqual({ isFirstTime: true })
  })

  it('reports later eats of the same item as not first-time', () => {
    tracker.recordEat('water')
    expect(tracker.recordEat('water')).toEqual({ isFirstTime: false })
  })

  it('tracks distinct items independently', () => {
    tracker.recordEat('water')
    tracker.recordEat('glucose')
    expect(tracker.count()).toBe(2)
  })

  it('reports whether a specific item has been discovered', () => {
    expect(tracker.has('water')).toBe(false)
    tracker.recordEat('water')
    expect(tracker.has('water')).toBe(true)
  })

  it('resets back to empty', () => {
    tracker.recordEat('water')
    tracker.reset()
    expect(tracker.count()).toBe(0)
    expect(tracker.allIds()).toEqual([])
  })
})
