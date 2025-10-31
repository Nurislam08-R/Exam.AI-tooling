import React, { useState, useEffect } from 'react'
import { saveReceipt, load } from '../lib/storage'
import { useTranslation } from 'react-i18next'

export default function AddExpense({onAdd, onNavigate}){
  const { t } = useTranslation()
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [note, setNote] = useState('')
  const [vendor, setVendor] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [paymentMethod, setPaymentMethod] = useState('Card')
  const [recurrence, setRecurrence] = useState('One-time')
  const [tags, setTags] = useState('')
  const [receipt, setReceipt] = useState(null)
  const [error, setError] = useState('')
  const [vendorSuggestions, setVendorSuggestions] = useState([])

  useEffect(()=>{
    let mounted = true
    ;(async ()=>{
      const ex = await load('sb_expenses', [])
      if(!mounted) return
      const vendors = Array.from(new Set(ex.map(x=> x.vendor).filter(Boolean)))
      setVendorSuggestions(vendors)
    })()
    return ()=> mounted = false
  },[])

  async function submit(e){
    e.preventDefault()
    const num = Number(amount)
    if(!amount || isNaN(num) || num <= 0){ setError(t('enterPositiveAmount')); return }
    // basic vendor/email/phone validation handled elsewhere; clear error
    setError('')
    // store receipt separately to avoid bloating expense list
    let receiptId = null
    if(receipt && receipt.startsWith('data:')){
      receiptId = await saveReceipt(receipt)
    }
    const payload = {
      title: note || category,
      amount: num,
      category,
      vendor: vendor || undefined,
      date,
      paymentMethod,
      recurrence,
      tags: tags ? tags.split(',').map(s=>s.trim()).filter(Boolean) : [],
      receiptId
    }
    onAdd(payload)
    onNavigate('home')
  }

  function handleReceiptFile(f){
    if(!f) return
    const reader = new FileReader()
    reader.onload = ev => setReceipt(ev.target.result)
    reader.readAsDataURL(f)
  }

  return (
    <div className="screen">
      <header className="header">
        <button onClick={()=>onNavigate('home')} className="back">←</button>
        <h1>{t('add')}</h1>
        <div />
      </header>

      <main>
        <form className="card" onSubmit={submit}>
          <div className="form-grid">
            <div className="field">
              <label>{t('amount')}</label>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="$0.00" />
            </div>

            <div className="field">
              <label>{t('date')}</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
            </div>

            <div className="field">
              <label>{t('category')}</label>
              <select value={category} onChange={e=>setCategory(e.target.value)}>
                <option>Food</option>
                <option>Transport</option>
                <option>Groceries</option>
                <option>Subscriptions</option>
                <option>Entertainment</option>
                <option>Health</option>
                <option>Other</option>
              </select>
            </div>

            <div className="field">
              <label>{t('payment')}</label>
              <select value={paymentMethod} onChange={e=>setPaymentMethod(e.target.value)}>
                <option>Card</option>
                <option>Cash</option>
                <option>Bank transfer</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>{t('vendor')}</label>
            <input value={vendor} onChange={e=>setVendor(e.target.value)} placeholder={t('placeholderVendor') || 'Store or merchant'} list="vendors-list" />
            <datalist id="vendors-list">
              {vendorSuggestions.map(v=> (<option key={v} value={v} />))}
            </datalist>
          </div>

          <div className="field">
            <label>{t('note')}</label>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder={t('placeholderNote') || 'Optional description'} />
          </div>

          <div className="form-grid">
            <div className="field">
              <label>{t('tags')}</label>
              <input value={tags} onChange={e=>setTags(e.target.value)} placeholder={t('placeholderTags') || 'coffee, work'} />
            </div>
            <div className="field">
              <label>Recurrence</label>
              <select value={recurrence} onChange={e=>setRecurrence(e.target.value)}>
                <option>One-time</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label>{t('receipt')}</label>
            <label className="btn" style={{display:'inline-flex', alignItems:'center'}}>
              {t('upload')}
              <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{ const f = e.target.files && e.target.files[0]; if(f) handleReceiptFile(f)}} />
            </label>
            {receipt && <div className="receipt-preview"><img src={receipt} alt="receipt" /></div>}
          </div>

          {error && <div style={{color:'crimson',marginTop:8}}>{error}</div>}
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="primary" type="submit">{t('add')}</button>
            <button type="button" className="btn" onClick={()=>{ setAmount(''); setCategory('Food'); setNote(''); setVendor(''); setTags(''); setReceipt(null); setRecurrence('One-time'); setPaymentMethod('Card'); setDate(new Date().toISOString().slice(0,10)) }}>{t('clear')}</button>
          </div>
        </form>
      </main>
    </div>
  )
}
