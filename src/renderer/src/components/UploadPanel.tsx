import React from 'react'
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
}