import React, { useState, useEffect } from 'react'
import Home from './components/Home'
import AddExpense from './components/AddExpense'
import Analytics from './components/Analytics'
import Profile from './components/Profile'
import ExpenseModal from './components/ExpenseModal'
import Snackbar from './components/Snackbar'
import LanguageSwitcher from './components/LanguageSwitcher'
import ThemeSwitcher from './components/ThemeSwitcher'
import AppearanceSettings from './components/AppearanceSettings'
import Register from './components/Register'
import Login from './components/Login'
import { save, load, saveProfile, loadProfile } from './lib/storage'
import './i18n'
import { useTranslation } from 'react-i18next'

export default function App(){
  const [route, setRoute] = useState('register')
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState(3000)
  const [expenses, setExpenses] = useState([])
  const [locale, setLocale] = useState('ru')
  const [theme, setTheme] = useState(() => {
    try{ return localStorage.getItem('sb_theme') || 'dark' }catch(e){ return 'dark' }
  })
  const [modal, setModal] = useState(null) // {type:'settings'|'expense', payload:...}
  const [profile, setProfile] = useState({name:'Alex Doe', email:'alex@example.com', phone:'+1 555 1234'})
  const [deletedStack, setDeletedStack] = useState([])
  const [snack, setSnack] = useState({open:false,message:'',action:null})

  const { t, i18n } = useTranslation()

  useEffect(()=>{
    // keep App.locale in sync when language is changed via i18n (e.g., LanguageSwitcher)
    const handle = (lng)=> setLocale(lng)
    try{ i18n.on('languageChanged', handle) }catch(e){}
    return ()=>{ try{ i18n.off('languageChanged', handle) }catch(e){} }
  },[i18n])

  useEffect(()=>{
    let mounted = true
    ;(async ()=>{
      const b = await load('sb_budget', 3000)
      const ex = await load('sb_expenses', [
        {id:1, title:'Coffee', amount:100, category:'Food'},
        {id:2, title:'Transport', amount:60, category:'Transport'},
        {id:3, title:'Groceries', amount:200, category:'Food'}
      ])
  const loc = await load('sb_locale', 'ru')
  const prof = await loadProfile()
      if(!mounted) return
      setBudget(b)
      // If an import was performed via Profile import helper, use it
      const imported = window.__IMPORTED_EXPENSES__
      if(imported && Array.isArray(imported)){
        setExpenses(imported)
        delete window.__IMPORTED_EXPENSES__
      } else {
        setExpenses(ex)
      }
    setLocale(loc)
    try{ i18n.changeLanguage(loc) }catch(e){}
  console.log('loaded locale from storage:', loc)
      setProfile(prof)
      // If there are already registered users, go to home; otherwise show registration
      try{
        const users = await load('sb_users', [])
        if(Array.isArray(users) && users.length>0) setRoute('home')
        else setRoute('register')
      }catch(e){ /* ignore */ }
      setLoading(false)
    })()
    // apply theme class to body (initial)
    try{
      if(theme === 'system'){
        const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)')
        const useLight = mq ? mq.matches : false
        if(useLight) document.body.classList.add('theme-light'); else document.body.classList.remove('theme-light')
      } else if(theme === 'light'){
        document.body.classList.add('theme-light')
      } else {
        document.body.classList.remove('theme-light')
      }
    }catch(e){}
    return ()=>{ mounted=false }
  },[])

  useEffect(()=>{ if(!loading) save('sb_budget', budget) },[budget, loading])
  useEffect(()=>{ console.log('locale changed ->', locale) },[locale])
  useEffect(()=>{ if(!loading) save('sb_expenses', expenses) },[expenses, loading])
  useEffect(()=>{ window.__EXPENSES__ = expenses },[expenses])
  useEffect(()=>{ if(!loading) { save('sb_locale', locale); try{ localStorage.setItem('sb_locale', locale) }catch(e){} } },[locale, loading])
  useEffect(()=>{ if(!loading) saveProfile(profile) },[profile, loading])

  useEffect(()=>{
    // apply theme and handle system preference
    try{
      if(theme === 'system'){
        const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)')
        const handler = (e)=>{
          if(e.matches) document.body.classList.add('theme-light')
          else document.body.classList.remove('theme-light')
        }
        if(mq){
          handler(mq)
          // modern browsers: addEventListener, fallback to addListener
          if(typeof mq.addEventListener === 'function') mq.addEventListener('change', handler)
          else if(typeof mq.addListener === 'function') mq.addListener(handler)
          // cleanup
          return ()=>{ if(typeof mq.removeEventListener === 'function') mq.removeEventListener('change', handler); else if(typeof mq.removeListener === 'function') mq.removeListener(handler) }
        }
      } else if(theme === 'light'){
        document.body.classList.add('theme-light')
      } else {
        document.body.classList.remove('theme-light')
      }
    }catch(e){ console.warn('theme apply failed', e) }
  },[theme])

  useEffect(()=>{
    if(!loading){
      try{
        setSnack({open:true, message: t('languageChanged'), action:null})
        const id = setTimeout(()=> setSnack({open:false,message:'',action:null}), 2500)
        return ()=> clearTimeout(id)
      }catch(e){ console.warn('locale toast failed', e) }
    }
  },[locale, loading])

  function addExpense(e){
    setExpenses(prev=>[...prev, {...e, id:Date.now()}])
  }

  function updateExpense(id, patch){
    setExpenses(prev=> prev.map(x=> x.id===id? {...x, ...patch}: x))
  }

  function deleteExpense(id){
    const toDelete = expenses.find(x=> x.id===id)
    setExpenses(prev=> prev.filter(x=> x.id!==id))
    setDeletedStack(prev=> [{...toDelete, deletedAt: Date.now()}, ...prev])
    setSnack({open:true,message:'Expense deleted',action:'Undo'})
  }

  function openSettings(){ setModal({type:'settings'}) }
  function openExpense(exp){ setModal({type:'expense', payload: exp}) }
  function closeModal(){ setModal(null) }

  function handleUndo(){
    const last = deletedStack[0]
    if(!last) return
    setExpenses(prev=> [last, ...prev])
    setDeletedStack(prev=> prev.slice(1))
    setSnack({open:false,message:'',action:null})
  }


  async function handleSaveExpense(updated){
    updateExpense(updated.id, updated)
    closeModal()
  }

  function handleAvatarChange(file){
    const reader = new FileReader()
    reader.onload = function(e){ setProfile(prev=> ({...prev, avatar: e.target.result})) }
    reader.readAsDataURL(file)
  }

  async function logout(){
    try{ await save('sb_profile', null) }catch(e){}
    try{ setProfile(null) }catch(e){}
    setRoute('register')
  }

  // t and i18n come from useTranslation above

  if(loading) return <div style={{padding:20}}>{t('loading')}</div>

  return (
    <div className="app-shell">
      <div className="app-topbar">
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <LanguageSwitcher />
              <ThemeSwitcher theme={theme} setTheme={setTheme} />
              {/* When logged in show avatar/name and logout; otherwise show register/login */}
              {profile && profile.email ? (
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="avatar" style={{width:32,height:32,borderRadius:16,objectFit:'cover'}} />
                  ) : (
                    <div style={{width:32,height:32,borderRadius:16,background:'var(--muted)',color:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>{(profile.name||'U').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div>
                  )}
                  <div style={{minWidth:80}}>{profile.name || profile.email}</div>
                  <button className="btn" onClick={logout}>{t('logout')|| 'Logout'}</button>
                </div>
              ) : (
                <>
                  <button className="btn" onClick={()=> setRoute('register')}>{t('register')}</button>
                  <button className="btn" onClick={()=> setRoute('login')}>{t('login')}</button>
                </>
              )}
        </div>
      </div>
  {route === 'home' && <Home budget={budget} expenses={expenses} onNavigate={setRoute} onOpenSettings={openSettings} onOpenExpense={openExpense} />}
  {route === 'register' && <Register setProfile={setProfile} setRoute={setRoute} />}
  {route === 'login' && <Login setProfile={setProfile} setRoute={setRoute} />}
  {route === 'add' && <AddExpense onAdd={addExpense} onNavigate={setRoute} />}
  {route === 'analytics' && <Analytics expenses={expenses} onNavigate={setRoute} />}
  {route === 'profile' && <Profile budget={budget} setBudget={setBudget} onNavigate={setRoute} profile={profile} setProfile={setProfile} theme={theme} setTheme={setTheme} />}

      <nav className="bottom-nav">
        <button onClick={()=>setRoute('home')} className={route==='home'? 'active':''} aria-label="home">🏠</button>
        <button onClick={()=>setRoute('add')} className={route==='add'? 'active':''} aria-label="add">➕</button>
        <button onClick={()=>setRoute('analytics')} className={route==='analytics'? 'active':''} aria-label="analytics">📊</button>
        <button onClick={()=>setRoute('profile')} className={route==='profile'? 'active':''} aria-label="profile">👤</button>
        
      </nav>

      {modal && modal.type === 'settings' && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <header className="modal-header"><h3>{t('settings')}</h3><button className="modal-close" onClick={closeModal}>✕</button></header>
            <div className="modal-body">
              <AppearanceSettings />
              <div style={{marginTop:12}}>
                <label>{t('budgetLabel')}</label>
                <input type="number" value={budget} onChange={e=>setBudget(Number(e.target.value))} />
              </div>
              <div style={{marginTop:12}}><button className="btn primary" onClick={closeModal}>{t('save')}</button></div>
            </div>
          </div>
        </div>
      )}
      {modal && modal.type === 'expense' && (
        <ExpenseModal expense={modal.payload} onSave={handleSaveExpense} onRequestDelete={(id)=>{ deleteExpense(id); closeModal() }} onClose={closeModal} />
      )}

  <Snackbar open={snack.open} message={snack.message} actionLabel={snack.action} onAction={handleUndo} onClose={()=> setSnack({open:false,message:'',action:null})} />
    </div>
  )
}
