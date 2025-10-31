import React from 'react'
import { IconFood, IconTransport } from './icons'
import { useTranslation } from 'react-i18next'

export default function Home({budget, expenses, onNavigate, onOpenSettings, onOpenExpense}){
  const { t } = useTranslation()
  const spent = expenses.reduce((s,e)=>s+Number(e.amount),0)
  const percent = Math.min(100, Math.round((spent/budget)*100))

  return (
    <div className="screen">
        <header className="header">
        <button className="menu btn" onClick={()=>alert(t('menu') + ': soon')}>☰</button>
        <h1>{t('appTitle')}</h1>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <button className="btn" onClick={onOpenSettings}>⚙️</button>
        </div>
      </header>

      <main>
        <section className="budget-card card">
          <div className="budget-top">
            <div>
              <h3>{t('currentBudget')}</h3>
              <div className="budget-amount">{budget}</div>
              <div style={{color:'var(--muted)',fontSize:13}}>{t('remaining')}: <strong style={{color:'var(--accent)'}}>{Math.max(0, budget - spent)}</strong></div>
            </div>
            <div className="donut">
              <div className="donut-fill" style={{background:`conic-gradient(var(--accent) ${percent}%, rgba(255,255,255,0.06) ${percent}% )`}} />
            </div>
          </div>
          <div style={{display:'flex',gap:12,marginTop:12}}>
            <button className="btn">{t('totalSpent')}: <strong style={{marginLeft:8}}>{spent}</strong></button>
            <button className="btn">{t('expenses')}: <strong style={{marginLeft:8}}>{expenses.length}</strong></button>
          </div>
        </section>

        <section className="expenses-list">
          <h3>{t('latestExpenses')}</h3>
          <ul>
            {expenses.slice().reverse().slice(0,3).map(e=> (
              <li key={e.id} className="expense-row" onClick={()=> onOpenExpense(e)}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div className="icon">{e.category==='Food'? <IconFood/>: e.category==='Transport'? <IconTransport/>: <IconFood/>}</div>
                  <div className="text">{e.title}<div style={{fontSize:12,color:'var(--muted)'}}>{e.note|| ''}</div></div>
                </div>
                <div className="amount">{e.amount}</div>
              </li>
            ))}
          </ul>

          <div style={{marginTop:10,display:'flex',gap:8}}>
            <button className="btn primary" onClick={()=> onNavigate('add')}>{t('addExpense')}</button>
            <button className="btn" onClick={()=> onNavigate('analytics')}>{t('viewAnalytics')}</button>
          </div>
        </section>
      </main>
    </div>
  )
}
