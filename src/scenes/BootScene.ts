import Phaser from 'phaser'
import { ITEMS } from '../data/items'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload(): void {
    // Phaser's default loader.maxParallelDownloads (32) caps in-flight requests.
    // With 56 assets queued, the loader can stall permanently once the first
    // batch completes and the queue fails to refill (observed in real-browser
    // testing: 32/56 complete, then zero further network requests are issued).
    // Raising the cap comfortably above the asset count avoids the stall.
    this.load.maxParallelDownloads = 100
    for (const item of ITEMS) {
      this.load.svg(item.id, `assets/icons/${item.id}.svg`, { width: 64, height: 64 })
    }
    this.load.svg('black-hole', 'assets/icons/black-hole.svg', { width: 40, height: 40 })
  }

  create(): void {
    this.scene.start('MenuScene')
  }
}
