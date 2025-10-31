import React, { useState, useEffect } from 'react'
import { load, save } from '../lib/storage'
import { useTranslation } from 'react-i18next'

export default function Login({ setProfile, setRoute }){
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(e){
    e && e.preventDefault()
    const users = await load('sb_users', [])
    const user = users.find(u=> u.email === (email||'').trim())
    if(!user) return setError(t('noSuchUser')|| 'No such user')
    if(user.password !== password) return setError(t('invalidCredentials')|| 'Invalid credentials')
    // success
    try{ await (await import('../lib/storage')).save('sb_profile', {id:user.id, name:user.name, email:user.email}) }catch(e){}
    try{ setProfile && setProfile({id:user.id, name:user.name, email:user.email}) }catch(e){}
    setRoute('home')
  }

  // --- Google OAuth (PKCE) flow ---
  useEffect(()=>{
    // message handler for popup -> this window
    function onMessage(e){
      try{
        if(e.origin !== location.origin) return
        const data = e.data || {}
        if(data && data.type === 'google_oauth'){
          if(data.error){ alert('Google OAuth error: ' + data.error); return }
          if(data.code){
            // exchange the code for tokens
            handleAuthCode(data.code).catch(err=> alert('Sign in failed: ' + (err&&err.message?err.message:err)))
          }
        }
      }catch(err){ console.warn(err) }
    }
    window.addEventListener('message', onMessage)
    return ()=> window.removeEventListener('message', onMessage)
  },[])

  async function sha256(buffer){
    const b = typeof buffer === 'string' ? new TextEncoder().encode(buffer) : buffer
    const hash = await crypto.subtle.digest('SHA-256', b)
    return new Uint8Array(hash)
  }
  function base64UrlEncode(bytes){
    let str = ''
    const len = bytes.byteLength
    for(let i=0;i<len;i++) str += String.fromCharCode(bytes[i])
    return btoa(str).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
  }

  function randomString(len=64){
    const arr = new Uint8Array(len)
    crypto.getRandomValues(arr)
    let s = ''
    for(let i=0;i<arr.length;i++) s += ('00' + arr[i].toString(16)).slice(-2)
    return s
  }

  async function signInWithGoogle(){
    const clientId = (()=>{ try{ return localStorage.getItem('sb_google_client_id') }catch(e){return null} })()
    if(!clientId){ alert(t('configureGoogle')|| 'Configure Google Client ID in Appearance settings') ; return }

    const redirectUri = location.origin + '/oauth-callback.html'
    const state = Math.random().toString(36).slice(2)
    const codeVerifier = base64UrlEncode(new Uint8Array(Array.from({length:64},()=>Math.floor(Math.random()*256))))
    // store verifier for later exchange
    try{ sessionStorage.setItem('google_code_verifier', codeVerifier); sessionStorage.setItem('google_oauth_state', state) }catch(e){}

    // create code_challenge
    const digest = await sha256(codeVerifier)
    const codeChallenge = base64UrlEncode(digest)

    const scope = encodeURIComponent('openid profile email')
    const url = 'https://accounts.google.com/o/oauth2/v2/auth'
      + `?client_id=${encodeURIComponent(clientId)}`
      + `&redirect_uri=${encodeURIComponent(redirectUri)}`
      + `&response_type=code`
      + `&scope=${scope}`
      + `&code_challenge=${encodeURIComponent(codeChallenge)}`
      + `&code_challenge_method=S256`
      + `&state=${encodeURIComponent(state)}`
      + `&prompt=select_account`

    window.open(url, 'google-signin','width=600,height=700')
  }

  async function handleAuthCode(code){
    const clientId = (()=>{ try{ return localStorage.getItem('sb_google_client_id') }catch(e){return null} })()
    if(!clientId) throw new Error('Missing client id')
    const codeVerifier = sessionStorage.getItem('google_code_verifier')
    const redirectUri = location.origin + '/oauth-callback.html'
    if(!codeVerifier) throw new Error('Missing code verifier in sessionStorage')

    const body = new URLSearchParams({
      code: code,
      client_id: clientId,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: body.toString()
    })
    if(!res.ok) throw new Error('Token exchange failed: ' + (await res.text()))
    const data = await res.json()
    const accessToken = data.access_token
    const idToken = data.id_token

    // fetch profile
    let profileInfo = null
    try{
      const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + accessToken } })
      if(r.ok) profileInfo = await r.json()
    }catch(e){/* ignore */}

    if(!profileInfo && idToken){
      // fallback: decode id_token
      try{
        const parts = idToken.split('.')
        if(parts.length>=2){
          const payload = JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')))
          profileInfo = payload
        }
      }catch(e){}
    }

    if(!profileInfo) throw new Error('Failed to obtain profile from Google')

    const users = await load('sb_users', [])
    let user = users.find(u=> u.email === (profileInfo.email||'').toLowerCase())
    if(!user){
      user = { id: Date.now(), name: profileInfo.name || profileInfo.email, email: (profileInfo.email||'').toLowerCase(), avatar: profileInfo.picture||null, google:true }
      users.push(user)
      try{ await save('sb_users', users) }catch(e){ console.warn('save users failed', e) }
    }

    // persist profile and navigate home
    try{ await save('sb_profile', { id: user.id, name: user.name, email: user.email, avatar: user.avatar }) }catch(e){}
    try{ setProfile && setProfile({ id: user.id, name: user.name, email: user.email, avatar: user.avatar }) }catch(e){}
    setRoute('home')
  }

  return (
    <div className="screen">
      <header className="header">
        <button className="back btn" onClick={()=> setRoute('home')}>←</button>
        <h1>{t('login')}</h1>
        <div />
      </header>

      <main>
        <form className="card" onSubmit={submit}>
          <div className="field"><label>{t('emailLabel')}</label><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div className="field"><label>{t('password')}</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          {error && <div style={{color:'crimson',marginTop:8}}>{error}</div>}
          <div style={{marginTop:12,display:'flex',gap:8}}>
            <button className="btn primary" type="submit">{t('login')}</button>
            <button type="button" className="btn" onClick={()=> setRoute('register')}>{t('register')}</button>
          </div>

          <div style={{marginTop:12}}>
            <button type="button" className="btn" onClick={signInWithGoogle}>{t('signInWithGoogle')}</button>
          </div>
        </form>
      </main>
    </div>
  )
}
