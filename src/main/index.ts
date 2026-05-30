import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import { initDatabase } from './database/db'
import { setupAudioIPC } from './ipc/audio'
import { setupAIIPC } from './ipc/ai'
import { setupFileIPC } from './ipc/file'
import { setupSettingsIPC } from './ipc/settings'
import { isSetupComplete, runSetup } from './setup/firstRun'

const isDev = process.env['NODE_ENV'] === 'development' || !!process.env['ELECTRON_RENDERER_URL']

let mainWindow: BrowserWindow | null = null
let setupWindow: BrowserWindow | null = null

function createSetupWindow(): void {
  setupWindow = new BrowserWindow({
    width: 520,
    height: 400,
    frame: false,
    resizable: false,
    center: true,
    backgroundColor: '#0c0a14',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false
    }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    setupWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '?setup=1')
  } else {
    setupWindow.loadFile(join(__dirname, '../renderer/index.html'), { query: { setup: '1' } })
  }
}

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    minWidth: 360,
    minHeight: 500,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: true,
    hasShadow: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      sandbox: false,
      nodeIntegration: false
    }
  })

  mainWindow.setContentProtection(true)
  mainWindow.setAlwaysOnTop(true, 'screen-saver')
  mainWindow.setVisibleOnAllWorkspaces(true)

  mainWindow.on('ready-to-show', () => mainWindow?.show())

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  setupAudioIPC(ipcMain, mainWindow)
  setupAIIPC(ipcMain, mainWindow)
  setupFileIPC(ipcMain, mainWindow)
  setupSettingsIPC(ipcMain, mainWindow)
}

app.whenReady().then(async () => {
  app.setAppUserModelId('com.viviw.app')

  // IPC for window controls
  ipcMain.handle('window:minimize', () => mainWindow?.minimize())
  ipcMain.handle('window:close', () => mainWindow?.close())
  ipcMain.handle('window:hide', () => mainWindow?.hide())
  ipcMain.handle('window:show', () => { mainWindow?.show(); mainWindow?.focus() })

  // IPC for setup
  ipcMain.handle('setup:check', () => isSetupComplete())
  ipcMain.handle('setup:run', async () => {
    await runSetup((step) => {
      setupWindow?.webContents.send('setup:progress', step)
      mainWindow?.webContents.send('setup:progress', step)
    })
    return { success: true }
  })
  ipcMain.handle('setup:done', () => {
    setupWindow?.close()
    setupWindow = null
    if (!mainWindow) createMainWindow()
    else { mainWindow.show(); mainWindow.focus() }
  })

  await initDatabase()

  if (!isSetupComplete()) {
    createSetupWindow()
    // Also create main window in background (hidden)
    createMainWindow()
    mainWindow?.hide()
  } else {
    createMainWindow()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('will-quit', () => {
  const { globalShortcut } = require('electron')
  globalShortcut.unregisterAll()
})
