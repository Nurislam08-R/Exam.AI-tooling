import React, { useState } from 'react'
import { save, load } from '../lib/storage'
import { useTranslation } from 'react-i18next'

export default function Register({ setProfile, setRoute }){
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  function validateEmail(e){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) }
  function validatePassword(p){ return p.length >= 6 }

  async function submit(e){
    e.preventDefault()
    if(!name.trim()) return setError(t('enterName')|| 'Enter name')
    if(!validateEmail(email)) return setError(t('invalidEmail')|| 'Invalid email')
    if(!validatePassword(password)) return setError(t('passwordTooShort')|| 'Password too short')
    if(password !== confirm) return setError(t('passwordsNoMatch')|| 'Passwords do not match')

    // load existing users, ensure unique email
    const users = await load('sb_users', [])
    if(users.find(u=> u.email === email)) return setError(t('emailTaken')|| 'Email already registered')

    const user = { id: Date.now(), name: name.trim(), email: email.trim(), createdAt: Date.now() }
    users.push({...user, password})
    await save('sb_users', users)
    // set as current profile
    try{ await save('sb_profile', user) }catch(e){}
    try{ setProfile && setProfile(user) }catch(e){}
    setRoute('home')
  }

  return (
    <div className="screen">
      <header className="header">
        <button className="back btn" onClick={()=> setRoute('home')}>←</button>
        <h1>{t('register')}</h1>
        <div />
      </header>

      <main>
        <form className="card" onSubmit={submit}>
          <div className="field"><label>{t('nameLabel')}</label><input value={name} onChange={e=>setName(e.target.value)} /></div>
          <div className="field"><label>{t('emailLabel')}</label><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div className="field"><label>{t('password')}</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          <div className="field"><label>{t('confirmPassword')}</label><input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} /></div>
          {error && <div style={{color:'crimson',marginTop:8}}>{error}</div>}
          <div style={{marginTop:12,display:'flex',gap:8}}>
            <button className="btn primary" type="submit">{t('register')}</button>
            <button type="button" className="btn" onClick={()=> setRoute('home')}>{t('cancel')}</button>
          </div>
          <div style={{marginTop:12}}>
            <small>{t('alreadyHaveAccount') || 'Already have an account?'} <button className="btn" onClick={()=> setRoute('login')}>{t('login')}</button></small>
          </div>
        </form>
      </main>
    </div>
  )
}
