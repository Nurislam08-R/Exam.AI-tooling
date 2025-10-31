import React from 'react'
import { IconUser } from './icons'
import { useTranslation } from 'react-i18next'

export default function Profile({ budget, setBudget, onNavigate, profile, setProfile, theme, setTheme }) {
  const { t } = useTranslation()
  const [name, setName] = React.useState(profile?.name || 'Alex Doe')
  const [email, setEmail] = React.useState(profile?.email || 'alex@example.com')
  const [phone, setPhone] = React.useState(profile?.phone || '+1 555 1234')
  const [address, setAddress] = React.useState(profile?.address || '')
  const [currency, setCurrency] = React.useState(profile?.currency || 'USD')
  const [timezone, setTimezone] = React.useState(profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC')
  const [defaultPayment, setDefaultPayment] = React.useState(profile?.defaultPayment || 'Card')
  const [notifications, setNotifications] = React.useState(profile?.notifications ?? true)
  const [lastSaved, setLastSaved] = React.useState(profile?.savedAt || null)
  const [emailError, setEmailError] = React.useState('')
  const [phoneError, setPhoneError] = React.useState('')

  function handleSave() {
    const eErr = validateEmail(email) ? '' : t('invalidEmail')
    const pErr = validatePhone(phone) ? '' : t('invalidPhone')
    setEmailError(eErr)
    setPhoneError(pErr)
    if (eErr || pErr) return
    const payload = {
      ...profile,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      currency,
      timezone,
      defaultPayment,
      notifications,
      savedAt: Date.now()
    }
    setProfile(payload)
    setLastSaved(payload.savedAt)
  }

  function handleAvatarFile(file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setProfile(prev => ({ ...prev, avatar: ev.target.result }))
    reader.readAsDataURL(file)
  }

  function validateEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  }

  function validatePhone(p) {
    return /^[+()\d\s-]{6,20}$/.test(p)
  }

  return (
    <div className="screen profile-screen dark-theme">
      <header className="header profile-header glass">
        <button onClick={() => onNavigate('home')} className="back subtle">←</button>
        <h1 className="title">{t('profile')}</h1>
        <div />
      </header>

      <main className="profile-main">
        <section className="profile-side glass card">
          <div className="profile-top">
            <div className="avatar large" title={t('changeAvatar')}>
              {profile?.avatar ? (
                <img src={profile.avatar} alt="avatar" />
              ) : (
                <div className="avatar-placeholder">
                  <IconUser size={40} />
                </div>
              )}
              <label className="avatar-upload">
                <input type="file" accept="image/*" onChange={e => handleAvatarFile(e.target.files?.[0])} />
                <span className="edit">{t('edit')}</span>
              </label>
            </div>

            <div className="profile-identity">
              <h2 className="name">{name}</h2>
              <div className="muted email">{email}</div>
              <div className="muted phone">{phone}</div>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn primary wide" onClick={handleSave}>{t('saveChanges')}</button>
            <button className="btn outline wide" onClick={() => onNavigate('home')}>{t('backToBudget')}</button>
          </div>

          {lastSaved && (
            <div className="muted small last-saved">
              {t('lastSaved')}: {new Date(lastSaved).toLocaleString()}
            </div>
          )}
        </section>

        <section className="profile-form glass card">
          <h3 className="section-title">{t('personalDetails')}</h3>

          <div className="form-grid">
            <div className="field">
              <label>{t('nameLabel')}</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={t('placeholderName')} />
            </div>

            <div className="field">
              <label>{t('emailLabel')}</label>
              <input
                className={emailError ? 'error' : ''}
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setEmailError(validateEmail(e.target.value) ? '' : t('invalidEmail'))
                }}
                placeholder={t('placeholderEmail')}
              />
              {emailError && <div className="error-text">{emailError}</div>}
            </div>

            <div className="field">
              <label>{t('phoneLabel')}</label>
              <input
                className={phoneError ? 'error' : ''}
                value={phone}
                onChange={e => {
                  setPhone(e.target.value)
                  setPhoneError(validatePhone(e.target.value) ? '' : t('invalidPhone'))
                }}
                placeholder={t('placeholderPhone')}
              />
              {phoneError && <div className="error-text">{phoneError}</div>}
            </div>
            
            <div className="field">
              <label>{t('addressLabel')}</label>
              <input value={address} onChange={e => setAddress(e.target.value)} placeholder={t('placeholderAddress') || ''} />
            </div>

            <div className="field">
              <label>{t('currencyLabel')}</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="RUB">RUB</option>
                <option value="GBP">GBP</option>
              </select>
            </div>

            <div className="field">
              <label>{t('timezoneLabel')}</label>
              <input value={timezone} onChange={e => setTimezone(e.target.value)} placeholder="Europe/Moscow" />
            </div>

            <div className="field">
              <label>{t('defaultPaymentLabel')}</label>
              <select value={defaultPayment} onChange={e => setDefaultPayment(e.target.value)}>
                <option>Card</option>
                <option>Cash</option>
                <option>Bank transfer</option>
              </select>
            </div>

            <div className="field">
              <label>{t('notifications')}</label>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <label className="muted"><input type="radio" name="notif" checked={notifications===true} onChange={()=>setNotifications(true)} /> {t('yes')}</label>
                <label className="muted"><input type="radio" name="notif" checked={notifications===false} onChange={()=>setNotifications(false)} /> {t('no')}</label>
              </div>
            </div>
          </div>

          <div className="extras">
            <button className="btn secondary" onClick={() => alert(t('settings'))}>{t('settings')}</button>
            <button className="btn secondary" onClick={() => alert(t('help'))}>{t('help')}</button>
            <div style={{marginTop:8}}>
              <button
                className="btn"
                onClick={() => {
                  try { localStorage.setItem('sb_theme', 'dark') } catch (e) {}
                  try { setTheme && setTheme('dark') } catch (e) {}
                  // ensure body class matches the new theme
                  try { document.body.classList.remove('theme-light') } catch (e) {}
                  alert(t('themeSet') || 'Theme set to dark')
                }}
              >
                {t('setDarkTheme')}
              </button>
            </div>

            <div className="import-export">
              <button
                className="btn neon"
                onClick={() => {
                  const data = { profile, expenses: window.__EXPENSES__ || [], budget }
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = 'smartbudget-export.json'; a.click(); URL.revokeObjectURL(url)
                }}
              >
                {t('exportJSON')}
              </button>

              <label className="btn neon">
                {t('importJSON')}
                <input
                  type="file"
                  accept="application/json"
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const reader = new FileReader()
                    reader.onload = ev => {
                      try {
                        const obj = JSON.parse(ev.target.result)
                        if (obj.profile) setProfile(obj.profile)
                        if (obj.budget) setBudget(obj.budget)
                        if (obj.expenses) window.__IMPORTED_EXPENSES__ = obj.expenses
                        alert(t('importSuccess') || 'Imported successfully')
                      } catch (err) {
                        alert(t('invalidJSON') || 'Invalid JSON')
                      }
                    }
                    reader.readAsText(f)
                  }}
                />
              </label>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
