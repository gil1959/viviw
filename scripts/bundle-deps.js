/**
 * VIVIW Bundle Dependencies Script
 * Downloads and prepares Python embeddable + SoX for bundling
 * Run: node scripts/bundle-deps.js
 */
const https = require('https')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const AdmZip = require('adm-zip')

const projectRoot = path.join(__dirname, '..')
const vendorDir = path.join(projectRoot, 'vendor')
const pythonDir = path.join(vendorDir, 'python')
const soxDir = path.join(vendorDir, 'sox')

const PYTHON_EMBED_URL = 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip'
const PYTHON_EMBED_SHA256 = '009d6bf7e3b2ddca3d784fa09f90fe54336d5b60f0e0f305c37f400bf83cfd3b'
const PYTHON_GET_PIP_URL = 'https://bootstrap.pypa.io/get-pip.py'

const SOX_VERSION = '14.4.2'
const SOX_URL = `https://sourceforge.net/projects/sox/files/sox/${SOX_VERSION}/sox-${SOX_VERSION}-win64.zip/download`

function verifyChecksum(filePath, expectedHash) {
  if (!expectedHash) {
    console.log('  ⚠️  No checksum provided, skipping verification')
    return true
  }

  const fileBuffer = fs.readFileSync(filePath)
  const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex')

  if (hash !== expectedHash) {
    console.error(`  ❌ Checksum mismatch!`)
    console.error(`     Expected: ${expectedHash}`)
    console.error(`     Got:      ${hash}`)
    return false
  }

  console.log(`  ✅ Checksum verified: ${hash.substring(0, 16)}...`)
  return true
}

const DOWNLOAD_TIMEOUT_MS = 300000 // 5 minutes timeout

async function downloadFile(url, destPath) {
  console.log(`  Downloading: ${url}`)
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      fs.unlink(destPath, () => {})
      reject(new Error(`Download timeout after ${DOWNLOAD_TIMEOUT_MS / 1000}s: ${url}`))
    }, DOWNLOAD_TIMEOUT_MS)

    const file = fs.createWriteStream(destPath)
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        clearTimeout(timeout)
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject)
        return
      }
      response.pipe(file)
      file.on('finish', () => {
        clearTimeout(timeout)
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      clearTimeout(timeout)
      fs.unlink(destPath, () => {})
      reject(err)
    })
  })
}

async function setupPython() {
  console.log('\n[1/3] Setting up Python embeddable...')

  if (fs.existsSync(path.join(pythonDir, 'python.exe'))) {
    console.log('  Python already exists, skipping...')
    return
  }

  fs.mkdirSync(pythonDir, { recursive: true })

  // Download Python embeddable
  const zipPath = path.join(vendorDir, 'python-embed.zip')
  await downloadFile(PYTHON_EMBED_URL, zipPath)

  // Verify checksum
  if (!verifyChecksum(zipPath, PYTHON_EMBED_SHA256)) {
    fs.unlinkSync(zipPath)
    throw new Error('Python embeddable checksum verification failed!')
  }

  // Extract
  console.log('  Extracting Python...')
  const zip = new AdmZip(zipPath)
  zip.extractAllTo(pythonDir, true)
  fs.unlinkSync(zipPath)

  // Enable pip by uncommenting import site in python311._pth
  const pthFile = path.join(pythonDir, 'python311._pth')
  if (fs.existsSync(pthFile)) {
    let content = fs.readFileSync(pthFile, 'utf8')
    content = content.replace('#import site', 'import site')
    fs.writeFileSync(pthFile, content)
    console.log('  Enabled pip in python311._pth')
  }

  // Download get-pip.py
  const getPipPath = path.join(pythonDir, 'get-pip.py')
  await downloadFile(PYTHON_GET_PIP_URL, getPipPath)

  // Install pip
  console.log('  Installing pip...')
  execSync(`"${path.join(pythonDir, 'python.exe')}" "${getPipPath}" --no-warn-script-location`, {
    cwd: pythonDir,
    stdio: 'inherit'
  })

  // Install faster-whisper + dependencies (pinned version)
  console.log('  Installing faster-whisper (pinned v1.1.0)...')
  execSync(`"${path.join(pythonDir, 'python.exe')}" -m pip install faster-whisper==1.1.0 numpy --no-warn-script-location`, {
    cwd: pythonDir,
    stdio: 'inherit'
  })

  // Cleanup
  fs.unlinkSync(getPipPath)
  console.log('  Python setup complete!')
}

async function setupSox() {
  console.log('\n[2/3] Setting up SoX...')

  if (fs.existsSync(path.join(soxDir, 'sox.exe'))) {
    console.log('  SoX already exists, skipping...')
    return
  }

  fs.mkdirSync(soxDir, { recursive: true })

  // Download SoX
  const zipPath = path.join(vendorDir, 'sox.zip')
  await downloadFile(SOX_URL, zipPath)

  // Note: SoX from SourceForge has dynamic checksums, verify file size instead
  const stats = fs.statSync(zipPath)
  if (stats.size < 1000000) { // SoX zip should be > 1MB
    console.error(`  ❌ SoX download too small (${stats.size} bytes), likely error page`)
    fs.unlinkSync(zipPath)
    throw new Error('SoX download verification failed!')
  }
  console.log(`  ✅ SoX download size verified: ${(stats.size / 1024 / 1024).toFixed(1)}MB`)

  // Extract
  console.log('  Extracting SoX...')
  const zip = new AdmZip(zipPath)
  zip.extractAllTo(soxDir, true)

  // Move files from subfolder to soxDir
  const subDirs = fs.readdirSync(soxDir).filter(f => fs.statSync(path.join(soxDir, f)).isDirectory())
  if (subDirs.length > 0) {
    const srcDir = path.join(soxDir, subDirs[0])
    const files = fs.readdirSync(srcDir)
    files.forEach(file => {
      fs.renameSync(path.join(srcDir, file), path.join(soxDir, file))
    })
    fs.rmdirSync(srcDir)
  }

  fs.unlinkSync(zipPath)
  console.log('  SoX setup complete!')
}

async function main() {
  console.log('VIVIW Bundle Dependencies Script')
  console.log('================================\n')

  fs.mkdirSync(vendorDir, { recursive: true })

  await setupPython()
  await setupSox()

  console.log('\n[3/3] Verifying...')
  const pythonOk = fs.existsSync(path.join(pythonDir, 'python.exe'))
  const soxOk = fs.existsSync(path.join(soxDir, 'sox.exe'))

  console.log(`  Python: ${pythonOk ? '✅' : '❌'}`)
  console.log(`  SoX: ${soxOk ? '✅' : '❌'}`)

  if (pythonOk && soxOk) {
    console.log('\n✅ All dependencies bundled in vendor/')
    console.log('Run npm run dist:win to build portable .exe')
  } else {
    console.log('\n❌ Some dependencies failed to download')
    process.exit(1)
  }
}

main().catch(e => {
  console.error('Bundle failed:', e.message)
  process.exit(1)
})
