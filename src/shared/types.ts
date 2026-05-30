export interface Settings {
  // AI Provider
  apiEndpoint: string
  apiKey: string
  model: string
  // STT
  language: string
  sttModel: string
  // User
  userName: string
  // Shortcuts
  shortcutToggle: string
  shortcutCopy: string
}

export const DEFAULT_SETTINGS: Settings = {
  apiEndpoint: 'http://localhost:20128/v1',
  apiKey: '',
  model: 'kr/claude-sonnet-4.5',
  language: 'id',
  sttModel: 'small',
  userName: 'User',
  shortcutToggle: 'Ctrl+Shift+Space',
  shortcutCopy: 'Ctrl+Shift+C'
}

export const PRESET_ENDPOINTS = [
  { label: '9Router (Local)', url: 'http://localhost:20128/v1', models: ['kr/claude-sonnet-4.5', 'kr/claude-haiku-4.5', 'kr/gpt-4o-mini', 'kr/gemini-2.0-flash'] },
  { label: 'OpenRouter', url: 'https://openrouter.ai/api/v1', models: ['anthropic/claude-3.5-sonnet', 'anthropic/claude-3-haiku', 'openai/gpt-4o-mini', 'google/gemini-flash-1.5'] },
  { label: 'OpenAI', url: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'] },
  { label: 'Groq (Bebas/Cepat)', url: 'https://api.groq.com/openai/v1', models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'] },
  { label: 'Ollama (Local)', url: 'http://localhost:11434/v1', models: ['llama3.2', 'mistral', 'qwen2.5'] },
]

export const STT_MODELS = [
  { id: 'tiny', label: 'Tiny — tercepat, akurasi rendah (~75MB)' },
  { id: 'base', label: 'Base — cepat, akurasi cukup (~145MB)' },
  { id: 'small', label: 'Small — seimbang (Recommended) (~465MB)' },
  { id: 'medium', label: 'Medium — akurasi tinggi (~1.5GB)' },
]

export const LANGUAGES = [
  { id: 'id', label: 'Bahasa Indonesia' },
  { id: 'en', label: 'English' },
  { id: 'auto', label: 'Auto-detect' },
  { id: 'ja', label: 'Japanese' },
  { id: 'zh', label: 'Chinese' },
]
