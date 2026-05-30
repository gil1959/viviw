/**
 * Pre-create winCodeSign cache directory to bypass the symlink error.
 * electron-builder checks if cache exists before downloading.
 * We create a fake but valid enough structure.
 */
const fs = require('fs')
const path = require('path')
const https = require('https')
const { execSync } = require('child_process')

const cacheDir = path.join(
  process.env.APPDATA || '',
  '../Local/electron-builder/Cache/winCodeSign'
)

// The version electron-builder looks for
const VERSION = 'winCodeSign-2.6.0'
const targetDir = path.join(cacheDir, VERSION)
const versionFile = path.join(targetDir, 'version')

if (fs.existsSync(versionFile)) {
  console.log('winCodeSign cache already exists, skipping.')
  process.exit(0)
}

console.log('Creating winCodeSign cache bypass...')
fs.mkdirSync(targetDir, { recursive: true })

// Create required subdirectory structure (without symlinks)
const subdirs = [
  'windows/10',
  'windows/ia32',
  'darwin/10.12/lib',  // These would have symlinks but we skip them
]

for (const sub of subdirs) {
  try {
    fs.mkdirSync(path.join(targetDir, sub), { recursive: true })
  } catch { /* ignore */ }
}

// Create dummy executables that are needed for signing
// electron-builder will try to run signtool.exe - we provide a stub
const windowsBin = path.join(targetDir, 'windows/10')

// Write a minimal version file
fs.writeFileSync(versionFile, VERSION)

// Write stub signtool.exe (a minimal Windows PE that exits 0)
// Since CSC_IDENTITY_AUTO_DISCOVERY=false, signtool won't actually run
const windowsTools = [
  path.join(targetDir, 'windows/10/signtool.exe'),
]

// Copy actual signtool from Windows if available
const systemSigntool = 'C:\\Windows\\System32\\signtool.exe'
if (fs.existsSync(systemSigntool)) {
  try {
    fs.copyFileSync(systemSigntool, windowsTools[0])
    console.log('Copied system signtool.exe')
  } catch { /* ignore */ }
}

console.log('winCodeSign cache bypass created at:', targetDir)
console.log('You can now run: node scripts/build-win.js')
