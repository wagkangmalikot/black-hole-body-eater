import Phaser from 'phaser'
import { gameEvents } from '../game/events'
import { ITEMS, TIERS, type BodyItem } from '../data/items'
import type { GrowthState } from '../game/growth'

export class UIScene extends Phaser.Scene {
  private hudBackground!: Phaser.GameObjects.Graphics
  private progressBarGraphics!: Phaser.GameObjects.Graphics
  private tierBadgeText!: Phaser.GameObjects.Text
  private progressValText!: Phaser.GameObjects.Text
  private discoveredPill!: Phaser.GameObjects.Container
  private discoveredPillText!: Phaser.GameObjects.Text
  private popupContainer!: Phaser.GameObjects.Container
  private logContainer!: Phaser.GameObjects.Container
  private discoveredIds: string[] = []

  constructor() {
    super('UIScene')
  }

  create(): void {
    this.discoveredIds = []

    // 1. HUD Panel Layer at Top
    this.hudBackground = this.add.graphics()
    this.progressBarGraphics = this.add.graphics()

    this.tierBadgeText = this.add.text(24, 16, '', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '15px',
      color: '#00f2fe',
      fontStyle: 'bold',
    })

    this.progressValText = this.add.text(24, 42, '', {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      color: '#e2e8f0',
    })

    // Discovered Pill (Top Right)
    this.discoveredPillText = this.add.text(0, 0, '📖 Discovered: 0/55', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5)

