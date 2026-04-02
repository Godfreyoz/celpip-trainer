import { useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { AuthLayout, Input, Btn, Alert } from '../components/UI'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try { await API.post('/auth/forgot-password/', { email }) } catch {}
    setSent(true)
    setLoading(false)
  }

  if (sent) return (
    <AuthLayout title="Check your inbox" subtitle="Password reset link sent">
      <Alert type="success">
        If <strong>{email}</strong> is registered, you'll receive a password reset link shortly. Check your spam folder too.
      </Alert>
      <Link to="/login"><Btn variant="outline">Back to Login</Btn></Link>
    </AuthLayout>
  )

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email and we'll send a reset link">
      <form onSubmit={submit}>
        <Input label="Email address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
        <Btn type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</Btn>
      </form>
      <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'#94a3b8' }}>
        <Link to="/login" style={{ color:'#f59e0b', textDecoration:'none' }}>← Back to login</Link>
      </p>
    </AuthLayout>
  )
}
