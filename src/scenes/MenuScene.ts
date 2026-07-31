import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  private accretionRotation = 0
  private accretionGraphics!: Phaser.GameObjects.Graphics
  private starGraphics!: Phaser.GameObjects.Graphics

  constructor() {
    super('MenuScene')
  }

  create(): void {
    const { width, height } = this.scale

    // Space Deep Dark Background
    this.starGraphics = this.add.graphics()
    this.accretionGraphics = this.add.graphics()

    this.drawStarfield(width, height)

    // Central Animated Black Hole Preview
    const blackHoleSprite = this.add.image(width / 2, height / 2 - 40, 'black-hole').setDepth(5).setScale(1.5)

    // Pulsing animation on preview black hole
    this.tweens.add({
      targets: blackHoleSprite,
      scaleX: 1.65,
      scaleY: 1.65,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    // Sci-Fi Title
    this.add
      .text(width / 2, height / 2 - 170, 'BLACK HOLE', {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '36px',
        color: '#00f2fe',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 - 130, 'BODY EATER', {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '24px',
        color: '#8a2be2',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 35, 'Devour the human body from Quarks to Skin', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        color: '#cbd5e1',
      })
      .setOrigin(0.5)

    // How-to-Play Tactical Legend
    this.add
      .text(width / 2, height / 2 + 65, '🔵 Cyan Ring = Safe to Eat   |   🔴 Red Ring = Avoid Hazard', {
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        color: '#94a3b8',
      })
      .setOrigin(0.5)


    // Start Standard Button
    this.createButton(width / 2, height / 2 + 115, 'START GAME (NORMAL)', 0x8a2be2, 0x00f2fe, () => {
      this.scene.start('GameScene', { hardMode: false })
      this.scene.launch('UIScene')
    })

    // Start Hardcore Button
    this.createButton(width / 2, height / 2 + 165, 'HARDCORE MODE (FAST)', 0x4c0519, 0xff0055, () => {
      this.scene.start('GameScene', { hardMode: true })
      this.scene.launch('UIScene')
    })
  }

  update(_time: number, delta: number): void {
    const { width, height } = this.scale
    this.accretionRotation += (delta / 1000) * 1.5

    this.accretionGraphics.clear()
    const bhX = width / 2
    const bhY = height / 2 - 40
    const r = 35

    // Outer plasma aura
    this.accretionGraphics.fillStyle(0x8a2be2, 0.25)
    this.accretionGraphics.fillCircle(bhX, bhY, r + 20)

    this.accretionGraphics.lineStyle(2.5, 0x00f2fe, 0.7)
    for (let i = 0; i < 4; i++) {
      const angle = this.accretionRotation + (i * Math.PI) / 2
      this.accretionGraphics.lineBetween(
        bhX + Math.cos(angle) * (r + 5),
        bhY + Math.sin(angle) * (r + 5),
        bhX + Math.cos(angle) * (r + 25),
        bhY + Math.sin(angle) * (r + 25)
      )
    }
  }

  private drawStarfield(width: number, height: number): void {
    this.starGraphics.clear()
    this.starGraphics.fillStyle(0x090714, 1)
    this.starGraphics.fillRect(0, 0, width, height)

    const colors = [0xffffff, 0x00f2fe, 0x8a2be2, 0xff007f]
    for (let i = 0; i < 120; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const r = Phaser.Math.FloatBetween(1, 3)
      const alpha = Phaser.Math.FloatBetween(0.2, 0.85)
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
    const btnW = 240
    const btnH = 40

    const bg = this.add.graphics()
    bg.fillStyle(bgColor, 0.9)
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)
    bg.lineStyle(2, borderColor, 0.9)
    bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, 12)

    const label = this.add
      .text(0, 0, text, {
        fontFamily: 'Orbitron, sans-serif',
        fontSize: '13px',
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

