import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import { join } from 'path'
import { app } from 'electron'
import fs from 'fs'
import { getPythonPath } from '../setup/firstRun'

interface TranscriptResult {
  text: string
  confidence: number
  is_question: boolean
  language: string
  latency_ms: number
  error?: string
  status?: string
}

export class STTEngine extends EventEmitter {
  private pythonProcess: ChildProcess | null = null
  private isRunning = false
  private lineBuffer = ''
  private modelReady = false

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isRunning) { resolve(); return }

      const pythonCmd = getPythonPath()
      if (!pythonCmd) {
        reject(new Error('Python not found. Please wait for first-run setup to complete.'))
        return
      }

      const scriptPath = app.isPackaged
        ? join(process.resourcesPath, 'python', 'stt_server.py')
        : join(__dirname, '../../../python/stt_server.py')

      console.log('[STT] Starting:', scriptPath)

      this.pythonProcess = spawn(pythonCmd, [scriptPath], { stdio: ['pipe', 'pipe', 'pipe'] })

      this.pythonProcess.stdout?.on('data', (data: Buffer) => {
        this.lineBuffer += data.toString('utf8')
        const lines = this.lineBuffer.split('\n')
        this.lineBuffer = lines.pop() ?? ''
        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue
          try {
            const result: TranscriptResult = JSON.parse(trimmed)
            if (result.status === 'loading') this.emit('status', 'loading')
            else if (result.status === 'ready') {
              this.modelReady = true
              this.isRunning = true
              this.emit('status', 'ready')
              resolve()
            } else if (result.error) this.emit('error', result.error)
            else if (result.text) this.emit('transcript', result)
          } catch { /* not JSON */ }
        }
      })

      this.pythonProcess.stderr?.on('data', (data: Buffer) => {
        const msg = data.toString()
        if (!msg.includes('Downloading') && !msg.includes('%|')) console.error('[STT]', msg)
      })

      this.pythonProcess.on('exit', () => {
        this.isRunning = false
        this.modelReady = false
        this.emit('status', 'stopped')
      })

      this.pythonProcess.on('error', reject)

      setTimeout(() => {
        if (!this.modelReady) reject(new Error('STT model load timeout (90s)'))
      }, 90000)
    })
  }

  sendAudio(buf: Buffer): void {
    if (this.isRunning && this.pythonProcess?.stdin) this.pythonProcess.stdin.write(buf)
  }

  stop(): void {
    this.pythonProcess?.kill()
    this.pythonProcess = null
    this.isRunning = false
    this.modelReady = false
  }

  isReady(): boolean { return this.modelReady }
}
