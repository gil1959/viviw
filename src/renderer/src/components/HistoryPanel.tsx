import React from 'react'
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
}