import { getSetting, getConversations } from '../database/db'
import { getUploadedFilesContent } from './parser'

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function buildPrompt(question: string, sessionId: string): Promise<Message[]> {
  const userName = getSetting('userName') || 'User'
  const resumeContent = await getResumeContent()
  const contextContent = await getContextContent()
  const history = getConversations(sessionId, 10) as Array<{ question: string; answer: string }>

  const systemParts = [
    `You are an AI interview assistant for ${userName}.`,
    'Answer interview questions concisely, naturally, and professionally.',
    'Keep answers under 3 paragraphs unless technical depth is needed.',
    'Respond in the same language as the question (Indonesian or English).',
    `Do NOT mention you are an AI — respond as ${userName}.`
  ]

  if (resumeContent) systemParts.push(`\n=== CANDIDATE RESUME ===\n${resumeContent}\n=== END RESUME ===`)
  if (contextContent) systemParts.push(`\n=== CONTEXT DOCUMENTS ===\n${contextContent}\n=== END CONTEXT ===`)

  const messages: Message[] = [{ role: 'system', content: systemParts.join('\n') }]

  for (const turn of history) {
    messages.push({ role: 'user', content: turn.question })
    messages.push({ role: 'assistant', content: turn.answer })
  }

  messages.push({ role: 'user', content: question })
  return messages
}

async function getResumeContent(): Promise<string> {
  try { return (await getUploadedFilesContent('resume')).slice(0, 8000) } catch { return '' }
}

async function getContextContent(): Promise<string> {
  try { return (await getUploadedFilesContent('context')).slice(0, 12000) } catch { return '' }
}
