import React,{useEffect,useRef} from 'react'
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
        <div className={`status-dot ${isListening?'listening':'idle'}`}/>
        <span className="text-[11px]" style={{color:'var(--text-muted)'}}>{isListening?'Listening to audio...':'Not listening'}</span>
      </div>):(
        <div className="flex flex-col gap-1">
          {transcripts.slice(-8).map(e=>(
            <div key={e.id} className={`text-[11.5px] leading-snug px-2 py-1 rounded-md ${e.isQuestion?'bg-violet-500/10 border border-violet-500/20 text-violet-200':''}`}
              style={{color:e.isQuestion?undefined:'var(--text-secondary)',animation:'fadeIn .2s ease-out'}}>
              {e.isQuestion&&<span className="text-[9px] font-semibold uppercase tracking-wider text-violet-400 mr-1.5">Q</span>}
              {e.text}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>)
}