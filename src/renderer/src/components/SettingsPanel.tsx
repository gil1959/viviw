import React, { useState, useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import { PRESET_ENDPOINTS, STT_MODELS, LANGUAGES, Settings } from '@shared/types'

export function SettingsPanel(): React.ReactElement {
  const { settings, setSettings } = useAppStore()
  const [local, setLocal] = useState<Settings>(settings)
  const [saved, setSaved] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [modelInput, setModelInput] = useState(settings.model)

  useEffect(() => { setLocal(settings); setModelInput(settings.model) }, [settings])

  const selectedPreset = PRESET_ENDPOINTS.find(p => p.url === local.apiEndpoint)

  const handlePresetSelect = (url: string) => {
    const preset = PRESET_ENDPOINTS.find(p => p.url === url)
    setLocal(prev => ({
      ...prev,
      apiEndpoint: url,
      model: preset?.models[0] || prev.model
    }))
    setModelInput(preset?.models[0] || local.model)
  }

  const handleSave = async () => {
    const toSave = { ...local, model: modelInput }
    await window.viviw.saveSettings(toSave)
    setSettings(toSave)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="flex flex-col gap-3 p-3 scroll-area" style={{ maxHeight: '100%' }}>

      {/* AI Provider Section */}
      <div className="glass-card p-3">
        <p className="section-label mb-2">AI Provider (9Router / OpenAI-compatible)</p>

        {/* VPS Setup Guide */}
        {local.apiEndpoint.includes('YOUR-VPS-IP') && (
          <div className="mb-2 p-2 rounded-md text-[10px]" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: 'var(--text-muted)' }}>
            <p className="font-semibold mb-1">📋 Setup 9Router VPS:</p>
            <ol className="list-decimal pl-3 space-y-0.5">
              <li>Deploy 9Router ke VPS (DigitalOcean, Vultr, dll)</li>
              <li>Copy IP address VPS kamu</li>
              <li>Replace <code className="px-1 rounded" style={{ background: 'rgba(0,0,0,0.2)' }}>YOUR-VPS-IP</code> di URL di bawah</li>
              <li>Masukkan API Key dari dashboard 9Router</li>
            </ol>
          </div>
        )}

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-1 mb-2">
          {PRESET_ENDPOINTS.map(p => (
            <button key={p.url} onClick={() => handlePresetSelect(p.url)}
              className="text-[10px] px-2 py-1 rounded-md border transition-all no-drag"
              style={{
                background: local.apiEndpoint === p.url ? 'rgba(124,58,237,.2)' : 'transparent',
                borderColor: local.apiEndpoint === p.url ? 'var(--border-accent)' : 'var(--border)',
                color: local.apiEndpoint === p.url ? 'var(--accent-light)' : 'var(--text-muted)'
              }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* API Endpoint URL */}
        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
          API Endpoint URL
        </label>
        <input
          className="viviw-input no-drag mb-2 mono text-[11px]"
          value={local.apiEndpoint}
          onChange={e => setLocal(prev => ({ ...prev, apiEndpoint: e.target.value }))}
          placeholder="https://your-vps-ip:20128/v1"
        />

        {/* API Key */}
        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
          API Key
        </label>
        <div className="flex gap-1.5 mb-2">
          <input
            type={showKey ? 'text' : 'password'}
            className="viviw-input no-drag flex-1"
            value={local.apiKey}
            onChange={e => setLocal(prev => ({ ...prev, apiKey: e.target.value }))}
            placeholder="sk-..."
            autoComplete="off"
          />
          <button onClick={() => setShowKey(v => !v)} className="viviw-btn viviw-btn-ghost no-drag px-2">
            {showKey
              ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            }
          </button>
        </div>

        {/* Model */}
        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
          Model
        </label>
        {selectedPreset ? (
          <select
            className="viviw-input no-drag cursor-pointer"
            value={modelInput}
            onChange={e => setModelInput(e.target.value)}
          >
            {selectedPreset.models.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        ) : (
          <input
            className="viviw-input no-drag mono text-[11px]"
            value={modelInput}
            onChange={e => setModelInput(e.target.value)}
            placeholder="kr/claude-sonnet-4.5"
          />
        )}
      </div>

      {/* STT Section */}
      <div className="glass-card p-3">
        <p className="section-label mb-2">Speech-to-Text</p>

        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
          Whisper Model
        </label>
        <select className="viviw-input no-drag cursor-pointer mb-2"
          value={local.sttModel}
          onChange={e => setLocal(prev => ({ ...prev, sttModel: e.target.value }))}>
          {STT_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>

        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
          Bahasa
        </label>
        <select className="viviw-input no-drag cursor-pointer"
          value={local.language}
          onChange={e => setLocal(prev => ({ ...prev, language: e.target.value }))}>
          {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
        </select>
      </div>

      {/* User + Shortcuts Section */}
      <div className="glass-card p-3">
        <p className="section-label mb-2">Preferensi</p>

        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
          Nama Kamu
        </label>
        <input className="viviw-input no-drag mb-2" value={local.userName}
          onChange={e => setLocal(prev => ({ ...prev, userName: e.target.value }))}
          placeholder="e.g. Ragil" />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
              Toggle
            </label>
            <input className="viviw-input no-drag mono text-[10px]" value={local.shortcutToggle}
              onChange={e => setLocal(prev => ({ ...prev, shortcutToggle: e.target.value }))} />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>
              Copy
            </label>
            <input className="viviw-input no-drag mono text-[10px]" value={local.shortcutCopy}
              onChange={e => setLocal(prev => ({ ...prev, shortcutCopy: e.target.value }))} />
          </div>
        </div>
      </div>

      <button onClick={handleSave}
        className="viviw-btn viviw-btn-primary no-drag w-full justify-center text-sm py-2.5"
        style={{ background: saved ? '#059669' : undefined }}>
        {saved ? 'Tersimpan!' : 'Simpan Settings'}
      </button>
    </div>
  )
}