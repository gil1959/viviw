import OpenAI from 'openai'
import { BrowserWindow } from 'electron'
import { getSetting } from '../database/db'

export async function streamAnswer({
  question,
  sessionId,
  mainWindow
}: {
  question: string
  sessionId: string
  mainWindow: BrowserWindow
}): Promise<string> {
  const apiEndpoint = getSetting('apiEndpoint') || 'http://localhost:20128/v1'
  const apiKey = getSetting('apiKey') || 'placeholder'
  const model = getSetting('model') || 'kr/claude-sonnet-4.5'

  const client = new OpenAI({
    baseURL: apiEndpoint,
    apiKey,
    timeout: 30000,
    maxRetries: 2
  })

  const { buildPrompt } = await import('../context/prompt')
  const messages = await buildPrompt(question, sessionId)
  const startTime = Date.now()
  let fullAnswer = ''
  let firstToken = 0

  try {
    const stream = await client.chat.completions.create({
      model,
      max_tokens: 1024,
      stream: true,
      messages,
      temperature: 0.7
    })

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content || ''
      if (token) {
        if (!firstToken) firstToken = Date.now() - startTime
        fullAnswer += token
        mainWindow.webContents.send('stream:token', token)
      }
      if (chunk.choices[0]?.finish_reason === 'stop') break
    }

    mainWindow.webContents.send('stream:done', fullAnswer)
    mainWindow.webContents.send('stats:update', { aiFirstTokenMs: firstToken })
    return fullAnswer
  } catch (err: unknown) {
    const error = err as Error
    const msg = (error.message || '').includes('ECONNREFUSED')
      ? `Tidak bisa konek ke ${apiEndpoint}. Cek URL dan pastikan 9Router VPS aktif.`
      : error.message
    mainWindow.webContents.send('stream:error', msg)
    throw error
  }
}
