import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
  }

  create(): void {
    const { width, height } = this.scale

    this.add
      .text(width / 2, height / 2 - 40, 'Black Hole Body Eater', {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5)

    this.add
      .text(width / 2, height / 2 + 20, 'Tap to start', {
        fontSize: '20px',
        color: '#cccccc',
      })
      .setOrigin(0.5)

    this.input.once('pointerdown', () => {
      this.scene.start('GameScene', { hardMode: false })
    })
  }
}
