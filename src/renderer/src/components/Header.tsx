import React from 'react'
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
        <button onClick={handleToggle} className={`viviw-btn text-[11px] py-1 px-3 ${isListening?'viviw-btn-danger':'viviw-btn-primary'}`}>
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
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium transition-all rounded-t-md ${activePanel===item.id?'text-violet-300':'hover:text-white/70'}`}
          style={{color:activePanel===item.id?undefined:'var(--text-muted)',borderBottom:activePanel===item.id?'2px solid #7c3aed':'2px solid transparent'}}>
          {item.icon}{item.label}
        </button>
      ))}
    </div>
  </div>)
}