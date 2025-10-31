import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const PRESETS = {
  darkMuted: {
    name: 'Dark Muted',
    vars: {
      '--bg': '#071018',
      '--surface': '#0a1118',
      '--card': '#0d1320',
      '--muted': '#9aa8b3',
      '--accent': '#3b6b78',
      '--accent-2': '#55607a',
      '--card-bg': '#0b1220',
      '--card-ink': '#dfeaf2'
    }
  },
  deepSlate: {
    name: 'Deep Slate',
    vars: {
      '--bg': '#0b0f13',
      '--surface': '#0f1720',
      '--card': '#11161c',
      '--muted': '#9aa2ab',
      '--accent': '#2f4a5a',
      '--accent-2': '#445566',
      '--card-bg': '#0f1720',
      '--card-ink': '#e6eef6'
    }
  },
  softTeal: {
    name: 'Soft Teal',
    vars: {
      '--bg': '#081219',
      '--surface': '#0d1b22',
      '--card': '#12202a',
      '--muted': '#9bb0b8',
      '--accent': '#2a8f8b',
      '--accent-2': '#3f6f6b',
      '--card-bg': '#0f1b22',
      '--card-ink': '#e8f6f5'
    }
  }
}

function applyVars(vars){
  const root = document.documentElement
  Object.entries(vars).forEach(([k,v])=> root.style.setProperty(k, v))
}

export default function AppearanceSettings(){
  const { t } = useTranslation()
  const [preset, setPreset] = useState(() => localStorage.getItem('sb_preset') || 'darkMuted')
  const [placement, setPlacement] = useState(() => localStorage.getItem('sb_switcher_pos') || 'center')
  const [compact, setCompact] = useState(() => localStorage.getItem('sb_compact_buttons') === '1')

  useEffect(()=>{
    // apply preset on mount
    const saved = localStorage.getItem('sb_preset') || preset
    if(PRESETS[saved]) applyVars(PRESETS[saved].vars)
    // apply placement
  applyPlacement(localStorage.getItem('sb_switcher_pos') || placement)
    // compact
    applyCompact(localStorage.getItem('sb_compact_buttons') === '1')
  },[])

  function handlePreset(key){
    setPreset(key)
    localStorage.setItem('sb_preset', key)
    applyVars(PRESETS[key].vars)
  }

  function applyPlacement(pos){
    document.body.classList.remove('theme-switcher-left','theme-switcher-center','theme-switcher-right')
    if(pos === 'left') document.body.classList.add('theme-switcher-left')
    else if(pos === 'center') document.body.classList.add('theme-switcher-center')
    else document.body.classList.add('theme-switcher-right')
    localStorage.setItem('sb_switcher_pos', pos)
    setPlacement(pos)
  }

  function applyCompact(flag){
    if(flag) document.body.classList.add('compact-buttons'); else document.body.classList.remove('compact-buttons')
    localStorage.setItem('sb_compact_buttons', flag ? '1' : '0')
    setCompact(flag)
  }

  function reset(){
    localStorage.removeItem('sb_preset')
    localStorage.removeItem('sb_switcher_pos')
    localStorage.removeItem('sb_compact_buttons')
    // restore default preset
    applyVars(PRESETS.darkMuted.vars)
  applyPlacement('center')
    applyCompact(false)
    setPreset('darkMuted')
  }

  return (
    <div style={{display:'grid',gap:12}}>
      <div className="card">
        <h4>{t('appearance')}</h4>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          {Object.entries(PRESETS).map(([k,p])=> (
            <button key={k} className={"btn" + (preset===k? ' active':'' )} onClick={()=>handlePreset(k)}>{p.name}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <h4>{t('buttonPlacement')}</h4>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <label className="muted"><input type="radio" name="placement" checked={placement==='left'} onChange={()=>applyPlacement('left')} /> {t('left')}</label>
          <label className="muted"><input type="radio" name="placement" checked={placement==='center'} onChange={()=>applyPlacement('center')} /> {t('center')}</label>
          <label className="muted"><input type="radio" name="placement" checked={placement==='right'} onChange={()=>applyPlacement('right')} /> {t('right')}</label>
        </div>
      </div>

      <div className="card">
        <h4>{t('controls')}</h4>
        <label style={{display:'flex',alignItems:'center',gap:8}} className="muted">
          <input type="checkbox" checked={compact} onChange={(e)=>applyCompact(e.target.checked)} /> {t('compactButtons')}
        </label>
        <div style={{marginTop:10}}>
          <button className="btn outline" onClick={reset}>{t('resetAppearance')}</button>
        </div>
        <div style={{marginTop:12}}>
          <label style={{display:'block',marginBottom:8}}>{t('googleClientId') || 'Google Client ID'}</label>
          <input value={localStorage.getItem('sb_google_client_id') || ''} onChange={(e)=>{ try{ localStorage.setItem('sb_google_client_id', e.target.value) }catch(err){} }} placeholder={t('googleClientIdPlaceholder') || ''} />
        </div>
      </div>
    </div>
  )
}
