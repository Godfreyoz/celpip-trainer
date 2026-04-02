import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { C, Spinner, Alert } from '../components/UI'
import API from '../api'

function StatCard({ label, value, col }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20, textAlign:'center' }}>
      <div style={{ color: col || C.accent, fontWeight:800, fontSize:28 }}>{value}</div>
      <div style={{ color:C.muted, fontSize:13, marginTop:4 }}>{label}</div>
    </div>
  )
}

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [msg, setMsg] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    Promise.all([
      API.get('/auth/admin/stats/'),
      API.get('/auth/admin/users/'),
    ]).then(([s, u]) => {
      setStats(s.data)
      setUsers(u.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggleUser = async (u) => {
    try {
      const { data } = await API.patch(`/auth/admin/users/${u.id}/`, { is_active: !u.is_active })
      setUsers(prev => prev.map(x => x.id === u.id ? data : x))
      setMsg(`${data.full_name} has been ${data.is_active ? 'activated' : 'deactivated'}.`)
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('Failed to update user.') }
  }

  const toggleAdmin = async (u) => {
    if (u.id === user.id) return
    try {
      const { data } = await API.patch(`/auth/admin/users/${u.id}/`, { is_staff: !u.is_staff })
      setUsers(prev => prev.map(x => x.id === u.id ? data : x))
      setMsg(`${data.full_name} is ${data.is_staff ? 'now an admin' : 'no longer an admin'}.`)
      setTimeout(() => setMsg(''), 3000)
    } catch {}
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div style={{ background:C.bg, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner label="Loading admin dashboard..." />
    </div>
  )

  return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:'Georgia, serif', color:C.text, paddingBottom:60 }}>
      {/* Header */}
      <div style={{ background:'#1a1d27', borderBottom:`1px solid ${C.border}`, padding:'18px 24px' }}>
        <div style={{ maxWidth:1000, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ color:C.accent, fontSize:10, fontWeight:700, letterSpacing:3, marginBottom:3 }}>ADMIN DASHBOARD</div>
            <div style={{ fontSize:20, fontWeight:800 }}>CELPIP Trainer</div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => navigate('/')} style={{ padding:'8px 16px', background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, cursor:'pointer', fontSize:13 }}>
              ← Dashboard
            </button>
            <button onClick={async () => { await logout(); navigate('/login') }} style={{ padding:'8px 16px', background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, cursor:'pointer', fontSize:13 }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'20px 16px' }}>
        {msg && <Alert type="success" style={{ marginBottom:16 }}>{msg}</Alert>}

        {/* Sub-tabs */}
        <div style={{ display:'flex', gap:5, background:C.card, borderRadius:12, padding:5, border:`1px solid ${C.border}`, marginBottom:20 }}>
          {['overview', 'users'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              flex:1, padding:'10px', borderRadius:8, border:'none', textTransform:'capitalize',
              background: activeTab === t ? C.accent : 'transparent',
              color: activeTab === t ? '#000' : C.muted,
              fontWeight:700, cursor:'pointer', fontSize:14,
            }}>{t === 'overview' ? '📊 Overview' : '👥 Users'}</button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && stats && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:12, marginBottom:24 }}>
              <StatCard label="Total Users" value={stats.total_users} col={C.blue} />
              <StatCard label="Verified" value={stats.verified_users} col={C.green} />
              <StatCard label="Active" value={stats.active_users} col={C.accent} />
              <StatCard label="Total Sessions" value={stats.total_sessions} col={C.purple} />
              <StatCard label="Reading Sessions" value={stats.reading_sessions} col={C.accent} />
              <StatCard label="Writing Sessions" value={stats.writing_sessions} col={C.green} />
            </div>
          </div>
        )}

        {/* Users table */}
        {activeTab === 'users' && (
          <div>
            <div style={{ marginBottom:16 }}>
              <input
                placeholder="Search by name or email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width:'100%', padding:'12px 16px', background:C.card,
                  border:`1px solid ${C.border}`, borderRadius:10,
                  color:C.text, fontSize:14, outline:'none', boxSizing:'border-box',
                  fontFamily:'Georgia, serif',
                }}
              />
            </div>
            <div style={{ color:C.muted, fontSize:12, marginBottom:12 }}>{filtered.length} users</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {filtered.map(u => (
                <div key={u.id} style={{
                  background:C.card, border:`1px solid ${u.is_active ? C.border : C.red+'44'}`,
                  borderRadius:12, padding:'16px 20px',
                  opacity: u.is_active ? 1 : 0.7,
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:10 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <span style={{ fontWeight:700, fontSize:15, color:C.text }}>{u.full_name}</span>
                        {u.is_staff && <span style={{ background:C.purple+'22', color:C.purple, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4 }}>ADMIN</span>}
                        {!u.is_verified && <span style={{ background:C.accent+'22', color:C.accent, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4 }}>UNVERIFIED</span>}
                        {!u.is_active && <span style={{ background:C.red+'22', color:C.red, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:4 }}>DEACTIVATED</span>}
                      </div>
                      <div style={{ color:C.muted, fontSize:13 }}>{u.email}</div>
                      <div style={{ color:C.muted, fontSize:12, marginTop:4 }}>
                        Joined: {u.date_joined?.slice(0,10)} &nbsp;|&nbsp;
                        Sessions: {u.session_count} &nbsp;|&nbsp;
                        R:{u.current_reading || '—'} W:{u.current_writing || '—'} L:{u.current_listening || '—'} S:{u.current_speaking || '—'}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                      <button onClick={() => toggleAdmin(u)} disabled={u.id === user?.id} style={{
                        padding:'6px 14px', borderRadius:7, fontSize:12, fontWeight:700, cursor:u.id===user?.id?'not-allowed':'pointer',
                        background:u.is_staff ? C.purple+'22' : 'transparent',
                        border:`1px solid ${C.purple}44`, color:C.purple, opacity:u.id===user?.id?0.4:1,
                      }}>{u.is_staff ? 'Remove Admin' : 'Make Admin'}</button>
                      <button onClick={() => toggleUser(u)} style={{
                        padding:'6px 14px', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer',
                        background: u.is_active ? C.red+'22' : C.green+'22',
                        border:`1px solid ${u.is_active ? C.red : C.green}44`,
                        color: u.is_active ? C.red : C.green,
                      }}>{u.is_active ? 'Deactivate' : 'Activate'}</button>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div style={{ color:C.muted, textAlign:'center', padding:40 }}>No users found.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
