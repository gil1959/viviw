export interface Settings {
  nineRouterApiKey: string
  model: string
  language: string
  userName: string
  shortcutToggle: string
  shortcutCopy: string
}

export const DEFAULT_SETTINGS: Settings = {
  nineRouterApiKey: '',
  model: 'kr/claude-sonnet-4.5',
  language: 'id',
  userName: 'User',
  shortcutToggle: 'Ctrl+Shift+Space',
  shortcutCopy: 'Ctrl+Shift+C'
}

export const MODELS = [
  { id: 'kr/claude-sonnet-4.5', label: 'Claude Sonnet 4.5', speed: 'fast', quality: 'high' },
  { id: 'kr/claude-haiku-4.5', label: 'Claude Haiku 4.5', speed: 'fastest', quality: 'good' },
  { id: 'kr/gpt-4o-mini', label: 'GPT-4o Mini', speed: 'fast', quality: 'good' },
  { id: 'kr/gemini-2.0-flash', label: 'Gemini 2.0 Flash', speed: 'fast', quality: 'good' }
]

export const LANGUAGES = [
  { id: 'id', label: 'Bahasa Indonesia' },
  { id: 'en', label: 'English' },
  { id: 'ja', label: 'Japanese' },
  { id: 'zh', label: 'Chinese' },
  { id: 'auto', label: 'Auto-detect' }
]
