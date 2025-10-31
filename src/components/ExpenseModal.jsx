import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function ExpenseModal({expense, onSave, onRequestDelete, onClose}){
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')

  useEffect(()=>{
    if(expense){ setTitle(expense.title||''); setAmount(String(expense.amount||'')); setCategory(expense.category||'') }
  },[expense])

  function save(){
    const num = Number(amount)
    if(!title) return setError(t('enterTitle'))
    if(!amount || isNaN(num) || num <= 0) return setError(t('enterPositiveAmount'))
    setError('')
    onSave({...expense, title, amount: num, category})
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <header className="modal-header"><h3>{t('expense')}</h3><button className="modal-close" onClick={onClose}>✕</button></header>
        <div className="modal-body">
          <label>{t('title')}</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} />
          <label>{t('amount')}</label>
          <input value={amount} onChange={e=>setAmount(e.target.value)} type="number" />
          <label>{t('category')}</label>
          <input value={category} onChange={e=>setCategory(e.target.value)} />
          {error && <div style={{color:'crimson',marginTop:8}}>{error}</div>}
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn primary" onClick={save}>{t('saveChanges')}</button>
            <button className="btn" onClick={()=> onRequestDelete(expense.id)}>{t('delete')}</button>
            <button className="btn" onClick={onClose}>{t('cancel')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
