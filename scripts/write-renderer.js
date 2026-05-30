const fs = require('fs')

const files = {
  'src/renderer/src/styles/globals.css': `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;
:root{--accent:#7c3aed;--accent-light:#a78bfa;--accent-dim:rgba(124,58,237,.15);--surface:rgba(12,10,20,.92);--surface-card:rgba(255,255,255,.04);--surface-hover:rgba(255,255,255,.07);--border:rgba(255,255,255,.08);--border-accent:rgba(124,58,237,.4);--text-primary:#f1f0f7;--text-secondary:#8b8a9e;--text-muted:#4a4860;--success:#10b981;--warning:#f59e0b;--danger:#ef4444;--scrollbar-thumb:rgba(124,58,237,.3)}
*{box-sizing:border-box;margin:0;padding:0}
html,body,#root{width:100%;height:100%;overflow:hidden;background:transparent;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;font-size:13px;color:var(--text-primary);user-select:none}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--scrollbar-thumb);border-radius:4px}
::selection{background:var(--accent-dim);color:var(--text-primary)}
@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulseDot{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.4);opacity:.6}}
@keyframes slideInRight{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
.animate-fade-in{animation:fadeIn .25s ease-out both}
.animate-slide-in{animation:slideInRight .3s ease-out both}
.cursor-blink::after{content:'|';animation:cursorBlink 1s step-end infinite;color:var(--accent-light);margin-left:1px}
.glass-card{background:var(--surface-card);border:1px solid var(--border);border-radius:10px;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.glass-card:hover{background:var(--surface-hover);border-color:rgba(255,255,255,.12)}
.status-dot{width:6px;height:6px;border-radius:50%;display:inline-block}
.status-dot.listening{background:var(--success);animation:pulseDot 1.5s ease-in-out infinite}
.status-dot.generating{background:var(--accent-light);animation:pulseDot .8s ease-in-out infinite}
.status-dot.idle{background:var(--text-muted)}
.status-dot.error{background:var(--danger)}
.drag-region{-webkit-app-region:drag}
.no-drag{-webkit-app-region:no-drag}
.scroll-area{overflow-y:auto;overflow-x:hidden}
.viviw-input{background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:7px;color:var(--text-primary);padding:7px 10px;font-family:inherit;font-size:12px;width:100%;transition:border-color .15s,background .15s;outline:none}
.viviw-input:focus{border-color:var(--border-accent);background:rgba(124,58,237,.06)}
.viviw-input::placeholder{color:var(--text-muted)}
select.viviw-input option{background:#1a1628;color:var(--text-primary)}
.viviw-btn{display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:7px;font-family:inherit;font-size:12px;font-weight:500;cursor:pointer;transition:all .15s;border:1px solid transparent;outline:none}
.viviw-btn-primary{background:var(--accent);color:white;border-color:rgba(255,255,255,.1)}
.viviw-btn-primary:hover{background:#6d28d9;transform:translateY(-1px)}
.viviw-btn-ghost{background:transparent;color:var(--text-secondary);border-color:var(--border)}
.viviw-btn-ghost:hover{background:var(--surface-hover);color:var(--text-primary)}
.viviw-btn-danger{background:rgba(239,68,68,.1);color:#f87171;border-color:rgba(239,68,68,.2)}
.viviw-btn-danger:hover{background:rgba(239,68,68,.2)}
.mono{font-family:'JetBrains Mono','Fira Code',monospace;font-size:11px}
.section-label{font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted)}
`,

  'src/renderer/src/components/AnswerPanel.tsx': `import React,{useEffect,useRef} from 'react'
import {useAppStore} from '../store/appStore'
export function AnswerPanel():React.ReactElement{
  const{currentAnswer,streamingText,isStreaming,isGenerating,answerHistory,currentTranscript}=useAppStore()
  const scrollRef=useRef<HTMLDivElement>(null)
  const displayText=isStreaming?streamingText:currentAnswer
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight},[displayText])
  const handleCopy=()=>{
    const text=displayText||(answerHistory.length>0?answerHistory[answerHistory.length-1].answer:'')
    if(text)navigator.clipboard.writeText(text)
  }
  return(<div className="flex flex-col flex-1 min-h-0">
    <div className="flex items-center justify-between px-3 py-2">
      <span className="section-label">AI Answer</span>
      <div className="flex items-center gap-2">
        {isGenerating&&!isStreaming&&<span className="text-[10px] text-violet-400 mono animate-pulse">thinking...</span>}
        {displayText&&<button onClick={handleCopy} className="viviw-btn viviw-btn-ghost no-drag py-0.5 px-2 text-[11px]">Copy</button>}
      </div>
    </div>
    <div ref={scrollRef} className="scroll-area flex-1 px-3 pb-3">
      {!displayText&&!isGenerating?(<div className="flex flex-col items-center justify-center h-full gap-2 py-6">
        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <p className="text-[11px] text-center" style={{color:'var(--text-muted)'}}>Start listening to get AI answers</p>
      </div>):(
        <div className="glass-card p-3 animate-fade-in" style={{borderColor:displayText?'var(--border-accent)':'var(--border)'}}>
          {isGenerating&&!displayText?(
            <div className="flex items-center gap-2">
              <div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400" style={{animation:\`pulseDot 1s \${i*0.2}s ease-in-out infinite\`}}/>)}</div>
              <span className="text-[11px]" style={{color:'var(--text-muted)'}}>Generating...</span>
            </div>
          ):(
            <div className={\`text-[12.5px] leading-relaxed whitespace-pre-wrap \${isStreaming?'cursor-blink':''}\`} style={{color:'var(--text-primary)'}}>{displayText}</div>
          )}
        </div>
      )}
    </div>
  </div>)
}`,

  'src/renderer/src/components/TranscriptPanel.tsx': `import React,{useEffect,useRef} from 'react'
import {useAppStore} from '../store/appStore'
export function TranscriptPanel():React.ReactElement{
  const{transcripts,isListening}=useAppStore()
  const scrollRef=useRef<HTMLDivElement>(null)
  useEffect(()=>{if(scrollRef.current)scrollRef.current.scrollTop=scrollRef.current.scrollHeight},[transcripts])
  return(<div className="flex flex-col" style={{height:'130px'}}>
    <div className="flex items-center justify-between px-3 py-1.5">
      <span className="section-label">Transcript</span>
      {transcripts.length>0&&<span className="text-[10px]" style={{color:'var(--text-muted)'}}>{transcripts.length} line{transcripts.length!==1?'s':''}</span>}
    </div>
    <div ref={scrollRef} className="scroll-area flex-1 px-3 pb-2">
      {transcripts.length===0?(<div className="flex items-center gap-2 py-1">
        <div className={\`status-dot \${isListening?'listening':'idle'}\`}/>
        <span className="text-[11px]" style={{color:'var(--text-muted)'}}>{isListening?'Listening to audio...':'Not listening'}</span>
      </div>):(
        <div className="flex flex-col gap-1">
          {transcripts.slice(-8).map(e=>(
            <div key={e.id} className={\`text-[11.5px] leading-snug px-2 py-1 rounded-md \${e.isQuestion?'bg-violet-500/10 border border-violet-500/20 text-violet-200':''}\`}
              style={{color:e.isQuestion?undefined:'var(--text-secondary)',animation:'fadeIn .2s ease-out'}}>
              {e.isQuestion&&<span className="text-[9px] font-semibold uppercase tracking-wider text-violet-400 mr-1.5">Q</span>}
              {e.text}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>)
}`,

  'src/renderer/src/components/StatusBar.tsx': `import React from 'react'
import {useAppStore} from '../store/appStore'
export function StatusBar():React.ReactElement{
  const{isListening,isGenerating,sttStatus,sttLatencyMs,aiFirstTokenMs,errorMessage}=useAppStore()
  const dotClass=errorMessage?'error':isGenerating?'generating':isListening?'listening':'idle'
  const statusText=errorMessage?'Error':sttStatus==='loading'?'Loading...':isGenerating?'Generating':isListening?'Listening':'Idle'
  return(<div className="flex items-center justify-between px-3 py-1.5 border-t" style={{borderColor:'var(--border)'}}>
    <div className="flex items-center gap-1.5">
      <div className={\`status-dot \${dotClass}\`}/>
      <span className="text-[10px] font-medium" style={{color:errorMessage?'var(--danger)':isGenerating?'var(--accent-light)':isListening?'var(--success)':'var(--text-muted)'}}>{statusText}</span>
    </div>
    <div className="flex items-center gap-3">
      {sttLatencyMs>0&&<div className="flex items-center gap-1"><span className="text-[9px] font-semibold uppercase tracking-wide" style={{color:'var(--text-muted)'}}>STT</span><span className="mono text-[10px]" style={{color:'var(--text-secondary)'}}>{sttLatencyMs}ms</span></div>}
      {aiFirstTokenMs>0&&<div className="flex items-center gap-1"><span className="text-[9px] font-semibold uppercase tracking-wide" style={{color:'var(--text-muted)'}}>AI</span><span className="mono text-[10px]" style={{color:'var(--text-secondary)'}}>{aiFirstTokenMs}ms</span></div>}
    </div>
  </div>)
}`,

  'src/renderer/src/components/ErrorToast.tsx': `import React from 'react'
import {useAppStore} from '../store/appStore'
export function ErrorToast():React.ReactElement|null{
  const{errorMessage,setError}=useAppStore()
  if(!errorMessage)return null
  return(<div className="absolute bottom-10 left-3 right-3 animate-slide-in" style={{zIndex:100}}>
    <div className="flex items-start gap-2 p-3 rounded-lg border text-[11px]" style={{background:'rgba(239,68,68,.1)',borderColor:'rgba(239,68,68,.3)',color:'#fca5a5'}}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span className="flex-1 leading-snug">{errorMessage}</span>
      <button onClick={()=>setError(null)} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity no-drag">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </div>)
}`,

  'src/renderer/src/components/HistoryPanel.tsx': `import React from 'react'
import {useAppStore} from '../store/appStore'
export function HistoryPanel():React.ReactElement{
  const{answerHistory}=useAppStore()
  if(answerHistory.length===0)return(<div className="flex flex-col items-center justify-center gap-2 py-10 px-4">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:'var(--text-muted)'}}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    <p className="text-[11px] text-center" style={{color:'var(--text-muted)'}}>No session history yet.<br/>Start listening to record Q&amp;A.</p>
  </div>)
  return(<div className="flex flex-col gap-2 p-3 scroll-area" style={{maxHeight:'100%'}}>
    {[...answerHistory].reverse().map((item,i)=>(<div key={i} className="glass-card p-3 animate-fade-in">
      <div className="text-[11px] font-semibold mb-1.5" style={{color:'var(--accent-light)'}}>Q: {item.question.slice(0,120)}{item.question.length>120?'...':''}</div>
      <div className="text-[11px] leading-relaxed" style={{color:'var(--text-secondary)'}}>{item.answer.slice(0,300)}{item.answer.length>300?'...':''}</div>
      <div className="text-[9px] mt-1.5" style={{color:'var(--text-muted)'}}>{new Date(item.timestamp).toLocaleTimeString()}</div>
    </div>))}
  </div>)
}`,

  'src/renderer/src/components/UploadPanel.tsx': `import React from 'react'
import {useAppStore} from '../store/appStore'
function FileIcon({ext}:{ext:string}):React.ReactElement{
  const color=ext==='pdf'?'#ef4444':ext==='docx'||ext==='doc'?'#3b82f6':'#10b981'
  return(<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>)
}
function formatBytes(b:number):string{if(b<1024)return b+' B';if(b<1048576)return (b/1024).toFixed(1)+' KB';return (b/1048576).toFixed(1)+' MB'}
function FileRow({file,onRemove}:{file:{id:string;name:string;size:number};onRemove:(id:string)=>void}):React.ReactElement{
  const ext=file.name.split('.').pop()?.toLowerCase()??''
  return(<div className="glass-card flex items-center gap-2 px-2.5 py-2 animate-fade-in">
    <FileIcon ext={ext}/>
    <span className="flex-1 text-[11.5px] truncate" style={{color:'var(--text-secondary)'}} title={file.name}>{file.name}</span>
    <span className="text-[10px] shrink-0" style={{color:'var(--text-muted)'}}>{formatBytes(file.size)}</span>
    <button onClick={()=>onRemove(file.id)} className="no-drag w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/20 transition-colors" title="Remove">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>)
}
export function UploadPanel():React.ReactElement{
  const{uploadedFiles,addUploadedFile,removeUploadedFile}=useAppStore()
  const handleUpload=async(type:'resume'|'context')=>{
    const result=await window.viviw.uploadFile(type)
    if(result.success&&result.file)addUploadedFile(result.file as Parameters<typeof addUploadedFile>[0])
  }
  const handleRemove=async(id:string)=>{await window.viviw.removeFile(id);removeUploadedFile(id)}
  const resume=uploadedFiles.filter(f=>f.type==='resume')
  const context=uploadedFiles.filter(f=>f.type==='context')
  return(<div className="flex flex-col gap-3 p-3">
    <div>
      <div className="flex items-center justify-between mb-2"><span className="section-label">Resume</span>
        <button onClick={()=>handleUpload('resume')} className="viviw-btn viviw-btn-ghost py-0.5 px-2 text-[11px] no-drag">+ Upload</button></div>
      {resume.length===0?(<div onClick={()=>handleUpload('resume')} className="glass-card flex flex-col items-center justify-center gap-1.5 py-4 cursor-pointer no-drag hover:border-violet-500/30 transition-colors">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:'var(--text-muted)'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <span className="text-[11px]" style={{color:'var(--text-muted)'}}>PDF or DOCX</span>
      </div>):(<div className="flex flex-col gap-1.5">{resume.map(f=><FileRow key={f.id} file={f} onRemove={handleRemove}/>)}</div>)}
    </div>
    <div>
      <div className="flex items-center justify-between mb-2"><span className="section-label">Context Docs</span>
        <button onClick={()=>handleUpload('context')} className="viviw-btn viviw-btn-ghost py-0.5 px-2 text-[11px] no-drag">+ Upload</button></div>
      {context.length===0?(<div onClick={()=>handleUpload('context')} className="glass-card flex flex-col items-center justify-center gap-1.5 py-3 cursor-pointer no-drag hover:border-violet-500/30 transition-colors">
        <span className="text-[11px]" style={{color:'var(--text-muted)'}}>JD, notes, or technical docs</span>
      </div>):(<div className="flex flex-col gap-1.5">{context.map(f=><FileRow key={f.id} file={f} onRemove={handleRemove}/>)}</div>)}
    </div>
  </div>)
}`,

  'src/renderer/src/components/SettingsPanel.tsx': `import React,{useState,useEffect} from 'react'
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
    <button onClick={handleSave} className={\`viviw-btn viviw-btn-primary no-drag w-full justify-center \${saved?'bg-emerald-600':''}\`}>{saved?'Saved!':'Save Settings'}</button>
  </div>)
}`,

  'src/renderer/src/components/Header.tsx': `import React from 'react'
import {useAppStore} from '../store/appStore'
type Panel='main'|'history'|'upload'|'settings'
const navItems:Array<{id:Panel;label:string;icon:React.ReactElement}>=[
  {id:'main',label:'Live',icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.56 3.42A2 2 0 0 1 3.5 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.42a16 16 0 0 0 6.29 6.29l1.48-1.35a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>},
  {id:'history',label:'History',icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>},
  {id:'upload',label:'Docs',icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>},
  {id:'settings',label:'Settings',icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
]
export function Header():React.ReactElement{
  const{activePanel,setActivePanel,isListening,setListening,sttStatus,setError}=useAppStore()
  const handleToggle=async()=>{
    if(isListening){await window.viviw.stopAudio();setListening(false)}
    else{const r=await window.viviw.startAudio();if(!r.success&&r.error){setError(r.error);setTimeout(()=>setError(null),6000)}}
  }
  return(<div className="flex flex-col border-b drag-region" style={{borderColor:'var(--border)'}}>
    <div className="flex items-center justify-between px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md flex items-center justify-center text-white font-bold text-[10px]" style={{background:'linear-gradient(135deg,#7c3aed,#a78bfa)'}}>V</div>
        <span className="font-semibold text-[13px]" style={{color:'var(--text-primary)'}}>VIVIW</span>
        {sttStatus==='loading'&&<span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">Loading</span>}
      </div>
      <div className="flex items-center gap-1 no-drag">
        <button onClick={handleToggle} className={\`viviw-btn text-[11px] py-1 px-3 \${isListening?'viviw-btn-danger':'viviw-btn-primary'}\`}>
          {isListening?<><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>Stop</>:<><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>Listen</>}
        </button>
        <button onClick={()=>window.viviw.minimize()} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 transition-colors">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{color:'var(--text-muted)'}}><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button onClick={()=>window.viviw.close()} className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-500/20 transition-colors">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{color:'var(--text-muted)'}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <div className="flex items-center px-2 pb-0 no-drag">
      {navItems.map(item=>(
        <button key={item.id} onClick={()=>setActivePanel(item.id)}
          className={\`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium transition-all rounded-t-md \${activePanel===item.id?'text-violet-300':'hover:text-white/70'}\`}
          style={{color:activePanel===item.id?undefined:'var(--text-muted)',borderBottom:activePanel===item.id?'2px solid #7c3aed':'2px solid transparent'}}>
          {item.icon}{item.label}
        </button>
      ))}
    </div>
  </div>)
}`,

  'src/renderer/src/App.tsx': `import React from 'react'
import {useAppStore} from './store/appStore'
import {useIPC} from './hooks/useIPC'
import {Header} from './components/Header'
import {TranscriptPanel} from './components/TranscriptPanel'
import {AnswerPanel} from './components/AnswerPanel'
import {HistoryPanel} from './components/HistoryPanel'
import {UploadPanel} from './components/UploadPanel'
import {SettingsPanel} from './components/SettingsPanel'
import {StatusBar} from './components/StatusBar'
import {ErrorToast} from './components/ErrorToast'
export default function App():React.ReactElement{
  useIPC()
  const{activePanel}=useAppStore()
  return(<div className="flex flex-col w-full h-full relative overflow-hidden" style={{background:'var(--surface)',borderRadius:'12px'}}>
    <div className="absolute inset-x-0 top-0 h-px" style={{background:'linear-gradient(90deg,transparent,rgba(124,58,237,.6),transparent)'}}/>
    <Header/>
    <div className="flex flex-col flex-1 min-h-0 relative">
      {activePanel==='main'&&<div className="flex flex-col flex-1 min-h-0">
        <TranscriptPanel/>
        <div className="mx-3 h-px" style={{background:'var(--border)'}}/>
        <AnswerPanel/>
      </div>}
      {activePanel==='history'&&<div className="flex-1 min-h-0 scroll-area"><HistoryPanel/></div>}
      {activePanel==='upload'&&<div className="flex-1 min-h-0 scroll-area"><UploadPanel/></div>}
      {activePanel==='settings'&&<div className="flex-1 min-h-0 scroll-area"><SettingsPanel/></div>}
      <ErrorToast/>
    </div>
    <StatusBar/>
    <div className="absolute inset-x-0 bottom-0 h-px" style={{background:'linear-gradient(90deg,transparent,rgba(124,58,237,.3),transparent)'}}/>
  </div>)
}`
}

let created = 0
for (const [path, content] of Object.entries(files)) {
  const dir = require('path').dirname(path)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path, content, 'utf8')
  console.log('Created:', path)
  created++
}
console.log(`\nAll ${created} files created successfully!`)
