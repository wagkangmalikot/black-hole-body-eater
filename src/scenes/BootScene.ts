import Phaser from 'phaser'
import { ITEMS } from '../data/items'

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene')
  }

  preload(): void {
    for (const item of ITEMS) {
      this.load.svg(item.id, `assets/icons/${item.id}.svg`, { width: 64, height: 64 })
    }
    this.load.svg('black-hole', 'assets/icons/black-hole.svg', { width: 40, height: 40 })
  }

  create(): void {
    this.scene.start('MenuScene')
  }
}
