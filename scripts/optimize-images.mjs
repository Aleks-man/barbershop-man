import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const originals = path.join(root, 'source-assets', 'originals')

const backgroundImages = [
  ['src-assets/barbershop-hero.png', 'src/assets/barbershop-hero.webp'],
  ['src-assets/masters-bg.png', 'src/assets/masters-bg.webp'],
  ['src-assets/services-bg-v2.png', 'src/assets/services-bg-v2.webp'],
  ['src-assets/booking-bg.png', 'src/assets/booking-bg.webp'],
]

async function ensureOutput(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

async function optimizeBackground([source, target]) {
  const input = path.join(originals, source)
  const output = path.join(root, target)

  await ensureOutput(output)
  await sharp(input)
    .rotate()
    .resize({
      width: 1920,
      withoutEnlargement: true,
    })
    .webp({
      quality: 86,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(output)
}

async function optimizeTransparentLogo() {
  const input = path.join(originals, 'public/gentlemansroom_full_logo_transparent.png')
  const output = path.join(root, 'public/gentlemansroom_full_logo_transparent.png')

  await sharp(input)
    .rotate()
    .resize({
      width: 1120,
      withoutEnlargement: true,
    })
    .png({
      compressionLevel: 9,
      palette: true,
      quality: 95,
    })
    .toFile(output)
}

async function optimizeTextLogo() {
  const input = path.join(originals, 'public/gentlemansroom_text_logo_transparent.png')
  const output = path.join(root, 'public/gentlemansroom_text_logo_transparent.png')

  await sharp(input)
    .rotate()
    .resize({
      width: 760,
      withoutEnlargement: true,
    })
    .png({
      compressionLevel: 9,
      palette: true,
      quality: 95,
    })
    .toFile(output)
}

async function optimizeFavicon() {
  const input = path.join(originals, 'public/favicon.png')
  const output = path.join(root, 'public/favicon.png')

  await sharp(input)
    .rotate()
    .resize({
      width: 96,
      height: 96,
      fit: 'contain',
      withoutEnlargement: true,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({
      compressionLevel: 9,
      palette: true,
      quality: 95,
    })
    .toFile(output)
}

await Promise.all(backgroundImages.map(optimizeBackground))
await optimizeTransparentLogo()
await optimizeTextLogo()
await optimizeFavicon()

console.log('Images optimized.')
