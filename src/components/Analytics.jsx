import React from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { useTranslation } from 'react-i18next'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export default function Analytics({expenses, onNavigate}){
  const { t } = useTranslation()
  const byCat = expenses.reduce((acc,e)=>{acc[e.category]=(acc[e.category]||0)+Number(e.amount);return acc},{})
  const items = Object.entries(byCat)

  const labels = items.map(i=>i[0])
  const data = {
    labels,
    datasets: [
      {
          label: t('expenses'),
          data: items.map(i=>i[1]),
        backgroundColor: ['#60a5fa','#f97316','#34d399','#f472b6'],
        borderRadius: 6
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: { enabled: true }
    },
    scales: {
      y: { beginAtZero: true }
    }
  }

  return (
    <div className="screen">
      <header className="header">
        <button onClick={()=>onNavigate('home')} className="back">←</button>
        <h1>{t('analytics')}</h1>
        <div />
      </header>

      <main>
        <div className="segmented">
          <button className="active">Day</button>
          <button>Week</button>
          <button>Month</button>
        </div>

        <div className="chart card">
          {items.length===0 ? <div className="empty">{t('noData')}</div> : <Bar data={data} options={options} /> }
        </div>

        <div className="bycat card">
          <h3>{t('expensesByCategory')}</h3>
          <ul>
            {items.map(([k,v])=> (
              <li key={k}><span className="icon">{k==='Food'? <svg width="18" height="18" viewBox="0 0 24 24"><path d="M8 3v12" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : k==='Transport'? <svg width="18" height="18" viewBox="0 0 24 24"><path d="M3 13h18v-3a2 2 0 0 0-2-2h-2l-1-3H9L8 8H6a2 2 0 0 0-2 2v3z" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 2v20M2 12h20" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}</span><span>{k}</span><span className="amt">{v}</span></li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}
