import React, { useEffect } from 'react'

export default function Snackbar({message, actionLabel, onAction, open, duration=5000, onClose}){
  useEffect(()=>{
    if(!open) return
    const t = setTimeout(()=>{ onClose && onClose() }, duration)
    return ()=> clearTimeout(t)
  },[open, duration, onClose])

  if(!open) return null
  return (
    <div style={{position:'fixed',left:20,bottom:20,background:'var(--card-bg)',color:'var(--card-ink)',padding:'12px 16px',borderRadius:8,display:'flex',gap:12,alignItems:'center',zIndex:60}}>
      <div>{message}</div>
      {actionLabel && <button className="btn primary" onClick={onAction}>{actionLabel}</button>}
      <button className="btn" onClick={onClose}>{'Close'}</button>
    </div>
  )
}
