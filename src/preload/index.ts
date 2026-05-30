import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('viviw', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  close: () => ipcRenderer.invoke('window:close'),
  hide: () => ipcRenderer.invoke('window:hide'),
  show: () => ipcRenderer.invoke('window:show'),

  startAudio: () => ipcRenderer.invoke('audio:start'),
  stopAudio: () => ipcRenderer.invoke('audio:stop'),

  onStreamToken: (callback: (token: string) => void) => {
    const listener = (_: unknown, token: string) => callback(token)
    ipcRenderer.on('stream:token', listener)
    return () => ipcRenderer.removeListener('stream:token', listener)
  },
  onStreamDone: (callback: (answer: string) => void) => {
    const listener = (_: unknown, answer: string) => callback(answer)
    ipcRenderer.on('stream:done', listener)
    return () => ipcRenderer.removeListener('stream:done', listener)
  },
  onStreamError: (callback: (error: string) => void) => {
    const listener = (_: unknown, error: string) => callback(error)
    ipcRenderer.on('stream:error', listener)
    return () => ipcRenderer.removeListener('stream:error', listener)
  },
  onTranscriptUpdate: (callback: (data: { text: string; isQuestion: boolean; confidence: number; latencyMs: number }) => void) => {
    const listener = (_: unknown, data: { text: string; isQuestion: boolean; confidence: number; latencyMs: number }) => callback(data)
    ipcRenderer.on('transcript:update', listener)
    return () => ipcRenderer.removeListener('transcript:update', listener)
  },

  uploadFile: (type: 'resume' | 'context') => ipcRenderer.invoke('context:upload', type),
  removeFile: (id: string) => ipcRenderer.invoke('context:remove', id),
  getFiles: () => ipcRenderer.invoke('context:list'),

  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings: unknown) => ipcRenderer.invoke('settings:save', settings),

  getHistory: (sessionId: string) => ipcRenderer.invoke('history:get', sessionId),
  clearHistory: () => ipcRenderer.invoke('history:clear'),

  onStats: (callback: (stats: unknown) => void) => {
    const listener = (_: unknown, stats: unknown) => callback(stats)
    ipcRenderer.on('stats:update', listener)
    return () => ipcRenderer.removeListener('stats:update', listener)
  },

  // Setup wizard
  checkSetup: () => ipcRenderer.invoke('setup:check'),
  runSetup: () => ipcRenderer.invoke('setup:run'),
  setupDone: () => ipcRenderer.invoke('setup:done'),
  onSetupProgress: (callback: (step: unknown) => void) => {
    const listener = (_: unknown, step: unknown) => callback(step)
    ipcRenderer.on('setup:progress', listener)
    return () => ipcRenderer.removeListener('setup:progress', listener)
  },

  onShortcutCopy: (callback: () => void) => {
    const listener = () => callback()
    ipcRenderer.on('shortcut:copy', listener)
    return () => ipcRenderer.removeListener('shortcut:copy', listener)
  }
})
