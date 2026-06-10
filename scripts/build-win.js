/**
 * VIVIW Windows Build Script
 * Uses electron-builder for portable .exe output
 * Config reads from electron-builder.yml (single source of truth)
 */
const path = require('path')
const fs = require('fs')
const { execSync } = require('child_process')
const { build, Platform, Arch } = require('electron-builder')

const projectRoot = path.join(__dirname, '..')

async function main() {
  console.log('\n[1/3] Building app bundle with electron-vite...')
  execSync('npx electron-vite build', { cwd: projectRoot, stdio: 'inherit' })

  console.log('\n[2/3] Copying extra resources...')
  const wasmSrc = path.join(projectRoot, 'node_modules/sql.js/dist/sql-wasm.wasm')
  const wasmDst = path.join(projectRoot, 'dist/main/sql-wasm.wasm')
  if (fs.existsSync(wasmSrc)) {
    fs.copyFileSync(wasmSrc, wasmDst)
    console.log('  Copied sql-wasm.wasm')
  }

  const pythonSrc = path.join(projectRoot, 'python')
  const pythonDst = path.join(projectRoot, 'dist/python')
  if (fs.existsSync(pythonSrc)) {
    fs.cpSync(pythonSrc, pythonDst, { recursive: true })
    console.log('  Copied python scripts')
  }

  console.log('\n[3/3] Packaging portable .exe with electron-builder...')
  // Config reads from electron-builder.yml (single source of truth)
  await build({
    projectDir: projectRoot,
    targets: Platform.WINDOWS.createTarget(['portable'], Arch.x64)
  })

  const releaseDir = path.join(projectRoot, 'release')
  const files = fs.readdirSync(releaseDir)
  const portableExe = files.find(f => f.endsWith('.exe'))

  if (portableExe) {
    const exePath = path.join(releaseDir, portableExe)
    const sizeMb = (fs.statSync(exePath).size / 1048576).toFixed(1)
    console.log(`\n✅ Build complete!`)
    console.log(`Portable EXE: ${exePath} (${sizeMb} MB)`)
    console.log(`\nTo run: double-click VIVIW-Portable.exe`)
  } else {
    console.log(`\n✅ Build complete! Check release/ folder`)
  }
}

main().catch(e => {
  console.error('❌ Build failed:', e.message)
  process.exit(1)
})
