import { writeFileSync, mkdirSync } from 'node:fs'
import { ITEMS, TIERS } from '../src/data/items'

const outDir = new URL('../public/assets/icons/', import.meta.url)
mkdirSync(outDir, { recursive: true })

function tierColor(tierIndex: number): string {
  const tier = TIERS.find((t) => t.index === tierIndex)
  if (!tier) throw new Error(`Unknown tier index: ${tierIndex}`)
  return '#' + tier.color.toString(16).padStart(6, '0')
}

function iconSvg(glyph: string, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="${color}" stroke="#ffffff" stroke-width="2"/>
  <text x="32" y="41" font-size="26" text-anchor="middle" font-family="sans-serif">${glyph}</text>
</svg>
`
}

for (const item of ITEMS) {
  const svg = iconSvg(item.glyph, tierColor(item.tierIndex))
  writeFileSync(new URL(`${item.id}.svg`, outDir), svg, 'utf8')
}

const blackHoleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="hole" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="70%" stop-color="#1a0033"/>
      <stop offset="100%" stop-color="#6a0dad"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="30" fill="url(#hole)"/>
</svg>
`
writeFileSync(new URL('black-hole.svg', outDir), blackHoleSvg, 'utf8')

console.log(`Generated ${ITEMS.length} item icons + 1 black hole icon.`)
