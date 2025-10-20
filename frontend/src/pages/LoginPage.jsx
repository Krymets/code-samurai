import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function LoginPage({ setUser }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await authAPI.login({ username, password })
      localStorage.setItem('token', response.data.token)
      
      const userResponse = await authAPI.getMe()
      setUser(userResponse.data)
      navigate('/samurais')
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || 'Login failed')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h1 className="page-title">Login</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }}>
          Login
        </button>
      </form>
    </div>
  )
}
