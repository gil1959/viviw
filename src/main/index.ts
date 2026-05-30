import { app, BrowserWindow, ipcMain, shell, globalShortcut } from 'electron'
import { join } from 'path'
import { initDatabase } from './database/db'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 460,
    height: 720,
    minWidth: 380,
    minHeight: 500,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    resizable: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.setContentProtection(true)
  mainWindow.setAlwaysOnTop(true, 'screen-saver')

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  app.setName('SystemHelper')

  await initDatabase()

  createWindow()

  // Setup IPC after window is created
  const { setupAudioIPC } = await import('./ipc/audio')
  const { setupAIIPC } = await import('./ipc/ai')
  const { setupFileIPC } = await import('./ipc/file')
  const { setupSettingsIPC } = await import('./ipc/settings')

  if (mainWindow) {
    setupAudioIPC(ipcMain, mainWindow)
    setupAIIPC(ipcMain, mainWindow)
    setupFileIPC(ipcMain, mainWindow)
    setupSettingsIPC(ipcMain, mainWindow)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.on('window:minimize', () => mainWindow?.minimize())
ipcMain.on('window:close', () => mainWindow?.close())
ipcMain.on('window:hide', () => mainWindow?.hide())
ipcMain.on('window:show', () => mainWindow?.show())

export { mainWindow }
