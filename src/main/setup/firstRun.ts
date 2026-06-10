/**
 * First-run setup: detect & install Python embeddable + SoX + faster-whisper
 * Runs in main process, communicates progress via IPC
 */
import { app } from 'electron'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'
import { execSync, spawn } from 'child_process'

const RUNTIME_DIR = join(app.getPath('userData'), 'viviw', 'runtime')
const PYTHON_DIR = join(RUNTIME_DIR, 'python')
const SOX_DIR = join(RUNTIME_DIR, 'sox')
const SETUP_DONE_FILE = join(RUNTIME_DIR, '.setup_complete')
const PYTHON_EMBED_URL = 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip'
const GET_PIP_URL = 'https://bootstrap.pypa.io/get-pip.py'

export interface SetupStep {
  id: string
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  progress?: number
  error?: string
}

export function isSetupComplete(): boolean {
  return existsSync(SETUP_DONE_FILE)
}

export function getPythonPath(): string {
  const bundledPython = join(PYTHON_DIR, 'python.exe')
  if (existsSync(bundledPython)) return bundledPython
  // Fallback to system Python
  for (const cmd of ['python', 'python3', 'py']) {
    try {
      const r = require('child_process').spawnSync(cmd, ['--version'])
      if (r.status === 0) return cmd
    } catch { /* try next */ }
  }
  return 'python'
}

export function getSoxPath(): string {
  const bundledSox = join(SOX_DIR, 'sox.exe')
  if (existsSync(bundledSox)) return bundledSox
  return 'sox' // fallback to system
}

export async function runSetup(
  onProgress: (step: SetupStep) => void
): Promise<void> {
  mkdirSync(RUNTIME_DIR, { recursive: true })

  // Step 1: Download Python embeddable
  await runStep(
    { id: 'python', label: 'Mengunduh Python 3.11...', status: 'running' },
    onProgress,
    () => downloadAndExtractPython()
  )

  // Step 2: Setup pip
  await runStep(
    { id: 'pip', label: 'Menyiapkan pip...', status: 'running' },
    onProgress,
    () => setupPip()
  )

  // Step 3: Install faster-whisper
  await runStep(
    { id: 'whisper', label: 'Menginstall faster-whisper (perlu internet)...', status: 'running' },
    onProgress,
    () => installFasterWhisper()
  )

  // Step 4: Setup SoX
  await runStep(
    { id: 'sox', label: 'Menyiapkan audio capture (SoX)...', status: 'running' },
    onProgress,
    () => setupSox()
  )

  // Mark complete
  writeFileSync(SETUP_DONE_FILE, new Date().toISOString())
  onProgress({ id: 'done', label: 'Setup selesai!', status: 'done' })
}

async function runStep(
  step: SetupStep,
  onProgress: (s: SetupStep) => void,
  fn: () => Promise<void>
): Promise<void> {
  onProgress({ ...step, status: 'running' })
  try {
    await fn()
    onProgress({ ...step, status: 'done' })
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err)
    onProgress({ ...step, status: 'error', error })
    throw err
  }
}

async function downloadAndExtractPython(): Promise<void> {
  if (existsSync(join(PYTHON_DIR, 'python.exe'))) return

  mkdirSync(PYTHON_DIR, { recursive: true })
  const zipPath = join(RUNTIME_DIR, 'python-embed.zip')

  // Download using PowerShell (always available on Windows 10+)
  execSync(
    `powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri '${PYTHON_EMBED_URL}' -OutFile '${zipPath}' -UseBasicParsing"`,
    { timeout: 120000 }
  )

  // Extract
  execSync(
    `powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${PYTHON_DIR}' -Force"`,
    { timeout: 60000 }
  )

  // Enable site-packages: remove "import site" comment from ._pth file
  const pthFiles = require('fs').readdirSync(PYTHON_DIR).filter((f: string) => f.endsWith('._pth'))
  for (const f of pthFiles) {
    const pthPath = join(PYTHON_DIR, f)
    let content = readFileSync(pthPath, 'utf8')
    content = content.replace('#import site', 'import site')
    writeFileSync(pthPath, content)
  }
}

async function setupPip(): Promise<void> {
  const pythonExe = join(PYTHON_DIR, 'python.exe')
  const pipPath = join(PYTHON_DIR, 'Scripts', 'pip.exe')
  if (existsSync(pipPath)) return

  const getPipPath = join(RUNTIME_DIR, 'get-pip.py')
  execSync(
    `powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri '${GET_PIP_URL}' -OutFile '${getPipPath}' -UseBasicParsing"`,
    { timeout: 30000 }
  )
  execSync(`"${pythonExe}" "${getPipPath}"`, { timeout: 60000 })
}

async function installFasterWhisper(): Promise<void> {
  const pipExe = join(PYTHON_DIR, 'Scripts', 'pip.exe')
  const fwPath = join(PYTHON_DIR, 'Lib', 'site-packages', 'faster_whisper')
  if (existsSync(fwPath)) return

  // Install faster-whisper --no-deps to avoid CUDA bloat
  // then install actual deps explicitly (no torch needed)
  execSync(
    `"${pipExe}" install faster-whisper==1.1.0 --no-deps`,
    { timeout: 120000 }
  )
  execSync(
    `"${pipExe}" install ctranslate2 huggingface_hub tokenizers onnxruntime av tqdm numpy`,
    { timeout: 600000 }
  )
}

async function setupSox(): Promise<void> {
  if (existsSync(join(SOX_DIR, 'sox.exe'))) return

  // Try system SoX first
  try {
    execSync('sox --version', { timeout: 5000 })
    return // system SoX works
  } catch { /* download bundled */ }

  mkdirSync(SOX_DIR, { recursive: true })

  // Download SoX portable Windows
  const soxZip = join(RUNTIME_DIR, 'sox.zip')
  const SOX_URL = 'https://sourceforge.net/projects/sox/files/sox/14.4.2/sox-14.4.2-win32.zip/download'
  execSync(
    `powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest -Uri '${SOX_URL}' -OutFile '${soxZip}' -UseBasicParsing"`,
    { timeout: 60000 }
  )
  execSync(
    `powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '${soxZip}' -DestinationPath '${SOX_DIR}' -Force"`,
    { timeout: 30000 }
  )

  // Find sox.exe in extracted dir
  const extracted = require('fs').readdirSync(SOX_DIR)
  for (const dir of extracted) {
    const soxExe = join(SOX_DIR, dir, 'sox.exe')
    if (existsSync(soxExe)) {
      require('fs').copyFileSync(soxExe, join(SOX_DIR, 'sox.exe'))
      break
    }
  }
}
