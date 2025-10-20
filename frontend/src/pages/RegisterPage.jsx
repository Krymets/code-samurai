import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function RegisterPage({ setUser }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await authAPI.register(formData)
      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      navigate('/samurais')
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || 'Registration failed')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h1 className="page-title">Register</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username:</label>
          <input name="username" value={formData.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Confirm Password:</label>
          <input name="password2" type="password" value={formData.password2} onChange={handleChange} required />
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="primary" style={{ width: '100%', marginTop: '10px' }}>
          Register
        </button>
      </form>
    </div>
  )
}
