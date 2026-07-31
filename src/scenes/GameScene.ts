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
const HAZARD_KNOCKBACK_MS = 300
const ITEM_AWARENESS_RADIUS = 180
const ITEM_FLEE_SPEED = 140
const ITEM_CHASE_SPEED = 150

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
  private knockbackUntil = 0
  private background!: Phaser.GameObjects.Graphics

  constructor() {
    super('GameScene')
  }

  init(data: GameSceneData): void {
    this.hardMode = data.hardMode ?? false
  }

  create(): void {
    this.growth = new GrowthController(this.hardMode ? 2 : 3)
    this.discovery = new DiscoveryTracker()
    this.invulnerableUntil = 0
    this.knockbackUntil = 0

    const size = BASE_WORLD_SIZE
    this.physics.world.setBounds(0, 0, size, size)
    this.cameras.main.setBounds(0, 0, size, size)
    this.cameras.main.setZoom(zoomForTier(0))
    this.drawBackground(size)

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
    this.updateItemBehavior()

    if (this.time.now < this.knockbackUntil) return

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

  private updateItemBehavior(): void {
    const currentTier = this.growth.getState().currentTier

    this.itemsGroup.children.each((child) => {
      const sprite = child as Phaser.Physics.Arcade.Image
      const body = sprite.body as Phaser.Physics.Arcade.Body
      const tierIndex = sprite.getData('tierIndex') as number
      const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, this.blackHole.x, this.blackHole.y)

      if (distance >= ITEM_AWARENESS_RADIUS) {
        body.setVelocity(0, 0)
        return true
      }

      if (tierIndex <= currentTier) {
        const angle = Phaser.Math.Angle.Between(this.blackHole.x, this.blackHole.y, sprite.x, sprite.y)
        this.physics.velocityFromRotation(angle, ITEM_FLEE_SPEED, body.velocity)
      } else {
        const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, this.blackHole.x, this.blackHole.y)
        this.physics.velocityFromRotation(angle, ITEM_CHASE_SPEED, body.velocity)
      }
      return true
    })
  }

  private drawBackground(size: number): void {
    if (this.background) this.background.destroy()
    this.background = this.add.graphics()
    this.background.setDepth(-10)
    this.background.fillStyle(0x1c1840, 1)
    this.background.fillRect(0, 0, size, size)

    const dotCount = Math.floor((size * size) / 6000)
    for (let i = 0; i < dotCount; i++) {
      const x = Phaser.Math.Between(0, size)
      const y = Phaser.Math.Between(0, size)
      const r = Phaser.Math.Between(1, 3)
      this.background.fillStyle(0x2e2a5e, 0.6)
      this.background.fillCircle(x, y, r)
    }
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
    sprite.setCollideWorldBounds(true)
    sprite.setBounce(1, 1)
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
      this.knockbackUntil = this.time.now + HAZARD_KNOCKBACK_MS

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
    this.drawBackground(size)
  }
}
