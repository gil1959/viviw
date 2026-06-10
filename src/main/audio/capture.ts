import { spawn, ChildProcess } from 'child_process'
import { EventEmitter } from 'events'
import path from 'path'
import fs from 'fs'
import { getSoxPath } from '../setup/firstRun'

export class AudioCaptureEngine extends EventEmitter {
  private recordingProcess: ChildProcess | null = null
  private isCapturing = false
  private silenceTimer: NodeJS.Timeout | null = null
  private audioBuffer: Buffer[] = []
  private readonly SILENCE_THRESHOLD = 500
  private readonly SAMPLE_RATE = 16000

  start(): void {
    if (this.isCapturing) return
    this.isCapturing = true
    this.startCapture()
    console.log('[Audio] Started capture')
  }

  stop(): void {
    if (!this.isCapturing) return
    this.isCapturing = false
    this.recordingProcess?.kill()
    this.recordingProcess = null
    if (this.silenceTimer) { clearTimeout(this.silenceTimer); this.silenceTimer = null }
    this.flushBuffer()
    console.log('[Audio] Stopped')
  }

  private startCapture(): void {
    // Windows WASAPI loopback via SoX
    const soxPath = getSoxPath()
    const args = ['-t', 'waveaudio', 'default', '-b', '16', '-c', '1', '-r', String(this.SAMPLE_RATE), '-t', 'raw', '-']
    try {
      this.recordingProcess = spawn(soxPath, args, { stdio: ['ignore', 'pipe', 'ignore'] })
      this.recordingProcess.stdout?.on('data', (chunk: Buffer) => this.handleChunk(chunk))
      this.recordingProcess.on('error', () => {
        this.emit('error', 'Audio capture: SoX not found. Please download SoX from https://sox.sourceforge.net and add to PATH.')
      })
    } catch {
      this.emit('error', 'Audio capture failed. SoX is required.')
    }
  }

  private handleChunk(chunk: Buffer): void {
    if (!this.isCapturing) return
    if (this.detectVoice(chunk)) {
      this.audioBuffer.push(chunk)
      if (this.silenceTimer) clearTimeout(this.silenceTimer)
      this.silenceTimer = setTimeout(() => this.flushBuffer(), this.SILENCE_THRESHOLD)
    }
  }

  private detectVoice(chunk: Buffer): boolean {
    let sum = 0
    for (let i = 0; i < chunk.length - 1; i += 2) sum += Math.abs(chunk.readInt16LE(i))
    return sum / (chunk.length / 2) > 200
  }

  private flushBuffer(): void {
    if (!this.audioBuffer.length) return
    const audio = Buffer.concat(this.audioBuffer)
    this.audioBuffer = []
    if (audio.length >= this.SAMPLE_RATE * 0.5 * 2) this.emit('audio-chunk', audio)
  }

  isActive(): boolean { return this.isCapturing }
}
