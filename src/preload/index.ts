import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('viviw', {
  minimize: () => ipcRenderer.send('window:minimize'),
  close: () => ipcRenderer.send('window:close'),
  hide: () => ipcRenderer.send('window:hide'),
  show: () => ipcRenderer.send('window:show'),

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
  }
})
