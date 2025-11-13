import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { Home, Users, ShoppingCart, Package, LogOut, Settings, Menu, Plus, X } from 'lucide-react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || ''

function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'))
  const login = (t, u) => { localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); setToken(t); setUser(u) }
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(''); setUser(null) }
  return { token, user, login, logout }
}

async function apiFetch(path, options = {}){
  const token = localStorage.getItem('token') || ''
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers||{}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
  })
  if(!res.ok){
    let msg = 'Request failed'
    try { const j = await res.json(); msg = j.detail || JSON.stringify(j) } catch {}
    throw new Error(msg)
  }
  try { return await res.json() } catch { return null }
}

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      <div className="relative hidden lg:block">
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/41MGRk-UDPKO-l6W/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/60" />
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/60 p-8">
          <div className="mb-8 text-center">
            <div className="text-3xl font-bold tracking-tight">FinDash</div>
            <div className="text-slate-500">Modern analytics dashboard</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

function LoginPage({ onAuth }) {
  const nav = useNavigate()
  const [email, setEmail] = useState('demo@fins.io')
  const [password, setPassword] = useState('demo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
      onAuth(data.token, data.user); nav('/dashboard')
    } catch(err){ setError(err.message) } finally { setLoading(false) }
  }
  return (
    <AuthLayout>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">{error}</div>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl border focus:ring-2 ring-blue-500 outline-none" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl border focus:ring-2 ring-blue-500 outline-none" />
        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition">{loading? 'Signing in...' : 'Sign in'}</button>
        <div className="text-center text-sm">No account? <Link to="/signup" className="text-blue-600">Sign up</Link></div>
      </form>
    </AuthLayout>
  )
}

function SignupPage({ onAuth }) {
  const nav = useNavigate()
  const [name, setName] = useState('Demo User')
  const [email, setEmail] = useState('demo@fins.io')
  const [password, setPassword] = useState('demo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const data = await apiFetch('/auth/signup', { method: 'POST', body: JSON.stringify({ name, email, password }) })
      onAuth(data.token, data.user); nav('/dashboard')
    } catch(err){ setError(err.message) } finally { setLoading(false) }
  }
  return (
    <AuthLayout>
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">{error}</div>}
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="w-full px-4 py-3 rounded-xl border focus:ring-2 ring-blue-500 outline-none" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 rounded-xl border focus:ring-2 ring-blue-500 outline-none" />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 rounded-xl border focus:ring-2 ring-blue-500 outline-none" />
        <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition">{loading? 'Creating account...' : 'Create account'}</button>
        <div className="text-center text-sm">Have an account? <Link to="/login" className="text-blue-600">Sign in</Link></div>
      </form>
    </AuthLayout>
  )
}

