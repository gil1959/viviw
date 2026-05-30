import { create } from 'zustand'
import { Settings, DEFAULT_SETTINGS } from '@shared/types'

interface UploadedFile {
  id: string
  name: string
  type: 'resume' | 'context'
  path: string
  size: number
}

interface TranscriptEntry {
  id: string
  text: string
  isQuestion: boolean
  confidence: number
  timestamp: number
  latencyMs: number
}

interface AppState {
  isListening: boolean
  isGenerating: boolean
  sttStatus: 'idle' | 'loading' | 'ready' | 'stopped' | 'error'
  transcripts: TranscriptEntry[]
  currentTranscript: string
  currentAnswer: string
  isStreaming: boolean
  streamingText: string
  answerHistory: Array<{ question: string; answer: string; timestamp: number }>
  uploadedFiles: UploadedFile[]
  settings: Settings
  settingsLoaded: boolean
  activePanel: 'main' | 'history' | 'upload' | 'settings'
  errorMessage: string | null
  sttLatencyMs: number
  aiFirstTokenMs: number

  setListening: (v: boolean) => void
  setGenerating: (v: boolean) => void
  setSttStatus: (v: AppState['sttStatus']) => void
  addTranscript: (e: TranscriptEntry) => void
  setCurrentTranscript: (t: string) => void
  appendStreamToken: (token: string) => void
  finalizeAnswer: (answer: string) => void
  resetStream: () => void
  setActivePanel: (p: AppState['activePanel']) => void
  setSettings: (s: Settings) => void
  setUploadedFiles: (files: UploadedFile[]) => void
  addUploadedFile: (file: UploadedFile) => void
  removeUploadedFile: (id: string) => void
  setError: (msg: string | null) => void
  updateStats: (stats: Partial<{ sttLatencyMs: number; aiFirstTokenMs: number }>) => void
}

export const useAppStore = create<AppState>((set) => ({
  isListening: false,
  isGenerating: false,
  sttStatus: 'idle',
  transcripts: [],
  currentTranscript: '',
  currentAnswer: '',
  isStreaming: false,
  streamingText: '',
  answerHistory: [],
  uploadedFiles: [],
  settings: DEFAULT_SETTINGS,
  settingsLoaded: false,
  activePanel: 'main',
  errorMessage: null,
  sttLatencyMs: 0,
  aiFirstTokenMs: 0,

  setListening: (v) => set({ isListening: v }),
  setGenerating: (v) => set({ isGenerating: v }),
  setSttStatus: (v) => set({ sttStatus: v }),
  addTranscript: (e) => set((s) => ({
    transcripts: [...s.transcripts.slice(-49), e],
    currentTranscript: e.text
  })),
  setCurrentTranscript: (t) => set({ currentTranscript: t }),
  appendStreamToken: (token) => set((s) => ({ isStreaming: true, streamingText: s.streamingText + token })),
  finalizeAnswer: (answer) => set((s) => ({
    isStreaming: false,
    currentAnswer: answer,
    streamingText: '',
    answerHistory: [...s.answerHistory, { question: s.currentTranscript, answer, timestamp: Date.now() }].slice(-50)
  })),
  resetStream: () => set({ isStreaming: false, streamingText: '', currentAnswer: '' }),
  setActivePanel: (p) => set({ activePanel: p }),
  setSettings: (s) => set({ settings: s, settingsLoaded: true }),
  setUploadedFiles: (files) => set({ uploadedFiles: files }),
  addUploadedFile: (file) => set((s) => ({ uploadedFiles: [...s.uploadedFiles, file] })),
  removeUploadedFile: (id) => set((s) => ({ uploadedFiles: s.uploadedFiles.filter((f) => f.id !== id) })),
  setError: (msg) => set({ errorMessage: msg }),
  updateStats: (stats) => set((s) => ({ ...s, ...stats }))
}))
