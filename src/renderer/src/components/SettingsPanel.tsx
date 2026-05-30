import React,{useState,useEffect} from 'react'
import {useAppStore} from '../store/appStore'
import {MODELS,LANGUAGES,Settings} from '@shared/types'
export function SettingsPanel():React.ReactElement{
  const{settings,setSettings}=useAppStore()
  const[local,setLocal]=useState<Settings>(settings)
  const[saved,setSaved]=useState(false)
  const[showKey,setShowKey]=useState(false)
  useEffect(()=>{setLocal(settings)},[settings])
  const handleSave=async()=>{
    await window.viviw.saveSettings(local)
    setSettings(local);setSaved(true)
    setTimeout(()=>setSaved(false),2000)
  }
  return(<div className="flex flex-col gap-4 p-3 scroll-area" style={{maxHeight:'100%'}}>
    <div>
      <label className="section-label mb-2 block">9Router API Key</label>
      <div className="flex gap-1.5">
        <input type={showKey?'text':'password'} className="viviw-input no-drag flex-1" value={local.nineRouterApiKey} onChange={e=>setLocal(p=>({...p,nineRouterApiKey:e.target.value}))} placeholder="sk-..." autoComplete="off"/>
        <button onClick={()=>setShowKey(v=>!v)} className="viviw-btn viviw-btn-ghost no-drag px-2">{showKey?
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>:
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
        </button>
      </div>
      <p className="text-[10px] mt-1" style={{color:'var(--text-muted)'}}>From 9Router dashboard at localhost:20128</p>
    </div>
    <div><label className="section-label mb-1.5 block">Your Name</label><input className="viviw-input no-drag" value={local.userName} onChange={e=>setLocal(p=>({...p,userName:e.target.value}))} placeholder="e.g. Budi"/></div>
    <div><label className="section-label mb-1.5 block">AI Model</label>
      <select className="viviw-input no-drag cursor-pointer" value={local.model} onChange={e=>setLocal(p=>({...p,model:e.target.value}))}>
        {MODELS.map(m=><option key={m.id} value={m.id}>{m.label} — {m.speed}</option>)}
      </select>
    </div>
    <div><label className="section-label mb-1.5 block">STT Language</label>
      <select className="viviw-input no-drag cursor-pointer" value={local.language} onChange={e=>setLocal(p=>({...p,language:e.target.value}))}>
        {LANGUAGES.map(l=><option key={l.id} value={l.id}>{l.label}</option>)}
      </select>
    </div>
    <div><label className="section-label mb-1.5 block">Toggle Shortcut</label><input className="viviw-input no-drag mono" value={local.shortcutToggle} onChange={e=>setLocal(p=>({...p,shortcutToggle:e.target.value}))} placeholder="Ctrl+Shift+Space"/></div>
    <div><label className="section-label mb-1.5 block">Copy Answer Shortcut</label><input className="viviw-input no-drag mono" value={local.shortcutCopy} onChange={e=>setLocal(p=>({...p,shortcutCopy:e.target.value}))} placeholder="Ctrl+Shift+C"/></div>
    <button onClick={handleSave} className={`viviw-btn viviw-btn-primary no-drag w-full justify-center ${saved?'bg-emerald-600':''}`}>{saved?'Saved!':'Save Settings'}</button>
  </div>)
}