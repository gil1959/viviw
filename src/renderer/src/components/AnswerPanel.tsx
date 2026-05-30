import React,{useEffect,useRef} from 'react'
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
              <div className="flex gap-1">{[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400" style={{animation:`pulseDot 1s ${i*0.2}s ease-in-out infinite`}}/>)}</div>
              <span className="text-[11px]" style={{color:'var(--text-muted)'}}>Generating...</span>
            </div>
          ):(
            <div className={`text-[12.5px] leading-relaxed whitespace-pre-wrap ${isStreaming?'cursor-blink':''}`} style={{color:'var(--text-primary)'}}>{displayText}</div>
          )}
        </div>
      )}
    </div>
  </div>)
}