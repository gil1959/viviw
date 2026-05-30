import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { Settings } from '@shared/types'

declare global {
  interface Window {
    viviw: {
      minimize: () => void
      close: () => void
      hide: () => void
      show: () => void
      startAudio: () => Promise<{ success: boolean; error?: string }>
      stopAudio: () => Promise<{ success: boolean }>
      onStreamToken: (cb: (token: string) => void) => () => void
      onStreamDone: (cb: (answer: string) => void) => () => void
      onStreamError: (cb: (error: string) => void) => () => void
      onTranscriptUpdate: (cb: (data: { text: string; isQuestion: boolean; confidence: number; latencyMs: number }) => void) => () => void
      uploadFile: (type: 'resume' | 'context') => Promise<{ success: boolean; file?: unknown; canceled?: boolean }>
      removeFile: (id: string) => Promise<{ success: boolean }>
      getFiles: () => Promise<unknown[]>
      getSettings: () => Promise<Settings>
      saveSettings: (settings: Settings) => Promise<{ success: boolean }>
      getHistory: (sessionId: string) => Promise<unknown[]>
      clearHistory: () => Promise<{ success: boolean }>
      onStats: (cb: (stats: unknown) => void) => () => void
    }
  }
}

export function useIPC(): void {
  const {
    appendStreamToken, finalizeAnswer, setError,
    addTranscript, setListening, setGenerating,
    setSttStatus, updateStats, setSettings, setUploadedFiles
  } = useAppStore()

  useEffect(() => {
    const cleanups: Array<() => void> = []

    cleanups.push(window.viviw.onStreamToken(appendStreamToken))
    cleanups.push(window.viviw.onStreamDone((answer) => {
      finalizeAnswer(answer)
      setGenerating(false)
    }))
    cleanups.push(window.viviw.onStreamError((error) => {
      setError(error)
      setGenerating(false)
      setTimeout(() => setError(null), 6000)
    }))
    cleanups.push(window.viviw.onTranscriptUpdate((data) => {
      addTranscript({
        id: `${Date.now()}`,
        text: data.text,
        isQuestion: data.isQuestion,
        confidence: data.confidence ?? 1,
        timestamp: Date.now(),
        latencyMs: data.latencyMs ?? 0
      })
      if (data.isQuestion) setGenerating(true)
      updateStats({ sttLatencyMs: data.latencyMs ?? 0 })
    }))
    cleanups.push(window.viviw.onStats((rawStats) => {
      const stats = rawStats as {
        isListening?: boolean; isGenerating?: boolean; status?: string
        sttLatencyMs?: number; aiFirstTokenMs?: number
      }
      if (stats.isListening !== undefined) setListening(stats.isListening)
      if (stats.isGenerating !== undefined) setGenerating(stats.isGenerating)
      if (stats.status && ['idle','loading','ready','stopped','error'].includes(stats.status)) {
        setSttStatus(stats.status as 'idle' | 'loading' | 'ready' | 'stopped' | 'error')
      }
      updateStats({
        ...(stats.sttLatencyMs !== undefined && { sttLatencyMs: stats.sttLatencyMs }),
        ...(stats.aiFirstTokenMs !== undefined && { aiFirstTokenMs: stats.aiFirstTokenMs })
      })
    }))

    window.viviw.getSettings().then(setSettings)
    window.viviw.getFiles().then((files) => setUploadedFiles(files as Parameters<typeof setUploadedFiles>[0]))

    return () => cleanups.forEach((fn) => fn())
  }, [])
}
