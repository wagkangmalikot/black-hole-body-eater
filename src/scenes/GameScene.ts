import Phaser from 'phaser'
import { ITEMS } from '../data/items'
import { TOTAL_TIERS } from '../game/growth'
import { pickSpawnTier, pickItemIndexInTier } from '../game/spawning'

const BASE_WORLD_SIZE = 800
const BASE_RADIUS = 20
const MOVE_SPEED = 260
const MAX_ITEMS_ON_SCREEN = 30

function zoomForTier(tier: number): number {
  return Math.max(0.4, 1 - tier * 0.05)
}

interface GameSceneData {
  hardMode?: boolean
}

export class GameScene extends Phaser.Scene {
  protected hardMode = false
  protected blackHole!: Phaser.Physics.Arcade.Image
  protected itemsGroup!: Phaser.Physics.Arcade.Group
  protected currentTier = 0
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

    this.itemsGroup = this.physics.add.group()

    this.time.addEvent({
      delay: this.hardMode ? 200 : 300,
      loop: true,
      callback: () => this.spawnItem(),
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

  protected spawnItem(): void {
    if (this.itemsGroup.countActive(true) >= MAX_ITEMS_ON_SCREEN) return

    const tierIndex = pickSpawnTier(this.currentTier, TOTAL_TIERS, Math.random())
    const itemsInTier = ITEMS.filter((item) => item.tierIndex === tierIndex)
    const item = itemsInTier[pickItemIndexInTier(Math.random(), itemsInTier.length)]

    const bounds = this.physics.world.bounds
    const x = Phaser.Math.Between(bounds.x + 20, bounds.right - 20)
    const y = Phaser.Math.Between(bounds.y + 20, bounds.bottom - 20)

    const sprite = this.itemsGroup.create(x, y, item.id) as Phaser.Physics.Arcade.Image
    sprite.setCircle(32)
    sprite.setDisplaySize(28, 28)
    sprite.setData('itemId', item.id)
    sprite.setData('tierIndex', tierIndex)
  }
}