    const pillBg = this.add.graphics()
    const pillW = 170
    const pillH = 34
    pillBg.fillStyle(0x1a103c, 0.85)
    pillBg.fillRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 17)
    pillBg.lineStyle(1.5, 0x8a2be2, 0.7)
    pillBg.strokeRoundedRect(-pillW / 2, -pillH / 2, pillW, pillH, 17)

    this.discoveredPill = this.add
      .container(this.scale.width - 105, 30, [pillBg, this.discoveredPillText])
      .setSize(pillW, pillH)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.toggleLog())
      .on('pointerover', () => this.tweens.add({ targets: this.discoveredPill, scaleX: 1.05, scaleY: 1.05, duration: 100 }))
      .on('pointerout', () => this.tweens.add({ targets: this.discoveredPill, scaleX: 1, scaleY: 1, duration: 100 }))

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
    const { width } = this.scale

    // Draw Glass HUD Top Bar
    this.hudBackground.clear()
    this.hudBackground.fillStyle(0x0a071b, 0.75)
    this.hudBackground.fillRoundedRect(12, 10, width - 24, 60, 16)
    this.hudBackground.lineStyle(1.5, 0x3c096c, 0.6)
    this.hudBackground.strokeRoundedRect(12, 10, width - 24, 60, 16)

    // Update Tier Text
    const colorHex = '#' + tier.color.toString(16).padStart(6, '0')
    this.tierBadgeText.setText(`TIER ${state.currentTier + 1}: ${tier.name.toUpperCase()}`).setColor(colorHex)
    this.progressValText.setText(`Eaten: ${state.tierProgress} / 3`)
    this.discoveredPillText.setText(`📖 Codex: ${this.discoveredIds.length}/${ITEMS.length}`)

    // Draw XP Progress Bar
    this.progressBarGraphics.clear()
    const barX = 130
    const barY = 44
    const barW = Math.min(220, width - 330)
    const barH = 10

    if (barW > 40) {
      this.progressBarGraphics.fillStyle(0x1a103c, 0.9)
      this.progressBarGraphics.fillRoundedRect(barX, barY, barW, barH, 5)
      this.progressBarGraphics.lineStyle(1, 0x5a189a, 0.5)
      this.progressBarGraphics.strokeRoundedRect(barX, barY, barW, barH, 5)

      const fillRatio = state.tierProgress / 3
      if (fillRatio > 0) {
        this.progressBarGraphics.fillStyle(tier.color, 0.95)
        this.progressBarGraphics.fillRoundedRect(barX, barY, Math.max(8, barW * fillRatio), barH, 5)
      }
    }
  }

  private showPopup(item: BodyItem): void {
    if (!this.discoveredIds.includes(item.id)) {
      this.discoveredIds.push(item.id)
    }
    this.discoveredPillText.setText(`📖 Codex: ${this.discoveredIds.length}/${ITEMS.length}`)

    this.popupContainer.removeAll(true)
    const { width, height } = this.scale

    // Semi-transparent overlay backdrop
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x05030a, 0.7)

    const cardW = Math.min(420, width - 40)
    const cardH = 260
    const cardX = width / 2
    const cardY = height / 2

    // Card background
    const bg = this.add.graphics()
    bg.fillStyle(0x120c2a, 0.95)
    bg.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 20)
    bg.lineStyle(2, 0x00f2fe, 0.8)
    bg.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 20)

    // Header banner
    const titleText = this.add.text(cardX, cardY - cardH / 2 + 25, '✨ NEW DISCOVERY! ✨', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '16px',
      color: '#00f2fe',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    // Glyph
    const glyph = this.add.text(cardX, cardY - 45, item.glyph, { fontSize: '46px' }).setOrigin(0.5)

    // Item Name
    const name = this.add.text(cardX, cardY + 5, item.name, {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    // Fact Text
    const fact = this.add.text(cardX, cardY + 35, item.fact, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      color: '#cbd5e1',
      wordWrap: { width: cardW - 40 },
      align: 'center',
    }).setOrigin(0.5, 0)

    // Continue Button
    const btnW = 160
    const btnH = 38
    const btnY = cardY + cardH / 2 - 32

    const btnBg = this.add.graphics()
    btnBg.fillStyle(0x8a2be2, 0.9)
    btnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
    btnBg.lineStyle(1.5, 0x00f2fe, 0.8)
    btnBg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)

    const btnText = this.add.text(0, 0, 'CONTINUE', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const buttonContainer = this.add
      .container(cardX, btnY, [btnBg, btnText])
      .setSize(btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.popupContainer.setVisible(false)
        this.scene.resume('GameScene')
      })
      .on('pointerover', () => this.tweens.add({ targets: buttonContainer, scaleX: 1.06, scaleY: 1.06, duration: 100 }))
      .on('pointerout', () => this.tweens.add({ targets: buttonContainer, scaleX: 1, scaleY: 1, duration: 100 }))

    this.popupContainer.add([overlay, bg, titleText, glyph, name, fact, buttonContainer])
    this.popupContainer.setVisible(true)
  }

  private toggleLog(): void {
    if (this.logContainer.visible) {
      this.logContainer.setVisible(false)
      return
    }

    this.logContainer.removeAll(true)
    const { width, height } = this.scale

    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x05030a, 0.85)

    const modalW = Math.min(500, width - 30)
    const modalH = Math.min(600, height - 60)
    const modalX = width / 2
    const modalY = height / 2

    const bg = this.add.graphics()
    bg.fillStyle(0x120c2a, 0.98)
    bg.fillRoundedRect(modalX - modalW / 2, modalY - modalH / 2, modalW, modalH, 20)
    bg.lineStyle(2, 0x8a2be2, 0.8)
    bg.strokeRoundedRect(modalX - modalW / 2, modalY - modalH / 2, modalW, modalH, 20)

    const title = this.add.text(modalX, modalY - modalH / 2 + 25, '📖 DISCOVERY CODEX', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '18px',
      color: '#00f2fe',
      fontStyle: 'bold',
    }).setOrigin(0.5)

    const items = ITEMS.filter((item) => this.discoveredIds.includes(item.id))
    const lines = items.length
      ? items.map((item) => `${item.glyph}  ${item.name}`).join('\n\n')
      : 'No items discovered yet! Eat smaller objects to discover human anatomy.'

    const logText = this.add.text(modalX, modalY - modalH / 2 + 65, lines, {
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      color: '#e2e8f0',
      wordWrap: { width: modalW - 50 },
    }).setOrigin(0.5, 0)

    // Close Button
    const closeBtnText = this.add.text(modalX, modalY + modalH / 2 - 30, '✕ CLOSE', {
      fontFamily: 'Orbitron, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      backgroundColor: '#3c096c',
      padding: { x: 20, y: 8 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.logContainer.setVisible(false))

    this.logContainer.add([overlay, bg, title, logText, closeBtnText])
    this.logContainer.setVisible(true)
  }
}

