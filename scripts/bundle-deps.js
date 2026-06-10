/**
 * VIVIW Bundle Dependencies Script
 * Downloads and prepares Python embeddable + SoX for bundling
 * Run: node scripts/bundle-deps.js
 */
const https = require('https')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const AdmZip = require('adm-zip')

const projectRoot = path.join(__dirname, '..')
const vendorDir = path.join(projectRoot, 'vendor')
const pythonDir = path.join(vendorDir, 'python')
const soxDir = path.join(vendorDir, 'sox')

const PYTHON_EMBED_URL = 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip'
const PYTHON_GET_PIP_URL = 'https://bootstrap.pypa.io/get-pip.py'

const SOX_VERSION = '14.4.2'
const SOX_URL = `https://sourceforge.net/projects/sox/files/sox/${SOX_VERSION}/sox-${SOX_VERSION}-win64.zip/download`

async function downloadFile(url, destPath) {
  console.log(`  Downloading: ${url}`)
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath)
    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject)
        return
      }
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
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

  // Install faster-whisper + dependencies
  console.log('  Installing faster-whisper...')
  execSync(`"${path.join(pythonDir, 'python.exe')}" -m pip install faster-whisper numpy --no-warn-script-location`, {
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
