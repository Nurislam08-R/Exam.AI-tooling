const puppeteer = require('puppeteer')

;(async ()=>{
  const url = process.env.URL || 'http://localhost:5173/'
  console.log('Launching browser...')
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
  const page = await browser.newPage()
  page.setDefaultTimeout(15000)

  try{
    console.log('Opening app:', url)
    await page.goto(url, { waitUntil: 'networkidle2' })

    // Inject profile into IndexedDB (smartbudget-db / kv / key: sb_profile)
    const profile = { id: Date.now(), name: 'PUppet User', email: 'puppet@example.com', avatar: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=='}
    await page.evaluate((p)=>{
      return new Promise((resolve, reject)=>{
        const req = indexedDB.open('smartbudget-db')
        req.onupgradeneeded = ()=>{ try{ req.result.createObjectStore('kv') }catch(e){} }
        req.onsuccess = ()=>{
          const db = req.result
          const tx = db.transaction('kv','readwrite')
          const store = tx.objectStore('kv')
          const r = store.put(p, 'sb_profile')
          tx.oncomplete = ()=> resolve(true)
          tx.onerror = ()=> reject(tx.error)
        }
        req.onerror = ()=> reject(req.error)
      })
    }, profile)

    // Reload to let app pick up profile
    await page.reload({ waitUntil: 'networkidle2' })

    // Check for avatar image in topbar
    console.log('Checking for avatar...')
    await page.waitForSelector('.app-topbar img[alt="avatar"]', { timeout: 5000 })
    console.log('Avatar found')

    // Click Logout button (button after name)
    console.log('Clicking logout...')
    await page.evaluate(()=>{
      const top = document.querySelector('.app-topbar')
      if(!top) throw new Error('topbar not found')
      const img = top.querySelector('img[alt="avatar"]')
      if(img){
        const btn = img.parentElement.querySelector('button')
        if(btn) btn.click()
      } else {
        // fallback: click any button with text Logout
        const btns = top.querySelectorAll('button')
        for(const b of btns){ if(/logout/i.test(b.innerText)) { b.click(); break } }
      }
    })

  // Wait a bit and verify avatar is gone
  await new Promise(r=>setTimeout(r,800))
    const avatarExists = await page.evaluate(()=> !!document.querySelector('.app-topbar img[alt="avatar"]'))
    if(avatarExists) throw new Error('Avatar still present after logout')

    console.log('Logout successful, avatar removed. Smoke test PASSED')
    await browser.close()
    process.exit(0)
  }catch(err){
    console.error('Smoke test FAILED:', err && err.message? err.message : err)
    try{ await browser.close() }catch(e){}
    process.exit(2)
  }

})()
