import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Boxes } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Enter both email and password')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        'http://localhost:8000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.detail || 'Invalid email or password')
        return
      }

      localStorage.setItem('auth_token', data.token)

      localStorage.setItem(
        'auth_user',
        JSON.stringify({
          id: data.user_id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email
        })
      )

      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      setError('Could not connect to the server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f8fa'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 12,
          padding: 32,
          width: 340,
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8
          }}
        >
          <Boxes size={22} color="#047857" />

          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#0f172a'
            }}
          >
            StockSense
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#334155'
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@company.com"
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 14
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#334155'
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 8,
              padding: '8px 10px',
              fontSize: 14
            }}
          />
        </div>

        {error && (
          <div
            style={{
              fontSize: 13,
              color: '#dc2626',
              background: '#fef2f2',
              padding: '8px 12px',
              borderRadius: 8
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#047857',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '9px 14px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <div
          style={{
            fontSize: 13,
            color: '#64748b',
            textAlign: 'center'
          }}
        >
          Forgot password? OTP reset coming soon.
        </div>

        <div
          style={{
            fontSize: 13,
            color: '#64748b',
            textAlign: 'center'
          }}
        >
          New here?{' '}
          <Link
            to="/register"
            style={{
              color: '#047857',
              fontWeight: 600
            }}
          >
            Create an account
          </Link>
        </div>
      </form>
    </div>
  )
}