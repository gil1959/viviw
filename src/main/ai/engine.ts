import OpenAI from 'openai'
import { BrowserWindow } from 'electron'
import { getSetting } from '../database/db'
import { buildPrompt } from '../context/prompt'

export async function streamAnswer({
  question,
  sessionId,
  mainWindow
}: {
  question: string
  sessionId: string
  mainWindow: BrowserWindow
}): Promise<string> {
  const apiKey = getSetting('nineRouterApiKey') || 'placeholder'
  const model = getSetting('model') || 'kr/claude-sonnet-4.5'

  const client = new OpenAI({
    baseURL: 'http://localhost:20128/v1',
    apiKey,
    timeout: 30000,
    maxRetries: 2
  })

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
    console.log(`[AI] Done — ${fullAnswer.length} chars, first token: ${firstToken}ms`)
    return fullAnswer
  } catch (err: unknown) {
    const error = err as Error
    const msg = (error.message || '').includes('ECONNREFUSED')
      ? '9Router tidak berjalan. Jalankan: npx n9router — lalu buka http://localhost:20128'
      : error.message
    mainWindow.webContents.send('stream:error', msg)
    throw error
  }
}
