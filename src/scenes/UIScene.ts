import Phaser from 'phaser'
import { gameEvents } from '../game/events'
import { ITEMS, TIERS, type BodyItem } from '../data/items'
import type { GrowthState } from '../game/growth'

export class UIScene extends Phaser.Scene {
  private tierText!: Phaser.GameObjects.Text
  private progressText!: Phaser.GameObjects.Text
  private discoveredText!: Phaser.GameObjects.Text
  private popupContainer!: Phaser.GameObjects.Container
  private logContainer!: Phaser.GameObjects.Container
  private discoveredIds: string[] = []

  constructor() {
    super('UIScene')
  }

  create(): void {
    this.discoveredIds = []

    this.tierText = this.add.text(16, 16, '', { fontSize: '18px', color: '#ffffff' })
    this.progressText = this.add.text(16, 40, '', { fontSize: '14px', color: '#cccccc' })
    this.discoveredText = this.add
      .text(this.scale.width - 16, 16, '', { fontSize: '14px', color: '#cccccc' })
      .setOrigin(1, 0)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleLog())

    this.popupContainer = this.add.container(0, 0).setVisible(false).setDepth(100)
    this.logContainer = this.add.container(0, 0).setVisible(false).setDepth(90)

    const onProgress = (state: GrowthState) => this.updateHud(state)
    const onDiscover = (item: BodyItem) => this.showPopup(item)

    gameEvents.on('progress-changed', onProgress)
    gameEvents.on('discover', onDiscover)

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      gameEvents.off('progress-changed', onProgress)
      gameEvents.off('discover', onDiscover)
    })

    this.updateHud({ currentTier: 0, tierProgress: 0, hasWon: false })
  }

  private updateHud(state: GrowthState): void {
    const tier = TIERS[state.currentTier]
    this.tierText.setText(`Tier ${state.currentTier + 1}/${TIERS.length}: ${tier.name}`)
    this.progressText.setText(`Progress: ${state.tierProgress} eaten`)
    this.discoveredText.setText(`Discovered: ${this.discoveredIds.length}/${ITEMS.length}`)
  }

  private showPopup(item: BodyItem): void {
    if (!this.discoveredIds.includes(item.id)) {
      this.discoveredIds.push(item.id)
    }
    this.discoveredText.setText(`Discovered: ${this.discoveredIds.length}/${ITEMS.length}`)

    this.popupContainer.removeAll(true)
    const { width, height } = this.scale

    const bg = this.add
      .rectangle(width / 2, height / 2, width - 60, 220, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0xffffff)
    const glyph = this.add.text(width / 2, height / 2 - 70, item.glyph, { fontSize: '40px' }).setOrigin(0.5)
    const name = this.add
      .text(width / 2, height / 2 - 20, item.name, { fontSize: '22px', color: '#ffffff' })
      .setOrigin(0.5)
    const fact = this.add
      .text(width / 2, height / 2 + 10, item.fact, {
        fontSize: '14px',
        color: '#cccccc',
        wordWrap: { width: width - 100 },
        align: 'center',
      })
      .setOrigin(0.5, 0)
    const button = this.add
      .text(width / 2, height / 2 + 90, 'Continue', {
        fontSize: '18px',
        color: '#ffffff',
        backgroundColor: '#333366',
        padding: { x: 16, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.popupContainer.setVisible(false)
        this.scene.resume('GameScene')
      })

    this.popupContainer.add([bg, glyph, name, fact, button])
    this.popupContainer.setVisible(true)
  }

  private toggleLog(): void {
    if (this.logContainer.visible) {
      this.logContainer.setVisible(false)
      return
    }

    this.logContainer.removeAll(true)
    const { width, height } = this.scale
    const bg = this.add
      .rectangle(width / 2, height / 2, width - 40, height - 120, 0x1a1a2e, 0.95)
      .setStrokeStyle(2, 0xffffff)
    const items = ITEMS.filter((item) => this.discoveredIds.includes(item.id))
    const lines = items.map((item) => `${item.glyph} ${item.name}`).join('\n')
    const text = this.add
      .text(width / 2, 70, lines || 'Nothing discovered yet', {
        fontSize: '14px',
        color: '#cccccc',
        wordWrap: { width: width - 80 },
      })
      .setOrigin(0.5, 0)

    this.logContainer.add([bg, text])
    this.logContainer.setVisible(true)
  }
}
