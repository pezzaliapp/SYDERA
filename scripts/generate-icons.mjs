/**
 * Deterministic PNG icon generator for SYDERA.
 *
 * The PWA manifest requires raster icons. Rather than adding an image
 * toolchain dependency, the mark is drawn analytically and encoded with
 * Node's built-in zlib. Output is byte-identical on every run.
 *
 * Mark: a thin orbit ring, a single warm body on the ring, and a horizon
 * rule. Restrained, geometric, no mystical decoration.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')

const BG = [11, 15, 22]
const LINE = [201, 212, 228]
const ACCENT = [232, 182, 76]

const SS = 4 // supersampling factor per axis

/** Signed coverage helpers operate in normalised unit space (0..1). */
function coverage(x, y, scale) {
  // Geometry in unit space, scaled about the centre (used for maskable safe zone).
  const sx = 0.5 + (x - 0.5) / scale
  const sy = 0.5 + (y - 0.5) / scale

  const cx = 0.5
  const cy = 0.455
  const ringR = 0.289
  const ringHalf = 0.0088

  const d = Math.hypot(sx - cx, sy - cy)
  if (Math.abs(d - ringR) <= ringHalf) return { color: LINE, alpha: 1 }

  const bodyX = 0.7045
  const bodyY = 0.2506
  if (Math.hypot(sx - bodyX, sy - bodyY) <= 0.0547) return { color: ACCENT, alpha: 1 }

  if (sy >= 0.8125 && sy <= 0.8242 && sx >= 0.1797 && sx <= 0.8203) {
    return { color: LINE, alpha: 0.45 }
  }
  return null
}

function renderPixels(size, scale) {
  const data = Buffer.alloc(size * size * 4)
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0
      let g = 0
      let b = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + 0.5) / SS) / size
          const y = (py + (sy + 0.5) / SS) / size
          const hit = coverage(x, y, scale)
          if (hit) {
            const a = hit.alpha
            r += hit.color[0] * a + BG[0] * (1 - a)
            g += hit.color[1] * a + BG[1] * (1 - a)
            b += hit.color[2] * a + BG[2] * (1 - a)
          } else {
            r += BG[0]
            g += BG[1]
            b += BG[2]
          }
        }
      }
      const n = SS * SS
      const o = (py * size + px) * 4
      data[o] = Math.round(r / n)
      data[o + 1] = Math.round(g / n)
      data[o + 2] = Math.round(b / n)
      data[o + 3] = 255
    }
  }
  return data
}

const CRC_TABLE = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, payload) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(payload.length, 0)
  const typed = Buffer.concat([Buffer.from(type, 'ascii'), payload])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typed), 0)
  return Buffer.concat([length, typed, crc])
}

function encodePng(size, rgba) {
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0 // filter type: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // colour type: RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(OUT_DIR, { recursive: true })

const targets = [
  { file: 'icon-192.png', size: 192, scale: 1 },
  { file: 'icon-512.png', size: 512, scale: 1 },
  { file: 'icon-maskable-512.png', size: 512, scale: 0.72 },
  { file: 'apple-touch-icon.png', size: 180, scale: 0.86 },
]

for (const target of targets) {
  const png = encodePng(target.size, renderPixels(target.size, target.scale))
  writeFileSync(join(OUT_DIR, target.file), png)
  process.stdout.write(`icon: ${target.file} (${png.length} bytes)\n`)
}
