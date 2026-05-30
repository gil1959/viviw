import { readFileSync, existsSync } from 'fs'
import { extname } from 'path'
import { getUploadedFiles } from '../database/db'

interface UploadedFile {
  id: string
  name: string
  type: string
  path: string
  size: number
}

export async function parseFile(filePath: string): Promise<string> {
  if (!existsSync(filePath)) throw new Error(`File not found: ${filePath}`)
  const ext = extname(filePath).toLowerCase()
  switch (ext) {
    case '.pdf': {
      const pdfParse = require('pdf-parse')
      const result = await pdfParse(readFileSync(filePath))
      return result.text.trim()
    }
    case '.docx':
    case '.doc': {
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ path: filePath })
      return result.value.trim()
    }
    case '.txt':
    case '.md':
      return readFileSync(filePath, 'utf8')
    default:
      throw new Error(`Unsupported file type: ${ext}`)
  }
}

export async function getUploadedFilesContent(type: 'resume' | 'context'): Promise<string> {
  const files = (getUploadedFiles() as UploadedFile[]).filter((f) => f.type === type)
  const contents: string[] = []
  for (const file of files) {
    try {
      const content = await parseFile(file.path)
      contents.push(`[${file.name}]\n${content}`)
    } catch (err) {
      console.error('[Parser] Failed:', file.name, err)
    }
  }
  return contents.join('\n\n---\n\n')
}
