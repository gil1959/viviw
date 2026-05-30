import React from 'react'
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
}