import { useState, useEffect } from 'react'
import { battlesAPI, usersAPI, samuraisAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function CreateBattlePage({ user }) {
  const [users, setUsers] = useState([])
  const [mySamurais, setMySamurais] = useState([])
  const [opponentSamurais, setOpponentSamurais] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    opponent_id: '',
    my_samurai_ids: [],
    opponent_samurai_ids: []
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      // Load users
      const usersRes = await usersAPI.getAll()
      const allUsers = usersRes.data.results || usersRes.data
      // Filter out current user
      setUsers(allUsers.filter(u => u.id !== user.id))

      // Load my samurais
      const samuraisRes = await samuraisAPI.getMy()
      setMySamurais(samuraisRes.data.results || [])
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOpponentSamurais = async (opponentId) => {
    try {
      const response = await samuraisAPI.getAll({ user: opponentId })
      setOpponentSamurais(response.data.results || [])
    } catch (error) {
      console.error('Failed to load opponent samurais:', error)
      setOpponentSamurais([])
    }
  }

  const handleOpponentChange = (e) => {
    const opponentId = e.target.value
    setFormData({ ...formData, opponent_id: opponentId, opponent_samurai_ids: [] })
    if (opponentId) {
      loadOpponentSamurais(opponentId)
    } else {
      setOpponentSamurais([])
    }
  }

  const toggleMySamurai = (samuraiId) => {
    const current = formData.my_samurai_ids
    if (current.includes(samuraiId)) {
      setFormData({ ...formData, my_samurai_ids: current.filter(id => id !== samuraiId) })
    } else if (current.length < 3) {
      setFormData({ ...formData, my_samurai_ids: [...current, samuraiId] })
    }
  }

  const toggleOpponentSamurai = (samuraiId) => {
    const current = formData.opponent_samurai_ids
    if (current.includes(samuraiId)) {
      setFormData({ ...formData, opponent_samurai_ids: current.filter(id => id !== samuraiId) })
    } else if (current.length < 3) {
      setFormData({ ...formData, opponent_samurai_ids: [...current, samuraiId] })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.my_samurai_ids.length === 0) {
      alert('Select at least 1 of your samurais!')
      return
    }

    if (formData.opponent_samurai_ids.length === 0) {
      alert('Select at least 1 opponent samurai!')
      return
    }

    try {
      setCreating(true)
      const battleData = {
        player1: user.id,
        player2: parseInt(formData.opponent_id),
        team1_samurai_ids: formData.my_samurai_ids,
        team2_samurai_ids: formData.opponent_samurai_ids
      }

      const response = await battlesAPI.create(battleData)
      alert(`Battle #${response.data.id} created successfully!`)
      navigate('/battles')
    } catch (error) {
      console.error('Failed to create battle:', error)
      alert('Failed to create battle: ' + (error.response?.data?.detail || error.message))
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div>Loading...</div>

  if (mySamurais.length === 0) {
    return (
      <div>
        <h1 className="page-title">Create Battle</h1>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>You need to create at least 1 samurai first!</p>
          <button className="primary" onClick={() => navigate('/samurais')} style={{ marginTop: '20px' }}>
            Go to My Samurais
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="page-title">Create Battle</h1>

      <form onSubmit={handleSubmit}>
        {/* Opponent Selection */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>1. Choose Opponent</h3>
          <div className="form-group">
            <select
              value={formData.opponent_id}
              onChange={handleOpponentChange}
              required
            >
              <option value="">-- Select opponent --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>
        </div>

        {/* My Team Selection */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>2. Select Your Team (1-3 samurais)</h3>
          <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '15px' }}>
            Selected: {formData.my_samurai_ids.length} / 3
          </p>
          <div className="grid">
            {mySamurais.map(samurai => (
              <div
                key={samurai.id}
                className="card"
                style={{
                  cursor: 'pointer',
                  border: formData.my_samurai_ids.includes(samurai.id)
                    ? '2px solid #2ecc71'
                    : '2px solid transparent',
                  opacity: formData.my_samurai_ids.includes(samurai.id) ? 1 : 0.7
                }}
                onClick={() => toggleMySamurai(samurai.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', background: samurai.color, borderRadius: '50%' }} />
                  <div>
                    <h4 style={{ margin: 0 }}>{samurai.name}</h4>
                    <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
                      {samurai.weapon_type} / {samurai.armor_type}
                    </p>
                  </div>
                </div>
                {formData.my_samurai_ids.includes(samurai.id) && (
                  <div style={{ marginTop: '10px', color: '#2ecc71', fontWeight: 'bold' }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Opponent Team Selection */}
        {formData.opponent_id && (
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3>3. Select Opponent Team (1-3 samurais)</h3>
            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '15px' }}>
              Selected: {formData.opponent_samurai_ids.length} / 3
            </p>

            {opponentSamurais.length === 0 ? (
              <p style={{ color: '#aaa', textAlign: 'center', padding: '20px' }}>
                This opponent has no samurais yet.
              </p>
            ) : (
              <div className="grid">
                {opponentSamurais.map(samurai => (
                  <div
                    key={samurai.id}
                    className="card"
                    style={{
                      cursor: 'pointer',
                      border: formData.opponent_samurai_ids.includes(samurai.id)
                        ? '2px solid #e74c3c'
                        : '2px solid transparent',
                      opacity: formData.opponent_samurai_ids.includes(samurai.id) ? 1 : 0.7
                    }}
                    onClick={() => toggleOpponentSamurai(samurai.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', background: samurai.color, borderRadius: '50%' }} />
                      <div>
                        <h4 style={{ margin: 0 }}>{samurai.name}</h4>
                        <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
                          {samurai.weapon_type} / {samurai.armor_type}
                        </p>
                      </div>
                    </div>
                    {formData.opponent_samurai_ids.includes(samurai.id) && (
                      <div style={{ marginTop: '10px', color: '#e74c3c', fontWeight: 'bold' }}>
                        ✓ Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            type="submit"
            className="primary"
            disabled={creating || !formData.opponent_id || formData.my_samurai_ids.length === 0 || formData.opponent_samurai_ids.length === 0}
            style={{ fontSize: '18px', padding: '15px 40px' }}
          >
            {creating ? 'Creating...' : 'Create Battle'}
          </button>
        </div>
      </form>
    </div>
  )
}