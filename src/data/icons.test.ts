import { describe, it, expect } from 'vitest'
import { existsSync } from 'node:fs'
import { ITEMS } from './items'

describe('generated icon assets', () => {
  it('has an SVG file for every item', () => {
    for (const item of ITEMS) {
      expect(existsSync(`public/assets/icons/${item.id}.svg`)).toBe(true)
    }
  })

  it('has an SVG file for the black hole', () => {
    expect(existsSync('public/assets/icons/black-hole.svg')).toBe(true)
  })
})
