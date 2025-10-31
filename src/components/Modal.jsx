import React from 'react'

export default function Modal({title, children, onClose}){
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <header className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}
