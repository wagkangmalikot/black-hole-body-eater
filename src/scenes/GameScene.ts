import Phaser from 'phaser'
import type { BodyItem } from '../data/items'
import { ITEMS, TIERS } from '../data/items'
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
const ITEM_IDLE_SPEED = 40

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

interface Star {
  x: number
  y: number
  r: number
  baseAlpha: number
  pulseSpeed: number
  pulsePhase: number
  color: number
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

  // Enhanced visual graphics layers
  private background!: Phaser.GameObjects.Graphics
  private gridGraphics!: Phaser.GameObjects.Graphics
  private itemGlowGraphics!: Phaser.GameObjects.Graphics
  private accretionGraphics!: Phaser.GameObjects.Graphics

  private stars: Star[] = []
  private currentWorldSize = BASE_WORLD_SIZE
  private accretionRotation = 0

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

    this.currentWorldSize = BASE_WORLD_SIZE
    const size = this.currentWorldSize
    this.physics.world.setBounds(0, 0, size, size)
    this.cameras.main.setBounds(0, 0, size, size)
    this.cameras.main.setZoom(zoomForTier(0))

    // Create graphics layers in order
    this.background = this.add.graphics().setDepth(-20)
    this.gridGraphics = this.add.graphics().setDepth(-15)
    this.itemGlowGraphics = this.add.graphics().setDepth(-2)
    this.accretionGraphics = this.add.graphics().setDepth(-1)

    this.setupStars(size)
    this.drawBackground(size)

    this.blackHole = this.physics.add.image(size / 2, size / 2, 'black-hole')
    this.blackHole.setCircle(BASE_RADIUS)
    this.blackHole.setDepth(5)
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

