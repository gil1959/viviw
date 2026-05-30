import { IpcMain, BrowserWindow, dialog } from 'electron'
import { copyFileSync, mkdirSync, statSync } from 'fs'
import { join, basename } from 'path'
import { app } from 'electron'
import { randomUUID } from 'crypto'
import {
  saveUploadedFile,
  getUploadedFiles,
  removeUploadedFile,
  getConversations,
  clearAllConversations
} from '../database/db'

export function setupFileIPC(ipcMain: IpcMain, _mainWindow: BrowserWindow): void {
  ipcMain.handle('context:upload', async (_, type: 'resume' | 'context') => {
    const result = await dialog.showOpenDialog({
      title: type === 'resume' ? 'Upload Resume' : 'Upload Context Document',
      filters: [
        { name: 'Documents', extensions: ['pdf', 'docx', 'doc', 'txt', 'md'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, canceled: true }
    }

    const sourcePath = result.filePaths[0]
    const fileName = basename(sourcePath)
    const uploadDir = join(app.getPath('userData'), 'viviw', 'uploads')
    mkdirSync(uploadDir, { recursive: true })

    const fileId = randomUUID()
    const destPath = join(uploadDir, `${fileId}_${fileName}`)
    copyFileSync(sourcePath, destPath)

    const fileInfo = {
      id: fileId,
      name: fileName,
      type,
      path: destPath,
      size: statSync(destPath).size
    }

    saveUploadedFile(fileInfo)
    return { success: true, file: fileInfo }
  })

  ipcMain.handle('context:list', () => getUploadedFiles())

  ipcMain.handle('context:remove', (_, id: string) => {
    removeUploadedFile(id)
    return { success: true }
  })

  ipcMain.handle('history:get', (_, sessionId: string) => getConversations(sessionId, 50))

  ipcMain.handle('history:clear', () => {
    clearAllConversations()
    return { success: true }
  })
}
