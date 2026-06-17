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
  const size = 512
  const { data } = await sharp(input)
    .rotate()
    .resize({
      width: size,
      height: size,
      fit: 'cover',
      withoutEnlargement: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const background = Buffer.alloc(size * size * 4)
  const monogram = Buffer.alloc(size * size * 4)
  const center = (size - 1) / 2

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4
      const dx = (x - center) / center
      const dy = (y - center) / center
      const distance = Math.min(1, Math.sqrt(dx * dx + dy * dy))
      const vignette = distance ** 1.7
      const glow = Math.max(0, 1 - distance * 1.12)

      background[index] = Math.round(108 - vignette * 84 + glow * 6)
      background[index + 1] = Math.round(98 - vignette * 76 + glow * 4)
      background[index + 2] = Math.round(72 - vignette * 56 + glow * 3)
      background[index + 3] = 255

      const red = data[index]
      const green = data[index + 1]
      const blue = data[index + 2]
      const alpha = data[index + 3] / 255
      const luma = red * 0.2126 + green * 0.7152 + blue * 0.0722
      const ink = Math.max(0, Math.min(1, (176 - luma) / 132)) * alpha

      if (ink <= 0) {
        continue
      }

      const bevel = Math.max(0, Math.min(1, (luma - 46) / 132))
      monogram[index] = Math.round(22 + bevel * 132)
      monogram[index + 1] = Math.round(20 + bevel * 102)
      monogram[index + 2] = Math.round(16 + bevel * 58)
      monogram[index + 3] = Math.round(Math.min(1, ink * 1.08) * 255)
    }
  }

  for (let index = 0; index < background.length; index += 4) {
    const alpha = monogram[index + 3] / 255

    if (alpha <= 0) {
      continue
    }

    background[index] = Math.round(
      background[index] * (1 - alpha) + monogram[index] * alpha,
    )
    background[index + 1] = Math.round(
      background[index + 1] * (1 - alpha) + monogram[index + 1] * alpha,
    )
    background[index + 2] = Math.round(
      background[index + 2] * (1 - alpha) + monogram[index + 2] * alpha,
    )
  }

  await sharp(background, {
    raw: { width: size, height: size, channels: 4 },
  })
    .resize({ width: 96, height: 96, fit: 'contain' })
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