  update(_time: number, delta: number): void {
    this.updateItemBehavior()
    this.renderDynamicVisuals(delta)

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

  private setupStars(size: number): void {
    this.stars = []
    const starCount = Math.floor((size * size) / 5000)
    const starColors = [0xffffff, 0x8a2be2, 0x00f2fe, 0xff007f, 0xa6c0fe]

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Phaser.Math.Between(0, size),
        y: Phaser.Math.Between(0, size),
        r: Phaser.Math.FloatBetween(1, 3.5),
        baseAlpha: Phaser.Math.FloatBetween(0.3, 0.8),
        pulseSpeed: Phaser.Math.FloatBetween(1.5, 4.0),
        pulsePhase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      })
    }
  }

  private drawBackground(size: number): void {
    this.background.clear()

    // Space Void Dark Radial Gradient Base
    this.background.fillStyle(0x0a071b, 1)
    this.background.fillRect(0, 0, size, size)

    // Deep Space Nebula Patches
    const nebulaCenters = [
      { x: size * 0.25, y: size * 0.3, r: size * 0.35, color: 0x240046, alpha: 0.35 },
      { x: size * 0.75, y: size * 0.7, r: size * 0.4, color: 0x10002b, alpha: 0.4 },
      { x: size * 0.5, y: size * 0.5, r: size * 0.45, color: 0x3c096c, alpha: 0.25 },
    ]

    for (const neb of nebulaCenters) {
      this.background.fillStyle(neb.color, neb.alpha)
      this.background.fillCircle(neb.x, neb.y, neb.r)
    }

    // Grid Mesh
    this.gridGraphics.clear()
    const gridSize = 100
    this.gridGraphics.lineStyle(1, 0x5a189a, 0.12)
    for (let x = 0; x <= size; x += gridSize) {
      this.gridGraphics.lineBetween(x, 0, x, size)
    }
    for (let y = 0; y <= size; y += gridSize) {
      this.gridGraphics.lineBetween(0, y, size, y)
    }

    // Arena Perimeter Glowing Energy Barrier
    this.gridGraphics.lineStyle(4, 0x9d4edd, 0.7)
    this.gridGraphics.strokeRect(0, 0, size, size)
    this.gridGraphics.lineStyle(2, 0x00f2fe, 0.5)
    this.gridGraphics.strokeRect(4, 4, size - 8, size - 8)
  }

  private renderDynamicVisuals(delta: number): void {
    const timeSec = this.time.now / 1000

    // 1. Dynamic Twinkling Stars
    this.background.clear()
    this.background.fillStyle(0x0a071b, 1)
    this.background.fillRect(0, 0, this.currentWorldSize, this.currentWorldSize)

    // Re-draw Nebulas
    const size = this.currentWorldSize
    const neb1 = { x: size * 0.3, y: size * 0.3, r: size * 0.35, color: 0x240046, alpha: 0.35 }
    const neb2 = { x: size * 0.7, y: size * 0.7, r: size * 0.4, color: 0x3c096c, alpha: 0.25 }
    this.background.fillStyle(neb1.color, neb1.alpha)
    this.background.fillCircle(neb1.x, neb1.y, neb1.r)
    this.background.fillStyle(neb2.color, neb2.alpha)
    this.background.fillCircle(neb2.x, neb2.y, neb2.r)

    // Twinkling stars
    for (const star of this.stars) {
      const alpha = star.baseAlpha + Math.sin(timeSec * star.pulseSpeed + star.pulsePhase) * 0.25
      this.background.fillStyle(star.color, Phaser.Math.Clamp(alpha, 0.1, 0.95))
      this.background.fillCircle(star.x, star.y, star.r)
    }

    // 2. Accretion Disk Swirl around Black Hole
    this.accretionRotation += (delta / 1000) * 1.5
    this.accretionGraphics.clear()

    const currentRadius = radiusForTier(this.growth.getState().currentTier)
    const bhX = this.blackHole.x
    const bhY = this.blackHole.y

    // Outer Glowing Plasma Aura
    const isInvulnerable = this.time.now < this.invulnerableUntil
    const auraColor = isInvulnerable ? 0xff0055 : 0x8a2be2
    const pulseFactor = 1 + Math.sin(timeSec * 4) * 0.08

    this.accretionGraphics.fillStyle(auraColor, 0.18)
    this.accretionGraphics.fillCircle(bhX, bhY, (currentRadius + 16) * pulseFactor)

    this.accretionGraphics.fillStyle(0x00f2fe, 0.12)
    this.accretionGraphics.fillCircle(bhX, bhY, (currentRadius + 8) * pulseFactor)

    // Rotating Plasma Ring Rays
    this.accretionGraphics.lineStyle(2, auraColor, 0.6)
    for (let i = 0; i < 4; i++) {
      const angle = this.accretionRotation + (i * Math.PI) / 2
      const r1 = currentRadius + 4
      const r2 = currentRadius + 14
      this.accretionGraphics.lineBetween(
        bhX + Math.cos(angle) * r1,
        bhY + Math.sin(angle) * r1,
        bhX + Math.cos(angle) * r2,
        bhY + Math.sin(angle) * r2
      )
    }

    // 3. Tactical Item Glowing Halos
    this.itemGlowGraphics.clear()
    const currentTier = this.growth.getState().currentTier

    this.itemsGroup.children.each((child) => {
      const sprite = child as Phaser.Physics.Arcade.Image
      if (!sprite.active) return true

      const tierIndex = sprite.getData('tierIndex') as number
      const isEdible = tierIndex <= currentTier

      if (isEdible) {
        // Cyan / Green Edible Glow
        const pulse = 1 + Math.sin(timeSec * 3 + sprite.x) * 0.1
        this.itemGlowGraphics.fillStyle(0x00f2fe, 0.22)
        this.itemGlowGraphics.fillCircle(sprite.x, sprite.y, 22 * pulse)
        this.itemGlowGraphics.lineStyle(1.5, 0x00f2fe, 0.6)
        this.itemGlowGraphics.strokeCircle(sprite.x, sprite.y, 18 * pulse)
      } else {
        // Red / Magenta Hazard Glow
        const warningPulse = 1 + Math.sin(timeSec * 6 + sprite.y) * 0.15
        this.itemGlowGraphics.fillStyle(0xff0055, 0.28)
        this.itemGlowGraphics.fillCircle(sprite.x, sprite.y, 24 * warningPulse)
        this.itemGlowGraphics.lineStyle(2, 0xff0055, 0.85)
        this.itemGlowGraphics.strokeCircle(sprite.x, sprite.y, 20 * warningPulse)
      }

      // Gentle floating rotation
      sprite.setRotation(sprite.rotation + (delta / 1000) * 0.5)
      return true
    })
  }

  private updateItemBehavior(): void {
    const currentTier = this.growth.getState().currentTier

    this.itemsGroup.children.each((child) => {
      const sprite = child as Phaser.Physics.Arcade.Image
      const body = sprite.body as Phaser.Physics.Arcade.Body
      const tierIndex = sprite.getData('tierIndex') as number
      const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, this.blackHole.x, this.blackHole.y)

      if (distance >= ITEM_AWARENESS_RADIUS) {
        if (sprite.getData('wasAware')) {
          const idleAngle = Math.random() * Math.PI * 2
          this.physics.velocityFromRotation(idleAngle, ITEM_IDLE_SPEED, body.velocity)
        }
        sprite.setData('wasAware', false)
        return true
      }

      sprite.setData('wasAware', true)
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
    sprite.setDepth(2)
    sprite.setData('itemId', item.id)
    sprite.setData('tierIndex', tierIndex)
    sprite.setData('wasAware', false)

    const idleAngle = Math.random() * Math.PI * 2
    this.physics.velocityFromRotation(idleAngle, ITEM_IDLE_SPEED, (sprite.body as Phaser.Physics.Arcade.Body).velocity)
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

      // Camera Flash & Shake FX on Hazard Impact
      this.cameras.main.flash(200, 255, 0, 85)
      this.cameras.main.shake(200, 0.012)

      // Hazard burst effect
      this.createHazardSparks(itemSprite.x, itemSprite.y)

      const angle = Phaser.Math.Angle.Between(itemSprite.x, itemSprite.y, this.blackHole.x, this.blackHole.y)
      const body = this.blackHole.body as Phaser.Physics.Arcade.Body
      this.physics.velocityFromRotation(angle, MOVE_SPEED * 1.5, body.velocity)

      gameEvents.emit('progress-changed', this.growth.getState())
      return
    }

    const itemId = itemSprite.getData('itemId') as string
    const itemX = itemSprite.x
    const itemY = itemSprite.y
    itemSprite.destroy()

    // Trigger Eating Visual Particle Burst
    const tierColor = TIERS.find((t) => t.index === itemTierIndex)?.color ?? 0x00f2fe
    this.createEatBurst(itemX, itemY, tierColor)

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

  private createEatBurst(x: number, y: number, color: number): void {
    // Expanding Ripple Shockwave Ring
    const shockwave = this.add.graphics({ x, y }).setDepth(10)
    const ringState = { r: 5 }

    this.tweens.add({
      targets: ringState,
      r: 45,
      duration: 350,
      ease: 'Cubic.out',
      onUpdate: (tween) => {
        shockwave.clear()
        const currentR = ringState.r
        const currentAlpha = 1 - tween.progress
        shockwave.lineStyle(3, color, currentAlpha)
        shockwave.strokeCircle(0, 0, currentR)
        shockwave.lineStyle(1.5, 0xffffff, currentAlpha)
        shockwave.strokeCircle(0, 0, currentR * 0.7)
      },
      onComplete: () => shockwave.destroy(),
    })


    // Black hole micro bounce
    const scale = radiusForTier(this.growth.getState().currentTier) / BASE_RADIUS
    this.tweens.add({
      targets: this.blackHole,
      scaleX: scale * 1.18,
      scaleY: scale * 1.18,
      duration: 120,
      yoyo: true,
      ease: 'Quad.out',
    })
  }

  private createHazardSparks(x: number, y: number): void {
    const sparks = this.add.graphics({ x, y }).setDepth(10)
    this.tweens.add({
      targets: { progress: 0 },
      progress: 1,
      duration: 250,
      onUpdate: (tween) => {
        sparks.clear()
        const p = tween.progress
        const dist = p * 40
        const alpha = 1 - p
        sparks.lineStyle(2, 0xff0055, alpha)
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8
          sparks.lineBetween(
            Math.cos(angle) * (dist * 0.3),
            Math.sin(angle) * (dist * 0.3),
            Math.cos(angle) * dist,
            Math.sin(angle) * dist
          )
        }
      },
      onComplete: () => sparks.destroy(),
    })
  }

  private growWorld(tier: number): void {
    this.currentWorldSize = worldSizeForTier(tier)
    const size = this.currentWorldSize
    this.physics.world.setBounds(0, 0, size, size)
    this.cameras.main.setBounds(0, 0, size, size)
    this.cameras.main.zoomTo(zoomForTier(tier), 500)
    this.blackHole.setScale(radiusForTier(tier) / BASE_RADIUS)

    this.setupStars(size)
    this.drawBackground(size)
  }
}

