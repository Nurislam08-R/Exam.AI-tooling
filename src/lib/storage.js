import { createStore, get, set } from 'idb-keyval'

const store = createStore('smartbudget-db', 'kv')

export async function save(key, value){
  try{ await set(key, value, store) }catch(e){ console.warn('IDB save failed', e) }
}

export async function load(key, fallback){
  try{ const v = await get(key, store); return v === undefined ? fallback : v }catch(e){ console.warn('IDB load failed', e); return fallback }
}

export async function saveProfile(profile){
  return save('sb_profile', profile)
}

export async function loadProfile(){
  return load('sb_profile', {name:'Alex Doe', email:'alex@example.com', phone:'+1 555 1234'})
}

// Receipts are stored separately to avoid bloating the main expenses list.
export async function saveReceipt(dataUrl){
  if(!dataUrl) return null
  const id = `rcpt_${Date.now()}_${Math.floor(Math.random()*9000+1000)}`
  try{ await set(id, dataUrl, store); return id }catch(e){ console.warn('saveReceipt failed', e); return null }
}

export async function loadReceipt(id){
  if(!id) return null
  try{ const v = await get(id, store); return v }catch(e){ console.warn('loadReceipt failed', e); return null }
}

export async function deleteReceipt(id){
  if(!id) return
  try{ await set(id, undefined, store) }catch(e){ console.warn('deleteReceipt failed', e) }
}
