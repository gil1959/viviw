import { IpcMain, BrowserWindow } from 'electron'

export function setupAIIPC(ipcMain: IpcMain, mainWindow: BrowserWindow): void {
  ipcMain.handle('ai:ask', async (_, question: string, sessionId: string) => {
    try {
      const { streamAnswer } = await import('../ai/engine')
      const answer = await streamAnswer({ question, sessionId, mainWindow })
      return { success: true, answer }
    } catch (err: unknown) {
      const error = err as Error
      return { success: false, error: error.message }
    }
  })
}
