import { chromium } from "playwright"
import { PNG } from "pngjs"
import pixelmatch from "pixelmatch"
import fs from "node:fs"
import path from "node:path"

const baseUrl = process.env.LINEUP_URL ?? "http://localhost:4200/lineup"
const outDir = process.argv[2] ?? "scripts/out"
const referencePath = "src/reference/lineup.png"

fs.mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1800, height: 1080 } })
await page.goto(baseUrl)
await page.addStyleTag({ content: "navbar, .topbar { display: none !important }" })
await page.evaluate(() => document.fonts.ready)
const box = await page.locator("app-lineup .lineup").boundingBox()
await page.screenshot({ path: path.join(outDir, "capture.png"), fullPage: true, clip: { x: box.x, y: box.y, width: 1800, height: 1080 } })

for (const width of [360, 768, 1280, 1920]) {
  await page.setViewportSize({ width, height: 900 })
  await page.locator("app-lineup .lineup").screenshot({ path: path.join(outDir, `capture-${width}.png`) })
}
await browser.close()

const reference = PNG.sync.read(fs.readFileSync(referencePath))
const capture = PNG.sync.read(fs.readFileSync(path.join(outDir, "capture.png")))
const { width, height } = reference
if (capture.width !== width || capture.height !== height) {
  console.error(`Size mismatch: capture ${capture.width}x${capture.height} vs reference ${width}x${height}`)
  process.exit(1)
}
const diff = new PNG({ width, height })
const mismatched = pixelmatch(reference.data, capture.data, diff.data, width, height, { threshold: 0.3 })
fs.writeFileSync(path.join(outDir, "diff.png"), PNG.sync.write(diff))
console.log(`diff: ${((mismatched / (width * height)) * 100).toFixed(2)}% pixels`)
