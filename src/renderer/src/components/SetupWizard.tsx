import React, { useEffect, useState } from 'react'

interface Step {
  id: string
  label: string
  status: 'pending' | 'running' | 'done' | 'error'
  error?: string
}

const STEPS_INIT: Step[] = [
  { id: 'python', label: 'Mengunduh Python 3.11 (embeddable)...', status: 'pending' },
  { id: 'pip', label: 'Menyiapkan pip...', status: 'pending' },
  { id: 'whisper', label: 'Menginstall faster-whisper + PyTorch CPU...', status: 'pending' },
  { id: 'sox', label: 'Menyiapkan audio engine (SoX)...', status: 'pending' },
]

export function SetupWizard(): React.ReactElement {
  const [steps, setSteps] = useState<Step[]>(STEPS_INIT)
  const [phase, setPhase] = useState<'intro' | 'running' | 'done' | 'error'>('intro')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    window.viviw.onSetupProgress((data: Step) => {
      if (data.id === 'done') {
        setPhase('done')
        return
      }
      setSteps(prev => prev.map(s => s.id === data.id ? { ...s, ...data } : s))
      if (data.status === 'error') {
        setPhase('error')
        setErrorMsg(data.error || 'Setup gagal')
      }
    })
  }, [])

  const startSetup = async () => {
    setPhase('running')
    try {
      await window.viviw.runSetup()
    } catch (e: unknown) {
      setPhase('error')
      setErrorMsg(e instanceof Error ? e.message : String(e))
    }
  }

  const finishSetup = () => window.viviw.setupDone()

  const getStepIcon = (status: Step['status']) => {
    if (status === 'done') return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    )
    if (status === 'running') return (
      <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full" style={{animation:'spin 0.8s linear infinite'}}/>
    )
    if (status === 'error') return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
    )
    return <div className="w-4 h-4 rounded-full border border-white/20"/>
  }

  return (
    <div className="flex flex-col w-full h-full items-center justify-center p-8" style={{background:'var(--surface)'}}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Logo */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
          style={{background:'linear-gradient(135deg,#7c3aed,#a78bfa)'}}>V</div>
        <span className="text-lg font-semibold" style={{color:'var(--text-primary)'}}>VIVIW Setup</span>
      </div>

      {phase === 'intro' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm leading-relaxed" style={{color:'var(--text-secondary)'}}>
            VIVIW perlu mengunduh beberapa komponen:<br/>
            <span className="text-xs" style={{color:'var(--text-muted)'}}>Python 3.11 + faster-whisper + PyTorch CPU + SoX</span>
          </p>
          <div className="glass-card p-3 w-full text-left">
            <p className="text-xs font-semibold mb-1" style={{color:'var(--text-muted)'}}>Yang akan diunduh:</p>
            <ul className="text-xs space-y-0.5" style={{color:'var(--text-secondary)'}}>
              <li>Python 3.11 embeddable (~25 MB)</li>
              <li>faster-whisper + PyTorch CPU (~500 MB)</li>
              <li>SoX audio engine (~5 MB)</li>
            </ul>
            <p className="text-xs mt-2" style={{color:'var(--text-muted)'}}>Setelah ini app berjalan offline sepenuhnya.</p>
          </div>
          <button onClick={startSetup} className="viviw-btn viviw-btn-primary w-full justify-center text-sm py-2.5">
            Mulai Setup
          </button>
        </div>
      )}

      {(phase === 'running' || phase === 'error') && (
        <div className="flex flex-col gap-2 w-full">
          {steps.map(step => (
            <div key={step.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{background: step.status === 'running' ? 'rgba(124,58,237,.1)' : step.status === 'error' ? 'rgba(239,68,68,.1)' : 'transparent'}}>
              {getStepIcon(step.status)}
              <span className="text-xs flex-1" style={{
                color: step.status === 'done' ? '#10b981' : step.status === 'error' ? '#ef4444' : step.status === 'running' ? '#a78bfa' : 'var(--text-muted)'
              }}>{step.label}</span>
            </div>
          ))}
          {phase === 'error' && (
            <div className="mt-3 p-3 rounded-lg text-xs" style={{background:'rgba(239,68,68,.1)',color:'#fca5a5'}}>
              Error: {errorMsg}
              <br/><span style={{color:'var(--text-muted)'}}>Cek koneksi internet lalu restart app untuk mencoba lagi.</span>
            </div>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{background:'rgba(16,185,129,.1)'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p className="font-semibold mb-1" style={{color:'var(--text-primary)'}}>Setup selesai!</p>
            <p className="text-xs" style={{color:'var(--text-muted)'}}>Semua komponen berhasil diinstall.</p>
          </div>
          <button onClick={finishSetup} className="viviw-btn viviw-btn-primary w-full justify-center text-sm py-2.5">
            Buka VIVIW
          </button>
        </div>
      )}
    </div>
  )
}
