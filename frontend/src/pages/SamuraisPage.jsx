import { useState, useEffect } from 'react'
import { samuraisAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function SamuraisPage({ user }) {
  const [samurais, setSamurais] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    color: '#FF0000',
    weapon_type: 'katana',
    armor_type: 'light'
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadSamurais()
  }, [user])

  const loadSamurais = async () => {
    try {
      const response = await samuraisAPI.getMy()
      setSamurais(response.data.results)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await samuraisAPI.create(formData)
      setShowForm(false)
      setFormData({ name: '', color: '#FF0000', weapon_type: 'katana', armor_type: 'light' })
      loadSamurais()
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">My Samurais</h1>
        <button className="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Samurai'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3>Create New Samurai</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name:</label>
              <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Color:</label>
              <input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Weapon:</label>
              <select value={formData.weapon_type} onChange={(e) => setFormData({...formData, weapon_type: e.target.value})}>
                <option value="katana">Katana</option>
                <option value="nodachi">Nodachi</option>
                <option value="wakizashi">Wakizashi</option>
              </select>
            </div>
            <div className="form-group">
              <label>Armor:</label>
              <select value={formData.armor_type} onChange={(e) => setFormData({...formData, armor_type: e.target.value})}>
                <option value="none">No Armor</option>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
            <button type="submit" className="primary">Create</button>
          </form>
        </div>
      )}

      <div className="grid">
        {samurais.map(samurai => (
          <div key={samurai.id} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <div style={{ width: '40px', height: '40px', background: samurai.color, borderRadius: '50%' }} />
              <div>
                <h3>{samurai.name}</h3>
                <p style={{ fontSize: '14px', color: '#aaa' }}>Level {samurai.level}</p>
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#ccc' }}>
              <p>Weapon: {samurai.weapon_type}</p>
              <p>Armor: {samurai.armor_type}</p>
              <p>Wins: {samurai.wins} | Losses: {samurai.losses}</p>
              <p>Win Rate: {samurai.win_rate?.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>

      {samurais.length === 0 && !showForm && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No samurais yet. Create your first one!</p>
        </div>
      )}
    </div>
  )
}
