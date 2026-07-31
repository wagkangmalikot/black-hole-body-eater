import { writeFileSync, mkdirSync } from 'node:fs'
import { ITEMS, TIERS } from '../src/data/items'

const outDir = new URL('../public/assets/icons/', import.meta.url)
mkdirSync(outDir, { recursive: true })

function tierColorHex(tierIndex: number): string {
  const tier = TIERS.find((t) => t.index === tierIndex)
  if (!tier) throw new Error(`Unknown tier index: ${tierIndex}`)
  return '#' + tier.color.toString(16).padStart(6, '0')
}

// Generate category specific background accents
function categoryDecorations(categoryIndex: number, color: string): string {
  switch (categoryIndex) {
    case 0: // Subatomic: Quantum Orbit Rings
      return `
        <ellipse cx="32" cy="32" rx="26" ry="12" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.35" transform="rotate(30 32 32)"/>
        <ellipse cx="32" cy="32" rx="26" ry="12" fill="none" stroke="#00f2fe" stroke-width="1" opacity="0.35" transform="rotate(-30 32 32)"/>
      `
    case 1: // Atom: Atomic Shell Orbitals
      return `
        <circle cx="32" cy="32" r="25" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="3 3" opacity="0.4"/>
        <circle cx="32" cy="32" r="20" fill="none" stroke="${color}" stroke-width="1" opacity="0.5"/>
      `
    case 2: // Small Molecule: Molecular Nodes
      return `
        <circle cx="16" cy="16" r="3" fill="#ffffff" opacity="0.4"/>
        <circle cx="48" cy="16" r="3" fill="#ffffff" opacity="0.4"/>
        <line x1="16" y1="16" x2="48" y2="16" stroke="#ffffff" stroke-width="1" opacity="0.3"/>
      `
    case 3: // Macromolecule: Double Helix Wave
      return `
        <path d="M 10 32 Q 21 16 32 32 T 54 32" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.3"/>
      `
    case 4:
    case 5: // Organelles: Internal Membrane Ring
      return `
        <circle cx="32" cy="32" r="24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="6 3" opacity="0.45"/>
      `
    case 6:
    case 7: // Cells: Bio Membrane Border
      return `
        <circle cx="32" cy="32" r="26" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
        <circle cx="32" cy="32" r="23" fill="none" stroke="${color}" stroke-width="1" opacity="0.6"/>
      `
    case 8: // Tissue: Layered Fiber Mesh
      return `
        <path d="M 12 20 L 52 44 M 12 44 L 52 20" stroke="#ffffff" stroke-width="1.2" opacity="0.25"/>
      `
    case 9:
    case 10: // Organs: Vital Organ Aura Pulse Ring
      return `
        <circle cx="32" cy="32" r="27" fill="none" stroke="#ff007f" stroke-width="1.5" opacity="0.5"/>
        <circle cx="32" cy="32" r="24" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.6"/>
      `
    default:
      return ''
  }
}

function iconSvg(item: (typeof ITEMS)[0], color: string): string {
  const catIdx = Math.floor(item.tierIndex / 5)
  const decor = categoryDecorations(catIdx, color)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="bgGrad_${item.id}" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="25%" stop-color="${color}"/>
      <stop offset="85%" stop-color="#0a0518"/>
      <stop offset="100%" stop-color="#020108"/>
    </radialGradient>
    <linearGradient id="shine_${item.id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="shadow_${item.id}" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Outer Glow Shadow -->
  <circle cx="32" cy="32" r="29" fill="url(#bgGrad_${item.id})" filter="url(#shadow_${item.id})"/>
  
  <!-- Outer Neon Border Ring -->
  <circle cx="32" cy="32" r="29" fill="none" stroke="${color}" stroke-width="2" opacity="0.9"/>
  <circle cx="32" cy="32" r="28" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.6"/>

  <!-- Category Background Pattern -->
  ${decor}

  <!-- Glass Top Crescent Reflection -->
  <path d="M 12 24 A 22 22 0 0 1 52 24 A 27 27 0 0 0 12 24 Z" fill="url(#shine_${item.id})"/>

  <!-- Center Emoji Glyph -->
  <text x="32" y="41" font-size="25" text-anchor="middle" font-family="'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif" filter="url(#shadow_${item.id})">${item.glyph}</text>
</svg>
`
}

for (const item of ITEMS) {
  const svg = iconSvg(item, tierColorHex(item.tierIndex))
  writeFileSync(new URL(`${item.id}.svg`, outDir), svg, 'utf8')
}

// Epic Sci-Fi Black Hole Icon
const blackHoleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <radialGradient id="bhAura" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="45%" stop-color="#0b001a"/>
      <stop offset="70%" stop-color="#6a0dad"/>
      <stop offset="90%" stop-color="#00f2fe" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="singularity" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000"/>
      <stop offset="80%" stop-color="#050010"/>
      <stop offset="100%" stop-color="#9d4edd"/>
    </radialGradient>
    <linearGradient id="accretionRay" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f2fe"/>
      <stop offset="50%" stop-color="#ff007f"/>
      <stop offset="100%" stop-color="#7b2cbf"/>
    </linearGradient>
  </defs>

  <!-- Outer Cosmic Plasma Aura -->
  <circle cx="32" cy="32" r="31" fill="url(#bhAura)"/>

  <!-- Accretion Disk Swirling Rays -->
  <g stroke="url(#accretionRay)" stroke-width="2" stroke-linecap="round" opacity="0.85">
    <path d="M 6 32 C 12 18, 52 18, 58 32 C 52 46, 12 46, 6 32 Z" fill="none" transform="rotate(25 32 32)"/>
    <path d="M 10 32 C 16 22, 48 22, 54 32 C 48 42, 16 42, 10 32 Z" fill="none" stroke-width="1.5" transform="rotate(-35 32 32)"/>
  </g>

  <!-- Photonic Horizon Ring -->
  <circle cx="32" cy="32" r="16" fill="none" stroke="#00f2fe" stroke-width="2" opacity="0.9"/>
  <circle cx="32" cy="32" r="14" fill="url(#singularity)"/>
  
  <!-- Event Horizon Singularity Void -->
  <circle cx="32" cy="32" r="12" fill="#000000"/>
</svg>
`
writeFileSync(new URL('black-hole.svg', outDir), blackHoleSvg, 'utf8')

console.log(`Generated ${ITEMS.length} detailed 3D item icons + 1 accretion black hole icon.`)

