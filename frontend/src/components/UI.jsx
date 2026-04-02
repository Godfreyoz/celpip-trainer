// ── Design tokens ─────────────────────────────────────────────────────────────
export const C = {
  bg:'#0f1117', card:'#1a1d27', border:'#2a2d3a',
  accent:'#f59e0b', green:'#10b981', red:'#ef4444',
  blue:'#3b82f6', purple:'#8b5cf6', text:'#e2e8f0', muted:'#94a3b8',
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, disabled, variant='primary', style={}, type='button' }) {
  const base = {
    padding:'12px 24px', borderRadius:10, fontWeight:700, fontSize:15,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border:'none', transition:'opacity 0.15s', width:'100%',
    opacity: disabled ? 0.5 : 1,
    fontFamily:'Georgia, serif',
    ...style,
  }
  const variants = {
    primary: { background: C.accent, color:'#000' },
    outline: { background:'transparent', border:`1px solid ${C.accent}`, color: C.accent },
    ghost: { background:'transparent', border:`1px solid ${C.border}`, color: C.muted },
    danger: { background: C.red, color:'#fff' },
  }
  return <button type={type} onClick={onClick} disabled={disabled} style={{...base,...variants[variant]}}>{children}</button>
}

// ── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, error, ...props }) {
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', color:C.muted, fontSize:13, marginBottom:6, fontWeight:600 }}>{label}</label>}
      <input {...props} style={{
        width:'100%', padding:'12px 14px', background:C.card,
        border:`1px solid ${error ? C.red : C.border}`, borderRadius:10,
        color:C.text, fontSize:15, fontFamily:'Georgia, serif', outline:'none',
        boxSizing:'border-box',
      }}/>
      {error && <div style={{ color:C.red, fontSize:12, marginTop:4 }}>{error}</div>}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style={} }) {
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:14, padding:24, ...style }}>
      {children}
    </div>
  )
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type='error', children }) {
  const colors = { error:[C.red,'#ef444418'], success:[C.green,'#10b98118'], info:[C.blue,'#3b82f618'] }
  const [col, bg] = colors[type] || colors.error
  return (
    <div style={{ background:bg, border:`1px solid ${col}33`, borderRadius:10, padding:'12px 16px', color:col, fontSize:14, lineHeight:1.6, marginBottom:16 }}>
      {children}
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ label='Loading...', size=36 }) {
  return (
    <div style={{ textAlign:'center', padding:40, color:C.muted }}>
      <div style={{ width:size, height:size, borderRadius:'50%', margin:'0 auto 12px', border:`3px solid ${C.border}`, borderTop:`3px solid ${C.accent}`, animation:'spin 0.8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ fontSize:14 }}>{label}</div>
    </div>
  )
}

// ── ScoreRing ─────────────────────────────────────────────────────────────────
export function ScoreRing({ score, max=10, size=70 }) {
  const r=size*0.38, circ=2*Math.PI*r, pct=Math.min(score/max,1)
  const col=score>=9?C.green:score>=7?C.accent:score>=5?C.blue:C.red
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={6}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
        strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{transition:'stroke-dashoffset 0.8s ease'}}/>
      <text x={size/2} y={size/2+6} textAnchor="middle" fill={col} fontSize={size*0.24} fontWeight={800}>{score}</text>
    </svg>
  )
}

// ── Auth layout ───────────────────────────────────────────────────────────────
export function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{ minHeight:'100vh', background:C.bg, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🍁</div>
          <div style={{ color:C.accent, fontSize:11, fontWeight:700, letterSpacing:3, marginBottom:6 }}>CELPIP DAILY TRAINER</div>
          <h1 style={{ fontSize:24, fontWeight:800, marginBottom:8 }}>{title}</h1>
          {subtitle && <p style={{ color:C.muted, fontSize:14 }}>{subtitle}</p>}
        </div>
        <Card>{children}</Card>
      </div>
    </div>
  )
}
