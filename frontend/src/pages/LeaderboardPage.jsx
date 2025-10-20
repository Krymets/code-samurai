import { useState, useEffect } from 'react'
import { leaderboardAPI } from '../services/api'

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const response = await leaderboardAPI.get({ limit: 50 })
      setPlayers(response.data.results)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="page-title">Leaderboard</h1>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #0f3460', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Rank</th>
              <th>Player</th>
              <th>Rating</th>
              <th>Battles</th>
              <th>Wins</th>
              <th>Win Rate</th>
              <th>Win Streak</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={player.id} style={{ borderBottom: '1px solid #16213e' }}>
                <td style={{ padding: '10px', fontWeight: 'bold', color: getRankColor(index) }}>
                  #{index + 1}
                </td>
                <td>{player.username}</td>
                <td style={{ fontWeight: 'bold' }}>{player.rating}</td>
                <td>{player.total_battles}</td>
                <td>{player.total_wins}</td>
                <td>{player.win_rate?.toFixed(1)}%</td>
                <td>{player.current_win_streak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {players.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p>No players yet.</p>
        </div>
      )}
    </div>
  )
}

function getRankColor(rank) {
  if (rank === 0) return '#FFD700' // Gold
  if (rank === 1) return '#C0C0C0' // Silver
  if (rank === 2) return '#CD7F32' // Bronze
  return '#eee'
}
