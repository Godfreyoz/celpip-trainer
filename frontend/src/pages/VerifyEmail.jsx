// VerifyEmail.jsx
import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import API from '../api'
import { AuthLayout, Alert, Btn, C } from '../components/UI'

export function VerifyEmail() {
  const [params] = useSearchParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStatus('error'); setMessage('No token provided.'); return }
    API.post('/auth/verify-email/', { token })
      .then(r => { setStatus('success'); setMessage(r.data.message) })
      .catch(e => { setStatus('error'); setMessage(e.response?.data?.error || 'Verification failed.') })
  }, [])

  return (
    <AuthLayout title="Email Verification" subtitle="Verifying your account...">
      {status === 'loading' && <p style={{ color:C.muted, textAlign:'center' }}>Verifying...</p>}
      {status === 'success' && (
        <>
          <Alert type="success">{message}</Alert>
          <Link to="/login"><Btn>Go to Login</Btn></Link>
        </>
      )}
      {status === 'error' && (
        <>
          <Alert type="error">{message}</Alert>
          <Link to="/register"><Btn variant="outline">Register Again</Btn></Link>
        </>
      )}
    </AuthLayout>
  )
}

export default VerifyEmail
