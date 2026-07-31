import Phaser from 'phaser'

const BASE_WORLD_SIZE = 800
const BASE_RADIUS = 20
const MOVE_SPEED = 260

function zoomForTier(tier: number): number {
  return Math.max(0.4, 1 - tier * 0.05)
}

interface GameSceneData {
  hardMode?: boolean
}

export class GameScene extends Phaser.Scene {
  protected hardMode = false
  protected blackHole!: Phaser.Physics.Arcade.Image
  private pointerTarget = new Phaser.Math.Vector2()

  constructor() {
    super('GameScene')
  }

  init(data: GameSceneData): void {
    this.hardMode = data.hardMode ?? false
  }

  create(): void {
    const size = BASE_WORLD_SIZE
    this.physics.world.setBounds(0, 0, size, size)
    this.cameras.main.setBounds(0, 0, size, size)
    this.cameras.main.setZoom(zoomForTier(0))

    this.blackHole = this.physics.add.image(size / 2, size / 2, 'black-hole')
    this.blackHole.setCircle(BASE_RADIUS)
    this.pointerTarget.set(size / 2, size / 2)

    this.cameras.main.startFollow(this.blackHole, true, 0.08, 0.08)

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      this.pointerTarget.set(world.x, world.y)
    })
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown) return
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y)
      this.pointerTarget.set(world.x, world.y)
    })
  }

  update(): void {
    const body = this.blackHole.body as Phaser.Physics.Arcade.Body
    const distance = Phaser.Math.Distance.Between(
      this.blackHole.x,
      this.blackHole.y,
      this.pointerTarget.x,
      this.pointerTarget.y
    )
    if (distance < 4) {
      body.setVelocity(0, 0)
      return
    }
    const angle = Phaser.Math.Angle.Between(
      this.blackHole.x,
      this.blackHole.y,
      this.pointerTarget.x,
      this.pointerTarget.y
    )
    this.physics.velocityFromRotation(angle, MOVE_SPEED, body.velocity)
  }
}
