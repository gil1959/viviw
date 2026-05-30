import React from 'react'
import {useAppStore} from '../store/appStore'
export function StatusBar():React.ReactElement{
  const{isListening,isGenerating,sttStatus,sttLatencyMs,aiFirstTokenMs,errorMessage}=useAppStore()
  const dotClass=errorMessage?'error':isGenerating?'generating':isListening?'listening':'idle'
  const statusText=errorMessage?'Error':sttStatus==='loading'?'Loading...':isGenerating?'Generating':isListening?'Listening':'Idle'
  return(<div className="flex items-center justify-between px-3 py-1.5 border-t" style={{borderColor:'var(--border)'}}>
    <div className="flex items-center gap-1.5">
      <div className={`status-dot ${dotClass}`}/>
      <span className="text-[10px] font-medium" style={{color:errorMessage?'var(--danger)':isGenerating?'var(--accent-light)':isListening?'var(--success)':'var(--text-muted)'}}>{statusText}</span>
    </div>
    <div className="flex items-center gap-3">
      {sttLatencyMs>0&&<div className="flex items-center gap-1"><span className="text-[9px] font-semibold uppercase tracking-wide" style={{color:'var(--text-muted)'}}>STT</span><span className="mono text-[10px]" style={{color:'var(--text-secondary)'}}>{sttLatencyMs}ms</span></div>}
      {aiFirstTokenMs>0&&<div className="flex items-center gap-1"><span className="text-[9px] font-semibold uppercase tracking-wide" style={{color:'var(--text-muted)'}}>AI</span><span className="mono text-[10px]" style={{color:'var(--text-secondary)'}}>{aiFirstTokenMs}ms</span></div>}
    </div>
  </div>)
}