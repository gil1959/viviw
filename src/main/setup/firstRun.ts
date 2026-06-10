/**
 * First-run setup: download Python embeddable + SoX + faster-whisper CPU-only
 * Runs in main process, communicates progress via IPC
 * All deps stored in userData/viviw-deps/
 */
import { app } from 'electron'
import { existsSync, mkdirSync, writeFileSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import { execSync, spawn } from 'child_process'
import https from 'https'
import http from 'http'

const RUNTIME_DIR = join(app.getPath('userData'), 'viviw-deps')
const PYTHON_DIR = join(RUNTIME_DIR, 'python')
const SOX_DIR = join(RUNTIME_DIR, 'sox')
const SETUP_DONE_FILE = join(RUNTIME_DIR, '.setup_complete')

const PYTHON_EMBED_URL = 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-embed-amd64.zip'
const PYTHON_EMBED_SHA256 = '009d6bf7e3b2ddca3d784fa09f90fe54336d5b60f0e0f305c37f400bf83cfd3b'
const GET_PIP_URL = 'https://bootstrap.pypa.io/get-pip.py'
const SOX_URLS = [
  'https://sourceforge.net/projects/sox/files/sox/14.4.2/sox-14.4.2-win64.zip/download',
  'https://downloads.sourceforge.net/project/sox/sox/14.4.2/sox-14.4.2-win64.zip',
]

export interface SetupStep {
  id: string
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  progress?: number      // 0-100
  downloadedMB?: string   // e.g. "12.5"
  totalMB?: string        // e.g. "25.0"
  error?: string
}

export function isSetupComplete(): boolean {
  return existsSync(SETUP_DONE_FILE)
}

export function getPythonPath(): string {
  const bundledPython = join(PYTHON_DIR, 'python.exe')
  if (existsSync(bundledPython)) return bundledPython
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
  return 'sox'
}

// ─── Download with progress ────────────────────────────────────────────────
function downloadWithProgress(
  url: string,
  dest: string,
  onProgress: (downloaded: number, total: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http
    const doRequest = (reqUrl: string) => {
      proto.get(reqUrl, (res) => {
        // Follow redirects
        if (res.statusCode === 301 || res.statusCode === 302) {
          const loc = res.headers.location
          if (loc) { doRequest(loc); return }
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${reqUrl}`))
          return
        }
        const total = parseInt(res.headers['content-length'] || '0', 10)
        let downloaded = 0
        const chunks: Buffer[] = []
        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk)
          downloaded += chunk.length
          onProgress(downloaded, total)
        })
        res.on('end', () => {
          const fs = require('fs') as typeof import('fs')
          fs.writeFileSync(dest, Buffer.concat(chunks))
          resolve()
        })
        res.on('error', reject)
      }).on('error', reject)
    }
    doRequest(url)
  })
}

function verifySHA256(filePath: string, expected: string): boolean {
  const crypto = require('crypto')
  const hash = crypto.createHash('sha256').update(readFileSync(filePath)).digest('hex')
  return hash === expected
}

// ─── Steps ─────────────────────────────────────────────────────────────────
export async function runSetup(
  onProgress: (step: SetupStep) => void
): Promise<void> {
  mkdirSync(RUNTIME_DIR, { recursive: true })

  const report = (s: SetupStep) => onProgress(s)

  // Step 1: Python embeddable
  report({ id: 'python', label: 'Mengunduh Python 3.11 embeddable...', status: 'running', progress: 0 })
  await downloadPython(report)
  report({ id: 'python', label: 'Python 3.11 terunduh ✅', status: 'done', progress: 100 })

  // Step 2: pip
  report({ id: 'pip', label: 'Menyiapkan pip...', status: 'running' })
  await setupPip()
  report({ id: 'pip', label: 'pip siap ✅', status: 'done' })

  // Step 3: faster-whisper (CPU-only, no torch)
  report({ id: 'whisper', label: 'Menginstall faster-whisper (CPU-only)...', status: 'running', progress: 0 })
  await installFasterWhisper(report)
  report({ id: 'whisper', label: 'faster-whisper terinstall ✅', status: 'done', progress: 100 })

  // Step 4: SoX
  report({ id: 'sox', label: 'Mengunduh SoX audio engine...', status: 'running', progress: 0 })
  await downloadSox(report)
  report({ id: 'sox', label: 'SoX terunduh ✅', status: 'done', progress: 100 })

  writeFileSync(SETUP_DONE_FILE, new Date().toISOString())
  report({ id: 'done', label: 'Setup selesai!', status: 'done' })
}

async function downloadPython(report: (s: SetupStep) => void): Promise<void> {
  if (existsSync(join(PYTHON_DIR, 'python.exe'))) return

  mkdirSync(PYTHON_DIR, { recursive: true })
  const zipPath = join(RUNTIME_DIR, 'python-embed.zip')

  await downloadWithProgress(PYTHON_EMBED_URL, zipPath, (dl, total) => {
    const pct = total > 0 ? Math.round((dl / total) * 100) : 0
    const dlMB = (dl / 1048576).toFixed(1)
    const totMB = total > 0 ? (total / 1048576).toFixed(1) : '?'
    report({ id: 'python', label: `Mengunduh Python 3.11 (${dlMB}/${totMB} MB)...`, status: 'running', progress: pct, downloadedMB: dlMB, totalMB: totMB })
  })

  // Verify SHA256
  if (!verifySHA256(zipPath, PYTHON_EMBED_SHA256)) {
    throw new Error('Python embed checksum mismatch!')
  }

  // Extract
  execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${PYTHON_DIR}' -Force"`, { timeout: 60000 })

  // Enable import site in ._pth
  const pthFiles = require('fs').readdirSync(PYTHON_DIR).filter((f: string) => f.endsWith('._pth'))
  for (const f of pthFiles) {
    const p = join(PYTHON_DIR, f)
    writeFileSync(p, readFileSync(p, 'utf8').replace('#import site', 'import site'))
  }

  require('fs').unlinkSync(zipPath)
}

async function setupPip(): Promise<void> {
  const pipPath = join(PYTHON_DIR, 'Scripts', 'pip.exe')
  if (existsSync(pipPath)) return

  const getPipPath = join(RUNTIME_DIR, 'get-pip.py')
  execSync(`powershell -NoProfile -Command "Invoke-WebRequest -Uri '${GET_PIP_URL}' -OutFile '${getPipPath}' -UseBasicParsing"`, { timeout: 30000 })
  execSync(`"${join(PYTHON_DIR, 'python.exe')}" "${getPipPath}"`, { timeout: 60000 })
}

async function installFasterWhisper(report: (s: SetupStep) => void): Promise<void> {
  const fwPath = join(PYTHON_DIR, 'Lib', 'site-packages', 'faster_whisper')
  if (existsSync(fwPath)) return

  const pipExe = join(PYTHON_DIR, 'Scripts', 'pip.exe')

  // faster-whisper --no-deps (avoid CUDA bloat from transitive deps)
  report({ id: 'whisper', label: 'Menginstall faster-whisper v1.1.0...', status: 'running', progress: 10 })
  execSync(`"${pipExe}" install faster-whisper==1.1.0 --no-deps`, { timeout: 120000 })

  // Install actual deps — CPU-only, NO torch
  report({ id: 'whisper', label: 'Mengunduh ctranslate2 + onnxruntime (CPU-only)...', status: 'running', progress: 30 })
  execSync(`"${pipExe}" install ctranslate2`, { timeout: 300000 })

  report({ id: 'whisper', label: 'Mengunduh huggingface_hub + tokenizers...', status: 'running', progress: 50 })
  execSync(`"${pipExe}" install huggingface_hub tokenizers`, { timeout: 120000 })

  report({ id: 'whisper', label: 'Mengunduh onnxruntime...', status: 'running', progress: 70 })
  execSync(`"${pipExe}" install onnxruntime`, { timeout: 300000 })

  report({ id: 'whisper', label: 'Mengunduh av + tqdm + numpy...', status: 'running', progress: 90 })
  execSync(`"${pipExe}" install av tqdm numpy`, { timeout: 120000 })
}

async function downloadSox(report: (s: SetupStep) => void): Promise<void> {
  if (existsSync(join(SOX_DIR, 'sox.exe'))) return

  mkdirSync(SOX_DIR, { recursive: true })
  const zipPath = join(RUNTIME_DIR, 'sox.zip')

  let lastErr: Error | null = null
  for (const url of SOX_URLS) {
    try {
      await downloadWithProgress(url, zipPath, (dl, total) => {
        const pct = total > 0 ? Math.round((dl / total) * 100) : 0
        const dlMB = (dl / 1048576).toFixed(1)
        report({ id: 'sox', label: `Mengunduh SoX (${dlMB} MB)...`, status: 'running', progress: pct })
      })
      break
    } catch (e) {
      lastErr = e as Error
    }
  }

  // Verify size (SoX zip should be > 1MB)
  const stats = statSync(zipPath)
  if (stats.size < 1000000) {
    throw new Error(`SoX download too small (${stats.size} bytes). ${lastErr?.message || ''}`)
  }

  // Extract
  execSync(`powershell -NoProfile -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${SOX_DIR}' -Force"`, { timeout: 30000 })

  // Find sox.exe in extracted subdirs
  const dirs = require('fs').readdirSync(SOX_DIR)
  for (const dir of dirs) {
    const soxExe = join(SOX_DIR, dir, 'sox.exe')
    if (existsSync(soxExe)) {
      require('fs').copyFileSync(soxExe, join(SOX_DIR, 'sox.exe'))
      break
    }
  }

  require('fs').unlinkSync(zipPath)
}
