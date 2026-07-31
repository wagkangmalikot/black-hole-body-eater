import Phaser from 'phaser'
import type { BodyItem } from '../data/items'
import { ITEMS } from '../data/items'
import { TOTAL_TIERS } from '../game/growth'
import { GrowthController, resolveContact } from '../game/growth'
import { DiscoveryTracker } from '../game/discovery'
import { gameEvents } from '../game/events'
import { pickSpawnTier, pickItemIndexInTier } from '../game/spawning'

const BASE_WORLD_SIZE = 800
const BASE_RADIUS = 20
const MOVE_SPEED = 260
const MAX_ITEMS_ON_SCREEN = 30
const WORLD_GROWTH_PER_TIER = 150
const RADIUS_GROWTH_PER_TIER = 6
const HAZARD_INVULNERABLE_MS = 1000

function zoomForTier(tier: number): number {
  return Math.max(0.4, 1 - tier * 0.05)
}

function worldSizeForTier(tier: number): number {
  return BASE_WORLD_SIZE + tier * WORLD_GROWTH_PER_TIER
}

function radiusForTier(tier: number): number {
  return BASE_RADIUS + tier * RADIUS_GROWTH_PER_TIER
}

interface GameSceneData {
  hardMode?: boolean
}

export class GameScene extends Phaser.Scene {
  protected hardMode = false
  protected blackHole!: Phaser.Physics.Arcade.Image
  protected itemsGroup!: Phaser.Physics.Arcade.Group
  private pointerTarget = new Phaser.Math.Vector2()
  private growth!: GrowthController
  private discovery!: DiscoveryTracker
  private invulnerableUntil = 0

  constructor() {
    super('GameScene')
  }

  init(data: GameSceneData): void {
    this.hardMode = data.hardMode ?? false
  }

  create(): void {
    this.growth = new GrowthController(this.hardMode ? 4 : 6)
    this.discovery = new DiscoveryTracker()
    this.invulnerableUntil = 0

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

    this.physics.add.overlap(this.blackHole, this.itemsGroup, (_hole, item) => {
      this.handleContact(item as Phaser.Physics.Arcade.Image)
    })

    gameEvents.emit('progress-changed', this.growth.getState())
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

    const tierIndex = pickSpawnTier(this.growth.getState().currentTier, TOTAL_TIERS, Math.random())
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

  private handleContact(itemSprite: Phaser.Physics.Arcade.Image): void {
    const itemTierIndex = itemSprite.getData('tierIndex') as number
    const currentTier = this.growth.getState().currentTier
    const outcome = resolveContact(itemTierIndex, currentTier)

    if (outcome === 'hazard') {
      if (this.time.now < this.invulnerableUntil) return
      this.growth.recordHazard()
      this.invulnerableUntil = this.time.now + HAZARD_INVULNERABLE_MS

      const angle = Phaser.Math.Angle.Between(itemSprite.x, itemSprite.y, this.blackHole.x, this.blackHole.y)
      const body = this.blackHole.body as Phaser.Physics.Arcade.Body
      this.physics.velocityFromRotation(angle, MOVE_SPEED * 1.5, body.velocity)

      gameEvents.emit('progress-changed', this.growth.getState())
      return
    }

    const itemId = itemSprite.getData('itemId') as string
    itemSprite.destroy()

    const discoveryResult = this.discovery.recordEat(itemId)
    const eatResult = this.growth.recordEat(itemTierIndex)

    if (eatResult.won) {
      this.scene.stop('UIScene')
      this.scene.start('WinScene', { discoveredIds: this.discovery.allIds(), hardMode: this.hardMode })
      return
    }

    if (eatResult.advanced) {
      this.growWorld(this.growth.getState().currentTier)
    }

    gameEvents.emit('progress-changed', this.growth.getState())

    if (discoveryResult.isFirstTime) {
      const item = ITEMS.find((candidate) => candidate.id === itemId) as BodyItem
      this.scene.pause()
      gameEvents.emit('discover', item)
    }
  }

  private growWorld(tier: number): void {
    const size = worldSizeForTier(tier)
    this.physics.world.setBounds(0, 0, size, size)
    this.cameras.main.setBounds(0, 0, size, size)
    this.cameras.main.zoomTo(zoomForTier(tier), 500)
    this.blackHole.setScale(radiusForTier(tier) / BASE_RADIUS)
  }
}
