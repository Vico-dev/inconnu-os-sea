/*
  Fetch Klaro assets locally during build to avoid CDN/COEP issues.
  Downloads CSS and JS into public/vendor/klaro.
*/
const https = require('https')
const fs = require('fs')
const path = require('path')

const VERSION = process.env.KLARO_VERSION || '0.7.21'
const BASE_CDN = `https://app.unpkg.com/klaro@${VERSION}/files/dist`

const targets = [
  { url: `${BASE_CDN}/klaro.min.js`, dest: 'public/vendor/klaro/klaro.min.js' },
  { url: `${BASE_CDN}/klaro.min.css`, dest: 'public/vendor/klaro/klaro.min.css' },
]

function ensureDir(filePath) {
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    ensureDir(dest)
    const file = fs.createWriteStream(dest)
    https
      .get(url, res => {
        if (res.statusCode !== 200) {
          file.close()
          fs.unlink(dest, () => {})
          return reject(new Error(`Download failed ${url} → ${res.statusCode}`))
        }
        res.pipe(file)
        file.on('finish', () => file.close(resolve))
      })
      .on('error', err => {
        file.close()
        fs.unlink(dest, () => {})
        reject(err)
      })
  })
}

;(async () => {
  try {
    for (const t of targets) {
      await download(t.url, t.dest)
      console.log(`Klaro asset fetched: ${t.dest}`)
    }
  } catch (e) {
    console.error('Failed to fetch Klaro assets:', e.message)
    process.exit(0) // do not fail build
  }
})()


