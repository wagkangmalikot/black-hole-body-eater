import Phaser from 'phaser'
import { ITEMS } from '../data/items'

interface WinSceneData {
  discoveredIds: string[]
  hardMode: boolean
}

export class WinScene extends Phaser.Scene {
  constructor() {
    super('WinScene')
  }

  create(data: WinSceneData): void {
    const { width, height } = this.scale

    this.add
      .text(width / 2, 30, "You've consumed the whole body!", {
        fontSize: '24px',
        color: '#ffffff',
        wordWrap: { width: width - 60 },
        align: 'center',
      })
      .setOrigin(0.5, 0)

    const discovered = ITEMS.filter((item) => data.discoveredIds.includes(item.id))
    const lines = discovered.map((item) => `${item.glyph} ${item.name}: ${item.fact}`)
    this.add
      .text(width / 2, 90, lines.join('\n\n') || 'No facts discovered this run.', {
        fontSize: '13px',
        color: '#cccccc',
        wordWrap: { width: width - 80 },
      })
      .setOrigin(0.5, 0)

    this.add
      .text(width / 2 - 90, height - 50, 'Restart', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#333366',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('GameScene', { hardMode: false })
        this.scene.launch('UIScene')
      })

    this.add
      .text(width / 2 + 90, height - 50, 'Keep Playing', {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#663333',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.start('GameScene', { hardMode: true })
        this.scene.launch('UIScene')
      })
  }
}
