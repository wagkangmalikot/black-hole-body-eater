import Phaser from 'phaser'
import { ITEMS } from '../data/items'

interface WinSceneData {
  discoveredIds: string[]
  hardMode: boolean
}

export class WinScene extends Phaser.Scene {
  private starGraphics!: Phaser.GameObjects.Graphics

  constructor() {
    super('WinScene')
  }

  create(data: WinSceneData): void {
    const { width, height } = this.scale

    // Space Victory Background with Confetti Stars
    this.starGraphics = this.add.graphics()
    this.drawVictoryBackground(width, height)

    // Victory Title
    this.add
      .text(width / 2, 35, '🏆 TOTAL COSMIC CONSUMPTION! 🏆', {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '22px',
        color: '#00f2fe',
        fontStyle: 'bold',
        align: 'center',
      })
      .setOrigin(0.5, 0)

    this.add
      .text(width / 2, 70, "You have devoured the human body from subatomic quarks to skin!", {
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        color: '#cbd5e1',
        align: 'center',
      })
      .setOrigin(0.5, 0)

    // Discovered Items Codex Card
    const cardW = Math.min(520, width - 40)
    const cardH = height - 200
    const cardX = width / 2
    const cardY = height / 2 - 10

    const cardBg = this.add.graphics()
    cardBg.fillStyle(0x120c2a, 0.92)
    cardBg.fillRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 16)
    cardBg.lineStyle(1.5, 0x8a2be2, 0.8)
    cardBg.strokeRoundedRect(cardX - cardW / 2, cardY - cardH / 2, cardW, cardH, 16)

    const discovered = ITEMS.filter((item) => data.discoveredIds.includes(item.id))
    const lines = discovered.map((item) => `${item.glyph} ${item.name}: ${item.fact}`)

    this.add
      .text(cardX, cardY - cardH / 2 + 20, lines.join('\n\n') || 'No facts discovered this run.', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        color: '#e2e8f0',
        wordWrap: { width: cardW - 40 },
      })
      .setOrigin(0.5, 0)

    // Action Buttons
    this.createButton(width / 2 - 110, height - 50, 'RESTART NORMAL', 0x3c096c, 0x00f2fe, () => {
      this.scene.start('GameScene', { hardMode: false })
      this.scene.launch('UIScene')
    })

    this.createButton(width / 2 + 110, height - 50, 'HARDCORE MODE', 0x4c0519, 0xff0055, () => {
      this.scene.start('GameScene', { hardMode: true })
      this.scene.launch('UIScene')
    })
  }

  private drawVictoryBackground(width: number, height: number): void {
    this.starGraphics.clear()
    this.starGraphics.fillStyle(0x090714, 1)
    this.starGraphics.fillRect(0, 0, width, height)

    const colors = [0xffd700, 0x00f2fe, 0x8a2be2, 0xff007f, 0xffffff]
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const r = Phaser.Math.FloatBetween(1, 4)
      const alpha = Phaser.Math.FloatBetween(0.3, 0.95)
      const color = colors[Math.floor(Math.random() * colors.length)]
      this.starGraphics.fillStyle(color, alpha)
      this.starGraphics.fillCircle(x, y, r)
    }
  }

  private createButton(
    x: number,
    y: number,
    text: string,
    bgColor: number,
    borderColor: number,
    callback: () => void
  ): void {
    const btnW = 180
    const btnH = 40

    const bg = this.add.graphics()
    bg.fillStyle(bgColor, 0.9)
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
    bg.lineStyle(2, borderColor, 0.9)
    bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)

    const label = this.add
      .text(0, 0, text, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    const container = this.add
      .container(x, y, [bg, label])
      .setSize(btnW, btnH)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', callback)
      .on('pointerover', () => this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 }))
      .on('pointerout', () => this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 }))
  }
}

