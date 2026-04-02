import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import API from '../api'
import { AuthLayout, Input, Btn, Alert } from '../components/UI'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [form, setForm] = useState({ password:'', password2:'' })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    if (form.password !== form.password2) { setError('Passwords do not match.'); return }
    setError(''); setLoading(true)
    try {
      await API.post('/auth/reset-password/', { token, password: form.password })
      setStatus('success')
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. The link may have expired.')
    } finally { setLoading(false) }
  }

  if (!token) return (
    <AuthLayout title="Invalid Link">
      <Alert type="error">This reset link is invalid.</Alert>
      <Link to="/forgot-password"><Btn>Request New Link</Btn></Link>
    </AuthLayout>
  )

  if (status === 'success') return (
    <AuthLayout title="Password Reset!" subtitle="Your password has been updated">
      <Alert type="success">Password reset successfully. You can now log in with your new password.</Alert>
      <Link to="/login"><Btn>Go to Login</Btn></Link>
    </AuthLayout>
  )

  return (
    <AuthLayout title="Reset Password" subtitle="Enter your new password">
      {error && <Alert type="error">{error}</Alert>}
      <form onSubmit={submit}>
        <Input label="New password" type="password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" required />
        <Input label="Confirm new password" type="password" value={form.password2} onChange={set('password2')} placeholder="Repeat new password" required />
        <Btn type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</Btn>
      </form>
    </AuthLayout>
  )
}