function Layout({ children, onLogout }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className={`bg-white border-r w-64 p-4 space-y-2 fixed inset-y-0 left-0 z-20 transform transition-transform ${open? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="font-bold text-xl px-2 pb-4">FinDash</div>
        <NavLink to="/dashboard" icon={<Home size={18}/>} label="Dashboard" />
        <NavLink to="/customers" icon={<Users size={18}/>} label="Customers" />
        <NavLink to="/orders" icon={<ShoppingCart size={18}/>} label="Orders" />
        <NavLink to="/products" icon={<Package size={18}/>} label="Products" />
        <div className="pt-6 border-t mt-6" />
        <NavLink to="/settings" icon={<Settings size={18}/>} label="Settings" />
      </aside>
      <div className="flex-1 md:ml-64">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div className="flex items-center gap-3 p-3">
            <button className="md:hidden p-2" onClick={()=>setOpen(!open)}><Menu /></button>
            <div className="font-semibold">Overview</div>
            <div className="ml-auto flex items-center gap-3">
              <button className="text-sm text-slate-600 hover:text-slate-800 flex items-center gap-1" onClick={onLogout}><LogOut size={16}/>Logout</button>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

function NavLink({ to, icon, label }){
  return (
    <Link to={to} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700">
      <span className="opacity-70">{icon}</span>
      <span>{label}</span>
    </Link>
  )
}

function Toast({ message, type = 'success', onClose }){
  if(!message) return null
  const color = type === 'error' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
  return (
    <div className={`flex items-center justify-between border px-3 py-2 rounded ${color}`}>
      <span className="text-sm">{message}</span>
      <button onClick={onClose} className="text-xs opacity-60 hover:opacity-100">Dismiss</button>
    </div>
  )
}

function KPI({ title, value, delta }){
  const color = delta >= 0 ? 'text-emerald-600' : 'text-rose-600'
  const bg = delta >= 0 ? 'bg-emerald-50' : 'bg-rose-50'
  return (
    <div className="bg-white rounded-xl p-4 border">
      <div className="text-slate-500 text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className={`inline-block mt-2 text-xs px-2 py-1 rounded ${bg} ${color}`}>{delta}% vs last period</div>
    </div>
  )
}

function Chart({ data }){
  // Simple SVG area chart
  if(!data?.length) return <div className="text-sm text-slate-500">No data</div>
  const max = Math.max(...data.map(d=>d.sales))
  const points = data.map((d,i)=> `${(i/(data.length-1))*100},${100 - (d.sales/max)*100}`).join(' ')
  return (
    <svg viewBox="0 0 100 100" className="w-full h-40">
      <polyline fill="#dbeafe" stroke="#3b82f6" strokeWidth="1" points={`0,100 ${points} 100,100`} />
    </svg>
  )
}

function Dashboard(){
  const [range, setRange] = useState({start: '', end: ''})
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState({ total_sales:0, orders_count:0, avg_order_value:0, top_categories:[], trend:[] })
  const params = new URLSearchParams()
  if(range.start) params.append('start_date', range.start)
  if(range.end) params.append('end_date', range.end)
  if(category) params.append('category', category)

  useEffect(()=>{ (async()=>{
    setLoading(true)
    try{
      const json = await apiFetch(`/analytics/overview?${params.toString()}`)
      setData(json)
    } finally { setLoading(false) }
  })() }, [range.start, range.end, category])

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <KPI title="Total Sales" value={`$${data.total_sales.toLocaleString()}`} delta={12} />
        <KPI title="Orders" value={data.orders_count} delta={5} />
        <KPI title="Avg Order Value" value={`$${data.avg_order_value}`} delta={-3} />
      </div>

      <div className="bg-white rounded-xl p-4 border">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">Start</label>
            <input type="date" value={range.start} onChange={e=>setRange(r=>({...r,start:e.target.value}))} className="px-3 py-2 rounded border" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">End</label>
            <input type="date" value={range.end} onChange={e=>setRange(r=>({...r,end:e.target.value}))} className="px-3 py-2 rounded border" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-slate-500">Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="px-3 py-2 rounded border">
              <option value="">All</option>
              <option value="subscriptions">Subscriptions</option>
              <option value="hardware">Hardware</option>
              <option value="services">Services</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          {loading ? <div className="text-sm text-slate-500">Loading...</div> : <Chart data={data.trend} />}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 border">
          <div className="font-semibold mb-2">Top Categories</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="text-left py-2">Category</th>
                <th className="text-right">Sales</th>
              </tr>
            </thead>
            <tbody>
            {data.top_categories.map((c, i)=> (
              <tr key={i} className="border-t">
                <td className="py-2">{c.category}</td>
                <td className="text-right">${c.sales.toLocaleString()}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl p-4 border">
          <div className="font-semibold mb-2">Recent Orders</div>
          <OrdersTable compact />
        </div>
      </div>
    </div>
  )
}

function DataTable({ columns, rows, onEdit, onDelete }){
  return (
    <div className="overflow-auto border rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map(c=> <th key={c.key} className="text-left px-4 py-2 text-slate-500 font-medium">{c.label}</th>)}
            <th className="px-4"/>
          </tr>
        </thead>
        <tbody>
          {rows.map(row=> (
            <tr key={row.id} className="border-t">
              {columns.map(c=> <td key={c.key} className="px-4 py-2">{row[c.key]}</td>)}
              <td className="px-4 py-2 text-right whitespace-nowrap">
                {onEdit && <button onClick={()=>onEdit(row)} className="text-blue-600 mr-3">Edit</button>}
                {onDelete && <button onClick={()=>onDelete(row)} className="text-rose-600">Delete</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Modal({ open, title, onClose, children }){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl border p-4 mx-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose} className="p-2 rounded hover:bg-slate-100"><X size={16}/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function CustomerForm({ initial, onSubmit, submitting }){
  const [name, setName] = useState(initial?.name || '')
  const [email, setEmail] = useState(initial?.email || '')
  const [status, setStatus] = useState(initial?.status || 'active')
  const [error, setError] = useState('')

  const handleSubmit = (e)=>{
    e.preventDefault(); setError('')
    if(!name.trim()) return setError('Name is required')
    if(!email.trim() || !email.includes('@')) return setError('Valid email is required')
    onSubmit({ name, email, status })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">{error}</div>}
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" className="px-3 py-2 rounded border" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="px-3 py-2 rounded border" />
      </div>
      <div>
        <label className="text-xs text-slate-500">Status</label>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="px-3 py-2 rounded border w-full">
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button type="submit" disabled={submitting} className="px-3 py-2 bg-slate-900 text-white rounded">{submitting ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

function ProductForm({ initial, onSubmit, submitting }){
  const [title, setTitle] = useState(initial?.title || '')
  const [price, setPrice] = useState(initial?.price ?? '')
  const [category, setCategory] = useState(initial?.category || '')
  const [in_stock, setInStock] = useState(initial?.in_stock ?? true)
  const [error, setError] = useState('')

  const handleSubmit = (e)=>{
    e.preventDefault(); setError('')
    if(!title.trim()) return setError('Title is required')
    const p = parseFloat(price)
    if(Number.isNaN(p) || p < 0) return setError('Price must be a valid number >= 0')
    if(!category.trim()) return setError('Category is required')
    onSubmit({ title, price: p, category, in_stock })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">{error}</div>}
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="px-3 py-2 rounded border w-full" />
      <div className="grid sm:grid-cols-3 gap-3">
        <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price" className="px-3 py-2 rounded border" />
        <select value={category} onChange={e=>setCategory(e.target.value)} className="px-3 py-2 rounded border">
          <option value="">Select category</option>
          <option value="subscriptions">subscriptions</option>
          <option value="hardware">hardware</option>
          <option value="services">services</option>
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={in_stock} onChange={e=>setInStock(e.target.checked)} />In stock</label>
      </div>
      <div className="flex justify-end gap-2">
        <button type="submit" disabled={submitting} className="px-3 py-2 bg-slate-900 text-white rounded">{submitting ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

function OrderItemsEditor({ products, items, setItems }){
  const addItem = ()=> setItems([...items, { product_id: products[0]?.id || '', quantity: 1, price: products[0]?.price || 0 }])
  const update = (idx, patch)=> setItems(items.map((it,i)=> i===idx? { ...it, ...patch } : it))
  const remove = (idx)=> setItems(items.filter((_,i)=> i!==idx))
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">Items</div>
        <button type="button" onClick={addItem} className="text-blue-600 flex items-center gap-1"><Plus size={14}/>Add item</button>
      </div>
      {items.length === 0 && <div className="text-xs text-slate-500">No items yet</div>}
      {items.map((it, idx)=> {
        const prod = products.find(p=>p.id===it.product_id)
        return (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
            <select className="col-span-6 px-3 py-2 rounded border" value={it.product_id} onChange={e=>{
              const p = products.find(pr=>pr.id===e.target.value)
              update(idx, { product_id: e.target.value, price: p ? p.price : it.price })
            }}>
              <option value="">Select product</option>
              {products.map(p=> <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <input className="col-span-2 px-3 py-2 rounded border" type="number" min="1" value={it.quantity} onChange={e=>update(idx,{ quantity: parseInt(e.target.value||'1',10) })} />
            <input className="col-span-3 px-3 py-2 rounded border" type="number" step="0.01" value={it.price} onChange={e=>update(idx,{ price: parseFloat(e.target.value||'0') })} />
            <button type="button" onClick={()=>remove(idx)} className="col-span-1 text-rose-600">Remove</button>
          </div>
        )
      })}
    </div>
  )
}

function OrderForm({ initial, onSubmit, submitting }){
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [customer_id, setCustomerId] = useState(initial?.customer_id || '')
  const [status, setStatus] = useState(initial?.status || 'paid')
  const [items, setItems] = useState(initial?.items || [])
  const [error, setError] = useState('')

  useEffect(()=>{ (async()=>{
    try {
      const [cs, ps] = await Promise.all([
        apiFetch('/customers'),
        apiFetch('/products')
      ])
      setCustomers(cs); setProducts(ps)
      if(!customer_id && cs?.length) setCustomerId(cs[0].id)
    } catch{}
  })() }, [])

  const handleSubmit = (e)=>{
    e.preventDefault(); setError('')
    if(!customer_id) return setError('Customer is required')
    if(!items.length) return setError('At least one item is required')
    for(const it of items){
      if(!it.product_id) return setError('Each item must have a product')
      if(!it.quantity || it.quantity < 1) return setError('Quantity must be >= 1')
      if(it.price == null || isNaN(it.price) || it.price < 0) return setError('Price must be valid')
    }
    onSubmit({ customer_id, items, status })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded">{error}</div>}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-500">Customer</label>
          <select className="px-3 py-2 rounded border w-full" value={customer_id} onChange={e=>setCustomerId(e.target.value)}>
            <option value="">Select customer</option>
            {customers.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500">Status</label>
          <select className="px-3 py-2 rounded border w-full" value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="paid">paid</option>
            <option value="pending">pending</option>
            <option value="refunded">refunded</option>
            <option value="shipped">shipped</option>
          </select>
        </div>
      </div>
      <OrderItemsEditor products={products} items={items} setItems={setItems} />
      <div className="flex justify-end gap-2">
        <button type="submit" disabled={submitting} className="px-3 py-2 bg-slate-900 text-white rounded">{submitting ? 'Saving...' : 'Save'}</button>
      </div>
    </form>
  )
}

function CustomersPage(){
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async()=>{
    const data = await apiFetch(`/customers${q? `?q=${encodeURIComponent(q)}`:''}`)
    setRows(data)
  }
  useEffect(()=>{ load() }, [q])

  const onDelete = async (r)=>{ try{ await apiFetch(`/customers/${r.id}`, { method:'DELETE' }); setToast({ message: 'Customer deleted', type: 'success' }); load() } catch(e){ setToast({ message: e.message, type: 'error' }) } }

  const openCreate = ()=> { setEditing(null); setOpen(true) }
  const openEdit = (row)=> { setEditing(row); setOpen(true) }
  const onSubmit = async (payload)=>{
    setSubmitting(true)
    try{
      if(editing){ await apiFetch(`/customers/${editing.id}`, { method:'PUT', body: JSON.stringify(payload) }) }
      else { await apiFetch('/customers', { method:'POST', body: JSON.stringify(payload) }) }
      setOpen(false); setToast({ message: 'Saved successfully', type: 'success' }); load()
    } catch(e){ setToast({ message: e.message, type: 'error' }) } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search customers" className="px-3 py-2 rounded border" />
        <button onClick={load} className="px-3 py-2 rounded bg-slate-900 text-white">Refresh</button>
        <button onClick={openCreate} className="px-3 py-2 rounded bg-blue-600 text-white flex items-center gap-1"><Plus size={14}/>New</button>
      </div>
      <Toast message={toast.message} type={toast.type} onClose={()=>setToast({ message:'', type:'success' })} />
      <DataTable columns={[{key:'name',label:'Name'},{key:'email',label:'Email'},{key:'status',label:'Status'}]} rows={rows} onEdit={openEdit} onDelete={onDelete} />

      <Modal open={open} title={editing? 'Edit Customer' : 'New Customer'} onClose={()=>setOpen(false)}>
        <CustomerForm initial={editing} onSubmit={onSubmit} submitting={submitting} />
      </Modal>
    </div>
  )
}

function ProductsPage(){
  const [rows, setRows] = useState([])
  const [category, setCategory] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async()=>{
    const url = new URL(`${API_BASE}/products`, window.location.origin)
    if(category) url.searchParams.set('category', category)
    const data = await (await fetch(url.toString().replace(window.location.origin, ''))).json()
    setRows(data)
  }
  useEffect(()=>{ load() }, [category])

  const onDelete = async (r)=>{ try{ await apiFetch(`/products/${r.id}`, { method:'DELETE' }); setToast({ message: 'Product deleted', type: 'success' }); load() } catch(e){ setToast({ message: e.message, type: 'error' }) } }

  const openCreate = ()=> { setEditing(null); setOpen(true) }
  const openEdit = (row)=> { setEditing(row); setOpen(true) }
  const onSubmit = async (payload)=>{
    setSubmitting(true)
    try{
      if(editing){ await apiFetch(`/products/${editing.id}`, { method:'PUT', body: JSON.stringify(payload) }) }
      else { await apiFetch('/products', { method:'POST', body: JSON.stringify(payload) }) }
      setOpen(false); setToast({ message: 'Saved successfully', type: 'success' }); load()
    } catch(e){ setToast({ message: e.message, type: 'error' }) } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-slate-500">Category</label>
          <select value={category} onChange={e=>setCategory(e.target.value)} className="px-3 py-2 rounded border">
            <option value="">All</option>
            <option value="subscriptions">Subscriptions</option>
            <option value="hardware">Hardware</option>
            <option value="services">Services</option>
          </select>
        </div>
        <button onClick={load} className="px-3 py-2 rounded bg-slate-900 text-white">Refresh</button>
        <button onClick={openCreate} className="px-3 py-2 rounded bg-blue-600 text-white flex items-center gap-1"><Plus size={14}/>New</button>
      </div>
      <Toast message={toast.message} type={toast.type} onClose={()=>setToast({ message:'', type:'success' })} />
      <DataTable columns={[{key:'title',label:'Title'},{key:'price',label:'Price'},{key:'category',label:'Category'}]} rows={rows} onEdit={openEdit} onDelete={onDelete} />

      <Modal open={open} title={editing? 'Edit Product' : 'New Product'} onClose={()=>setOpen(false)}>
        <ProductForm initial={editing} onSubmit={onSubmit} submitting={submitting} />
      </Modal>
    </div>
  )
}

function OrdersTable({ compact }){
  const [rows, setRows] = useState([])
  const load = async()=>{ const r = await apiFetch('/orders'); setRows(r) }
  useEffect(()=>{ load() }, [])
  const onDelete = async (row)=>{ await apiFetch(`/orders/${row.id}`, { method:'DELETE' }); load() }
  return (
    <DataTable columns={[{key:'customer_name',label:'Customer'},{key:'status',label:'Status'},{key:'order_date',label:'Date'}]} rows={rows} onDelete={onDelete} />
  )
}

function OrdersPage(){
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('')
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const load = async()=>{
    const q = status ? `?status=${encodeURIComponent(status)}` : ''
    const data = await apiFetch(`/orders${q}`)
    setRows(data)
  }
  useEffect(()=>{ load() }, [status])

  const onDelete = async (r)=>{ try{ await apiFetch(`/orders/${r.id}`, { method:'DELETE' }); setToast({ message: 'Order deleted', type: 'success' }); load() } catch(e){ setToast({ message: e.message, type: 'error' }) } }

  const openCreate = ()=> { setEditing(null); setOpen(true) }
  const openEdit = (row)=> { setEditing(row); setOpen(true) }
  const onSubmit = async (payload)=>{
    setSubmitting(true)
    try{
      if(editing){ await apiFetch(`/orders/${editing.id}`, { method:'PUT', body: JSON.stringify(payload) }) }
      else { await apiFetch('/orders', { method:'POST', body: JSON.stringify(payload) }) }
      setOpen(false); setToast({ message: 'Saved successfully', type: 'success' }); load()
    } catch(e){ setToast({ message: e.message, type: 'error' }) } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-slate-500">Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="px-3 py-2 rounded border">
            <option value="">All</option>
            <option value="paid">paid</option>
            <option value="pending">pending</option>
            <option value="refunded">refunded</option>
            <option value="shipped">shipped</option>
          </select>
        </div>
        <button onClick={load} className="px-3 py-2 rounded bg-slate-900 text-white">Refresh</button>
        <button onClick={openCreate} className="px-3 py-2 rounded bg-blue-600 text-white flex items-center gap-1"><Plus size={14}/>New</button>
      </div>
      <Toast message={toast.message} type={toast.type} onClose={()=>setToast({ message:'', type:'success' })} />
      <DataTable columns={[{key:'customer_name',label:'Customer'},{key:'status',label:'Status'},{key:'order_date',label:'Date'}]} rows={rows} onEdit={openEdit} onDelete={onDelete} />

      <Modal open={open} title={editing? 'Edit Order' : 'New Order'} onClose={()=>setOpen(false)}>
        <OrderForm initial={editing} onSubmit={onSubmit} submitting={submitting} />
      </Modal>
    </div>
  )
}

function Protected({ children }){
  const { token } = useAuth()
  if(!token) return <Navigate to="/login" replace />
  return children
}

export default function App(){
  const auth = useAuth()
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage onAuth={auth.login} />} />
        <Route path="/signup" element={<SignupPage onAuth={auth.login} />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Protected><Layout onLogout={auth.logout}><Dashboard/></Layout></Protected>} />
        <Route path="/customers" element={<Protected><Layout onLogout={auth.logout}><CustomersPage/></Layout></Protected>} />
        <Route path="/orders" element={<Protected><Layout onLogout={auth.logout}><OrdersPage/></Layout></Protected>} />
        <Route path="/products" element={<Protected><Layout onLogout={auth.logout}><ProductsPage/></Layout></Protected>} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}
