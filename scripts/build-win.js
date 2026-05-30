/**
 * VIVIW Windows Build Script
 * Uses @electron/packager (no winCodeSign, no symlink issues)
 */
const { packager } = require('@electron/packager')
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')

const projectRoot = path.join(__dirname, '..')
const releaseDir = path.join(projectRoot, 'release')

async function main() {
  console.log('\n[1/3] Building app bundle with electron-vite...')
  execSync('npx electron-vite build', { cwd: projectRoot, stdio: 'inherit' })

  console.log('\n[2/3] Packaging with @electron/packager...')

  // Copy sql-wasm.wasm to dist so it's included
  const wasmSrc = path.join(projectRoot, 'node_modules/sql.js/dist/sql-wasm.wasm')
  const wasmDst = path.join(projectRoot, 'dist/main/sql-wasm.wasm')
  if (fs.existsSync(wasmSrc)) {
    fs.copyFileSync(wasmSrc, wasmDst)
    console.log('  Copied sql-wasm.wasm')
  }

  // Copy python scripts to dist
  const pythonSrc = path.join(projectRoot, 'python')
  const pythonDst = path.join(projectRoot, 'dist/python')
  if (fs.existsSync(pythonSrc)) {
    fs.cpSync(pythonSrc, pythonDst, { recursive: true })
    console.log('  Copied python scripts')
  }

  const appPaths = await packager({
    dir: projectRoot,
    name: 'VIVIW',
    platform: 'win32',
    arch: 'x64',
    out: releaseDir,
    overwrite: true,
    asar: true,
    ignore: [
      /^\/src\//,
      /^\/scripts\//,
      /^\/\.git\//,
      /^\/release\//,
      /node_modules\/@electron\/packager/,
      /node_modules\/electron-builder/,
      /node_modules\/app-builder-lib/,
      /\.ts$/,
      /\.map$/,
      /electron\.vite\.config/,
      /tailwind\.config/,
      /postcss\.config/,
    ],
    electronVersion: require(path.join(projectRoot, 'node_modules/electron/package.json')).version,
    appCopyright: 'Copyright © 2025 VIVIW',
    win32metadata: {
      FileDescription: 'VIVIW AI Interview Assistant',
      ProductName: 'VIVIW',
      InternalName: 'VIVIW',
    },
  })

  console.log('\n[3/3] Creating portable ZIP...')
  const unpackedDir = appPaths[0]
  const zipPath = path.join(releaseDir, 'VIVIW-win-x64.zip')

  try {
    execSync(
      `powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path '${unpackedDir}\\*' -DestinationPath '${zipPath}' -Force"`,
      { cwd: projectRoot, stdio: 'inherit' }
    )
    const sizeMb = (fs.statSync(zipPath).size / 1048576).toFixed(1)
    console.log(`\nBuild complete!`)
    console.log(`Portable ZIP: ${zipPath} (${sizeMb} MB)`)
    console.log(`App folder:   ${unpackedDir}`)
    console.log(`\nTo run: double-click VIVIW.exe in the app folder`)
  } catch {
    console.log(`\nBuild complete!`)
    console.log(`App folder: ${unpackedDir}`)
    console.log(`To run: double-click VIVIW.exe`)
  }
}

main().catch(e => {
  console.error('Build failed:', e.message)
  process.exit(1)
})
