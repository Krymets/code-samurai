import { useState, useEffect } from 'react'
import { battlesAPI, samuraisAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function BattlesPage({ user }) {
  const [battles, setBattles] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadBattles()
  }, [user])

  const loadBattles = async () => {
    try {
      const response = await battlesAPI.getMy()
      setBattles(response.data.results)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const runBattle = async (battleId) => {
    try {
      await battlesAPI.run(battleId)
      // Navigate to battle detail page to show replay
      navigate(`/battles/${battleId}?autoplay=true`)
    } catch (error) {
      alert('Battle failed: ' + error.response?.data?.detail)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="page-title">My Battles</h1>
        <button className="primary" onClick={() => navigate('/create-battle')}>
          + Create Battle
        </button>
      </div>

      <div className="grid">
        {battles.map(battle => (
          <div key={battle.id} className="card">
            <h3>Battle #{battle.id}</h3>
            <p>{battle.player1_username} vs {battle.player2_username}</p>
            <p>Status: <span style={{ color: getStatusColor(battle.status) }}>{battle.status}</span></p>
            {battle.winner_username && <p>Winner: {battle.winner_username}</p>}
            {battle.duration && <p>Duration: {battle.duration?.toFixed(1)}s</p>}

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              {battle.status === 'PENDING' && (
                <button
                  className="primary"
                  onClick={() => runBattle(battle.id)}
                >
                  Run Battle
                </button>
              )}
              {battle.status === 'COMPLETED' && (
                <button
                  onClick={() => navigate(`/battles/${battle.id}`)}
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {battles.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No battles yet.</p>
        </div>
      )}
    </div>
  )
}

function getStatusColor(status) {
  switch (status) {
    case 'PENDING': return '#ffa500'
    case 'IN_PROGRESS': return '#00bfff'
    case 'COMPLETED': return '#2ecc71'
    default: return '#aaa'
  }
}
