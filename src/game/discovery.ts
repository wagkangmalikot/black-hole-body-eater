export class DiscoveryTracker {
  private discovered = new Set<string>()

  recordEat(itemId: string): { isFirstTime: boolean } {
    if (this.discovered.has(itemId)) {
      return { isFirstTime: false }
    }
    this.discovered.add(itemId)
    return { isFirstTime: true }
  }

  has(itemId: string): boolean {
    return this.discovered.has(itemId)
  }

  count(): number {
    return this.discovered.size
  }

  allIds(): string[] {
    return Array.from(this.discovered)
  }

  reset(): void {
    this.discovered.clear()
  }
}
