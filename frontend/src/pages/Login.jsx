import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthLayout, Input, Btn, Alert, C } from '../components/UI'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email:'', password:'' })
  const [error, setError] = useState('')
  const [unverified, setUnverified] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError(''); setUnverified(false); setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(user.is_staff ? '/admin' : '/')
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed.'
      setError(msg)
      if (err.response?.data?.unverified) setUnverified(true)
    } finally { setLoading(false) }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue your CELPIP journey">
      {error && <Alert type="error">{error}{unverified && <> — <Link to="/resend-verification" style={{ color:C.accent }}>Resend verification email</Link></>}</Alert>}
      <form onSubmit={submit}>
        <Input label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="Your password" required />
        <div style={{ textAlign:'right', marginBottom:20, marginTop:-8 }}>
          <Link to="/forgot-password" style={{ color:C.accent, fontSize:13, textDecoration:'none' }}>Forgot password?</Link>
        </div>
        <Btn type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</Btn>
      </form>
      <p style={{ textAlign:'center', marginTop:20, color:C.muted, fontSize:14 }}>
        Don't have an account?{' '}
        <Link to="/register" style={{ color:C.accent, textDecoration:'none', fontWeight:700 }}>Sign up</Link>
      </p>
    </AuthLayout>
  )
}
