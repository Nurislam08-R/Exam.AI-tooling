import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher(){
  const { i18n } = useTranslation()
  const initial = (typeof localStorage !== 'undefined' && localStorage.getItem('sb_locale')) || i18n.language || 'en'
  const [lang, setLang] = useState(initial)

  useEffect(()=>{
    // ensure local state follows i18n changes (and vice-versa)
    const handler = (lng)=> setLang(lng)
    try{
      i18n.on && i18n.on('languageChanged', handler)
    }catch(e){}
    // sync localStorage -> i18n on mount if needed
    try{
      const stored = localStorage.getItem('sb_locale')
      if(stored && stored !== i18n.language) i18n.changeLanguage(stored).catch(()=>{})
    }catch(e){}
    return ()=>{ try{ i18n.off && i18n.off('languageChanged', handler) }catch(e){} }
  },[i18n])

  function change(l){
    try{
      i18n.changeLanguage(l)
      try{ localStorage.setItem('sb_locale', l) }catch(e){}
      setLang(l)
      console.log('LanguageSwitcher -> change', l)
    }catch(e){ console.warn('language switch failed', e) }
  }

  return (
    <div className="lang-switcher" role="tablist" aria-label="Language switcher">
      <button className={`lang-btn ${lang==='en' ? 'active':''}`} onClick={()=> change('en')} aria-pressed={lang==='en'}>EN</button>
      <button className={`lang-btn ${lang==='ru' ? 'active':''}`} onClick={()=> change('ru')} aria-pressed={lang==='ru'}>RU</button>
    </div>
  )
}
