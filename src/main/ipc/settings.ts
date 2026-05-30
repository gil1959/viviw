import { IpcMain, BrowserWindow, globalShortcut, safeStorage } from 'electron'
import { getSetting, setSetting } from '../database/db'
import { DEFAULT_SETTINGS, Settings } from '@shared/types'

export function setupSettingsIPC(ipcMain: IpcMain, mainWindow: BrowserWindow): void {
  ipcMain.handle('settings:get', () => {
    const settings: Settings = { ...DEFAULT_SETTINGS }

    // Decrypt API key
    const apiKeyEncrypted = getSetting('apiKey_encrypted')
    if (apiKeyEncrypted && safeStorage.isEncryptionAvailable()) {
      try {
        settings.apiKey = safeStorage.decryptString(Buffer.from(apiKeyEncrypted, 'base64'))
      } catch {
        settings.apiKey = ''
      }
    }

    settings.apiEndpoint = getSetting('apiEndpoint') || DEFAULT_SETTINGS.apiEndpoint
    settings.model = getSetting('model') || DEFAULT_SETTINGS.model
    settings.language = getSetting('language') || DEFAULT_SETTINGS.language
    settings.sttModel = getSetting('sttModel') || DEFAULT_SETTINGS.sttModel
    settings.userName = getSetting('userName') || DEFAULT_SETTINGS.userName
    settings.shortcutToggle = getSetting('shortcutToggle') || DEFAULT_SETTINGS.shortcutToggle
    settings.shortcutCopy = getSetting('shortcutCopy') || DEFAULT_SETTINGS.shortcutCopy

    return settings
  })

  ipcMain.handle('settings:save', (_, settings: Settings) => {
    // Encrypt and store API key
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(settings.apiKey || '')
      setSetting('apiKey_encrypted', encrypted.toString('base64'))
    }

    setSetting('apiEndpoint', settings.apiEndpoint)
    setSetting('model', settings.model)
    setSetting('language', settings.language)
    setSetting('sttModel', settings.sttModel)
    setSetting('userName', settings.userName)
    setSetting('shortcutToggle', settings.shortcutToggle)
    setSetting('shortcutCopy', settings.shortcutCopy)

    registerShortcuts(settings, mainWindow)
    return { success: true }
  })

  // Register shortcuts on startup
  const initialSettings = {
    shortcutToggle: getSetting('shortcutToggle') || DEFAULT_SETTINGS.shortcutToggle,
    shortcutCopy: getSetting('shortcutCopy') || DEFAULT_SETTINGS.shortcutCopy
  } as Settings
  registerShortcuts(initialSettings, mainWindow)
}

function registerShortcuts(settings: Settings, mainWindow: BrowserWindow): void {
  globalShortcut.unregisterAll()

  try {
    globalShortcut.register(settings.shortcutToggle, () => {
      if (mainWindow.isVisible()) mainWindow.hide()
      else { mainWindow.show(); mainWindow.focus() }
    })
  } catch { console.error('[Shortcut] Failed:', settings.shortcutToggle) }

  try {
    globalShortcut.register(settings.shortcutCopy, () => {
      mainWindow.webContents.send('shortcut:copy')
    })
  } catch { console.error('[Shortcut] Failed:', settings.shortcutCopy) }
}
