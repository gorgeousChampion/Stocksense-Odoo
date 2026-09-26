import { useNavigate } from 'react-router-dom'
import { User, Mail, LogOut } from 'lucide-react'

export default function Profile() {
  const navigate = useNavigate()

  const storedUser = localStorage.getItem('auth_user')

  const user = storedUser
    ? JSON.parse(storedUser)
    : null

  async function handleLogout() {
    const token = localStorage.getItem('auth_token')

    try {
      if (token) {
        await fetch(
          `http://localhost:8000/api/auth/logout?token=${encodeURIComponent(token)}`,
          {
            method: 'POST'
          }
        )
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }

    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')

    navigate('/')
  }

  if (!user) {
    return (
      <div>
        <h2>Profile</h2>
        <p>No user information found.</p>
      </div>
    )
  }

  const fullName =
    `${user.first_name || ''} ${user.last_name || ''}`.trim()

  const initials =
    `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 26,
            color: '#0f172a'
          }}
        >
          My Profile
        </h1>

        <p
          style={{
            marginTop: 6,
            color: '#64748b',
            fontSize: 14
          }}
        >
          Manage your StockSense account information.
        </p>
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            background: '#f8fafc',
            padding: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: '#047857',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 700
            }}
          >
            {initials}
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                color: '#0f172a'
              }}
            >
              {fullName}
            </h2>

            <p
              style={{
                margin: '5px 0 0',
                color: '#64748b',
                fontSize: 14
              }}
            >
              StockSense User
            </p>
          </div>
        </div>

        <div style={{ padding: 28 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 0',
              borderBottom: '1px solid #f1f5f9'
            }}
          >
            <User size={20} color="#64748b" />

            <div>
              <div
                style={{
                  fontSize: 12,
                  color: '#94a3b8',
                  marginBottom: 3
                }}
              >
                Full Name
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#0f172a'
                }}
              >
                {fullName}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: '16px 0'
            }}
          >
            <Mail size={20} color="#64748b" />

            <div>
              <div
                style={{
                  fontSize: 12,
                  color: '#94a3b8',
                  marginBottom: 3
                }}
              >
                Email Address
              </div>

              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#0f172a'
                }}
              >
                {user.email}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '9px 14px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}