import { IpcMain, BrowserWindow } from 'electron'
import { AudioCaptureEngine } from '../audio/capture'
import { STTEngine } from '../stt/whisper'
import { streamAnswer } from '../ai/engine'
import { saveConversation, createSession } from '../database/db'
import { randomUUID } from 'crypto'

const audioEngine = new AudioCaptureEngine()
const sttEngine = new STTEngine()

let currentSessionId = randomUUID()
let isGenerating = false

export function setupAudioIPC(ipcMain: IpcMain, mainWindow: BrowserWindow): void {
  createSession(currentSessionId)

  ipcMain.handle('audio:start', async () => {
    try {
      mainWindow.webContents.send('stats:update', { status: 'loading' })

      await sttEngine.start()

      sttEngine.on('transcript', async (result) => {
        const { text, is_question, confidence, latency_ms } = result

        mainWindow.webContents.send('transcript:update', {
          text,
          isQuestion: is_question,
          confidence,
          latencyMs: latency_ms
        })

        mainWindow.webContents.send('stats:update', { sttLatencyMs: latency_ms })

        if (is_question && !isGenerating) {
          isGenerating = true
          mainWindow.webContents.send('stats:update', { isGenerating: true })
          try {
            const aiStart = Date.now()
            const answer = await streamAnswer({ question: text, sessionId: currentSessionId, mainWindow })
            saveConversation(currentSessionId, text, answer, latency_ms, Date.now() - aiStart)
          } finally {
            isGenerating = false
            mainWindow.webContents.send('stats:update', { isGenerating: false })
          }
        }
      })

      sttEngine.on('status', (status: string) => mainWindow.webContents.send('stats:update', { status }))
      sttEngine.on('error', (err: string) => mainWindow.webContents.send('stream:error', err))

      audioEngine.on('audio-chunk', (chunk: Buffer) => {
        if (sttEngine.isReady()) sttEngine.sendAudio(chunk)
      })
      audioEngine.on('error', (err: string) => mainWindow.webContents.send('stream:error', err))

      audioEngine.start()
      mainWindow.webContents.send('stats:update', { isListening: true, status: 'ready' })
      return { success: true }
    } catch (err: unknown) {
      const error = err as Error
      mainWindow.webContents.send('stream:error', error.message)
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('audio:stop', async () => {
    audioEngine.stop()
    sttEngine.stop()
    mainWindow.webContents.send('stats:update', { isListening: false, status: 'stopped' })
    return { success: true }
  })
}
