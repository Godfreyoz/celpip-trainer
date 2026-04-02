import { useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../api'
import { AuthLayout, Input, Btn, Alert, C } from '../components/UI'

export default function Register() {
  const [form, setForm] = useState({ email:'', full_name:'', password:'', password2:'' })
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setErrors({}); setSuccess(''); setLoading(true)
    try {
      const { data } = await API.post('/auth/register/', form)
      setSuccess(data.message)
    } catch (err) {
      setErrors(err.response?.data || { general: 'Registration failed.' })
    } finally { setLoading(false) }
  }

  if (success) return (
    <AuthLayout title="Check your email" subtitle="One more step before you start!">
      <Alert type="success">{success}</Alert>
      <p style={{ color:C.muted, fontSize:14, textAlign:'center', lineHeight:1.7 }}>
        We sent a verification link to <strong style={{ color:C.text }}>{form.email}</strong>.<br/>
        Click the link in the email to activate your account.
      </p>
      <p style={{ textAlign:'center', marginTop:20, color:C.muted, fontSize:13 }}>
        <Link to="/login" style={{ color:C.accent, textDecoration:'none' }}>← Back to login</Link>
      </p>
    </AuthLayout>
  )

  return (
    <AuthLayout title="Create your account" subtitle="Start your journey to Canadian PR">
      {errors.general && <Alert type="error">{errors.general}</Alert>}
      <form onSubmit={submit}>
        <Input label="Full name" value={form.full_name} onChange={set('full_name')} placeholder="Godfrey Ajeyemi" required error={errors.full_name?.[0]} />
        <Input label="Email address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required error={errors.email?.[0]} />
        <Input label="Password" type="password" value={form.password} onChange={set('password')} placeholder="At least 8 characters" required error={errors.password?.[0]} />
        <Input label="Confirm password" type="password" value={form.password2} onChange={set('password2')} placeholder="Repeat password" required error={errors.password2?.[0]} />
        <Btn type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Btn>
      </form>
      <p style={{ textAlign:'center', marginTop:20, color:C.muted, fontSize:14 }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color:C.accent, textDecoration:'none', fontWeight:700 }}>Log in</Link>
      </p>
    </AuthLayout>
  )
}
