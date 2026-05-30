import React from 'react'
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
}