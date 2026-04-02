import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { C, ScoreRing, Spinner } from '../components/UI'
import API from '../api'
import ReadingTab from '../components/ReadingTab'
import WritingTab from '../components/WritingTab'
import TipsTab from '../components/TipsTab'

const TABS = ['Reading', 'Writing', 'Listening', 'Speaking']

function MiniChart({ sessions }) {
  if (!sessions?.length) return <div style={{ color:C.muted, fontSize:13, textAlign:'center', padding:'14px 0' }}>Complete tasks to see your progress!</div>
  const last = sessions.slice(0, 10).reverse()
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:60, marginBottom:6 }}>
        {last.map((s, i) => {
          const col = s.score >= 9 ? C.green : s.score >= 7 ? C.accent : C.red
          return (
            <div key={i} title={`${s.section}: ${s.score}`} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              <div style={{ fontSize:9, color:col, fontWeight:700 }}>{s.score}</div>
              <div style={{ width:'100%', height:`${Math.max(s.score/10*48,4)}px`, background:col, borderRadius:'3px 3px 0 0', opacity:0.85 }}/>
            </div>
          )
        })}
      </div>
      <div style={{ display:'flex', gap:6 }}>
        {last.map((s, i) => <div key={i} style={{ flex:1, textAlign:'center', fontSize:8, color:C.muted }}>{s.created_at?.slice(5,10)}</div>)}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Reading')
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(true)

  useEffect(() => {
    API.get('/trainer/sessions/')
      .then(r => setSessions(r.data))
      .catch(() => {})
      .finally(() => setLoadingSessions(false))
  }, [])

  const handleScore = async (score, section, extra = {}) => {
    try {
      const { data } = await API.post('/trainer/sessions/save/', {
        section, score, ...extra,
      })
      setSessions(prev => [data, ...prev])
    } catch {}
  }

  const handleLogout = async () => { await logout(); navigate('/login') }

  const rSessions = sessions.filter(s => s.section === 'Reading')
  const wSessions = sessions.filter(s => s.section === 'Writing')
  const avgR = rSessions.length ? Math.round(rSessions.reduce((a,b) => a+b.score, 0) / rSessions.length) : null
  const avgW = wSessions.length ? Math.round(wSessions.reduce((a,b) => a+b.score, 0) / wSessions.length) : null

  const todaySessions = sessions.filter(s => s.created_at?.slice(0,10) === new Date().toISOString().slice(0,10))
  const streak = (() => {
    if (!sessions.length) return 0
    const dates = [...new Set(sessions.map(s => s.created_at?.slice(0,10)))].sort().reverse()
    let count = 0
    let current = new Date()
    for (const d of dates) {
      const diff = Math.floor((current - new Date(d)) / 86400000)
      if (diff <= 1) { count++; current = new Date(d) }
      else break
    }
    return count
  })()

  return (
    <div style={{ background:C.bg, minHeight:'100vh', fontFamily:'Georgia, serif', color:C.text, paddingBottom:60 }}>
      {/* Header */}
      <div style={{ background:'#1a1d27', borderBottom:`1px solid ${C.border}`, padding:'18px 20px' }}>
        <div style={{ maxWidth:760, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ color:C.accent, fontSize:10, fontWeight:700, letterSpacing:3, marginBottom:3 }}>CELPIP DAILY TRAINER</div>
            <div style={{ fontSize:20, fontWeight:800 }}>Hello, {user?.full_name?.split(' ')[0]} 👋</div>
            <div style={{ color:C.muted, fontSize:12, marginTop:2 }}>Goal: CLB {user?.target_clb || 9}+ across all skills</div>
          </div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            {user?.is_staff && (
              <button onClick={() => navigate('/admin')} style={{ padding:'8px 16px', background:C.purple+'22', border:`1px solid ${C.purple}44`, color:C.purple, borderRadius:8, fontWeight:700, cursor:'pointer', fontSize:13 }}>
                Admin
              </button>
            )}
            <div style={{ textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, color:C.accent }}>🔥 {streak}</div>
              <div style={{ color:C.muted, fontSize:10 }}>streak</div>
            </div>
            <button onClick={handleLogout} style={{ padding:'8px 14px', background:'transparent', border:`1px solid ${C.border}`, color:C.muted, borderRadius:8, cursor:'pointer', fontSize:13 }}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:760, margin:'0 auto', padding:'0 16px' }}>
        {/* Stats */}
        <div style={{ display:'flex', gap:8, marginTop:16 }}>
          {[
            { label:'Avg Reading', val:avgR ? `~${avgR}` : '—', col:avgR >= 7 ? C.green : avgR ? C.red : C.muted },
            { label:'Avg Writing', val:avgW ? `~${avgW}` : '—', col:avgW >= 7 ? C.green : avgW ? C.red : C.muted },
            { label:'Sessions', val:sessions.length, col:C.blue },
            { label:'Today', val:`${todaySessions.length} done`, col:C.accent },
          ].map(({ label, val, col }) => (
            <div key={label} style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:'9px 6px', textAlign:'center' }}>
              <div style={{ color:col, fontWeight:800, fontSize:15 }}>{val}</div>
              <div style={{ color:C.muted, fontSize:9, marginTop:2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Progress chart */}
        {sessions.length > 0 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:14, marginTop:14 }}>
            <div style={{ color:C.muted, fontSize:10, fontWeight:700, letterSpacing:1, marginBottom:10 }}>YOUR PROGRESS (last 10 sessions)</div>
            {loadingSessions ? <Spinner size={24} label="" /> : <MiniChart sessions={sessions} />}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', gap:5, background:C.card, borderRadius:12, padding:5, border:`1px solid ${C.border}`, margin:'14px 0' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex:1, padding:'11px 4px', borderRadius:8, border:'none',
              background: tab === t ? C.accent : 'transparent',
              color: tab === t ? '#000' : C.muted,
              fontWeight:700, cursor:'pointer', fontSize:13, transition:'all 0.2s',
            }}>{t}</button>
          ))}
        </div>

        {tab === 'Reading' && <ReadingTab onScore={handleScore} />}
        {tab === 'Writing' && <WritingTab onScore={handleScore} />}
        {tab === 'Listening' && <TipsTab section="Listening" />}
        {tab === 'Speaking' && <TipsTab section="Speaking" />}
      </div>
    </div>
  )
}
