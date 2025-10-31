import React from 'react'
import { useTranslation } from 'react-i18next'

export default function ThemeSwitcher({theme, setTheme}){
  const { t } = useTranslation()

  function cycle(){
    const order = ['dark','light','system']
    const idx = order.indexOf(theme)
    const next = order[(idx+1) % order.length]
    try{ localStorage.setItem('sb_theme', next) }catch(e){}
    setTheme(next)
  }

  const labelIcon = theme === 'light' ? '☀️' : theme === 'system' ? '🖥️' : '🌙'
  const labelText = theme === 'light' ? 'Light' : theme === 'system' ? 'System' : 'Dark'

  return (
    <div className="theme-switcher theme-switcher--prominent" title={`Theme: ${labelText}`}>
      <button className="theme-btn prominent" onClick={cycle} aria-label={`Toggle theme (current: ${labelText})`}>
        <span className="theme-icon" aria-hidden>{labelIcon}</span>
        <span className="theme-label">{labelText}</span>
      </button>
    </div>
  )
}
