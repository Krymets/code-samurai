import { useState, useEffect } from 'react'
import { battlesAPI } from '../services/api'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import BattleReplay from '../components/BattleReplay'

export default function BattleDetailPage({ user }) {
  const [battle, setBattle] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReplay, setShowReplay] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    loadBattle()
  }, [user, id])

  const loadBattle = async () => {
    try {
      const [battleRes, eventsRes] = await Promise.all([
        battlesAPI.getById(id),
        battlesAPI.getEvents(id)
      ])
      setBattle(battleRes.data)
      setEvents(eventsRes.data.results || eventsRes.data || [])

      // Auto-open replay if autoplay=true
      if (searchParams.get('autoplay') === 'true') {
        setShowReplay(true)
      }
    } catch (error) {
      console.error('Failed to load battle:', error)
      alert('Battle not found')
      navigate('/battles')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>

  if (!battle) return <div>Battle not found</div>

  const finalStats = battle.replay_data?.final_stats

  return (
    <div>
      <button onClick={() => navigate('/battles')} style={{ marginBottom: '20px' }}>
        ← Back to Battles
      </button>

      <h1 className="page-title">Battle #{battle.id}</h1>

      {/* Battle Summary */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h2>{battle.player1_username} vs {battle.player2_username}</h2>
        <div style={{ marginTop: '15px' }}>
          <p><strong>Status:</strong> <span style={{ color: getStatusColor(battle.status) }}>{battle.status}</span></p>
          {battle.winner_username && (
            <p><strong>Winner:</strong> <span style={{ color: '#2ecc71', fontSize: '18px' }}>🏆 {battle.winner_username}</span></p>
          )}
          {battle.duration && (
            <p><strong>Duration:</strong> {battle.duration.toFixed(2)}s</p>
          )}
          {events.length > 0 && (
            <p><strong>Events:</strong> {events.length}</p>
          )}
        </div>

        {battle.status === 'COMPLETED' && battle.replay_data && (
          <div style={{ marginTop: '20px' }}>
            <button
              className="primary"
              onClick={() => setShowReplay(!showReplay)}
              style={{ fontSize: '16px', padding: '12px 24px' }}
            >
              {showReplay ? '📊 Hide Replay' : '🎬 Watch Replay'}
            </button>
          </div>
        )}
      </div>

      {/* Battle Replay */}
      {showReplay && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Battle Replay</h3>
          <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {battle.replay_gif_url ? (
              <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <img
                  src={battle.replay_gif_url}
                  alt="Battle Replay"
                  style={{
                    width: '100%',
                    height: 'auto',
                    border: '3px solid #6A4C93',
                    borderRadius: '12px',
                    background: '#0F172A',
                    display: 'block',
                    boxShadow: '0 8px 32px rgba(106, 76, 147, 0.3)'
                  }}
                />
                <p style={{ marginTop: '15px', color: '#aaa', fontSize: '14px' }}>
                  🎬 Pygame Battle Visualization
                </p>
              </div>
            ) : battle.replay_data ? (
              <BattleReplay battle={battle} />
            ) : (
              <p style={{ color: '#aaa' }}>No replay available</p>
            )}
          </div>
        </div>
      )}

      {/* Final Stats */}
      {finalStats && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Final Statistics</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
            {/* Team 1 */}
            <div>
              <h4 style={{ color: '#3498db', marginBottom: '10px' }}>Team 1 - {battle.player1_username}</h4>
              {finalStats.team1?.map((samurai, idx) => (
                <div key={idx} style={{
                  padding: '10px',
                  marginBottom: '10px',
                  background: samurai.alive ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                  borderRadius: '5px',
                  border: samurai.alive ? '1px solid #2ecc71' : '1px solid #e74c3c'
                }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {samurai.alive ? '✅' : '💀'} {samurai.name}
                  </p>
                  <p style={{ fontSize: '14px', color: '#aaa' }}>
                    HP: {samurai.hp.toFixed(0)} / {samurai.max_hp}
                  </p>
                  {samurai.kills > 0 && (
                    <p style={{ fontSize: '14px', color: '#f39c12' }}>⚔️ Kills: {samurai.kills}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Team 2 */}
            <div>
              <h4 style={{ color: '#e74c3c', marginBottom: '10px' }}>Team 2 - {battle.player2_username}</h4>
              {finalStats.team2?.map((samurai, idx) => (
                <div key={idx} style={{
                  padding: '10px',
                  marginBottom: '10px',
                  background: samurai.alive ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                  borderRadius: '5px',
                  border: samurai.alive ? '1px solid #2ecc71' : '1px solid #e74c3c'
                }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {samurai.alive ? '✅' : '💀'} {samurai.name}
                  </p>
                  <p style={{ fontSize: '14px', color: '#aaa' }}>
                    HP: {samurai.hp.toFixed(0)} / {samurai.max_hp}
                  </p>
                  {samurai.kills > 0 && (
                    <p style={{ fontSize: '14px', color: '#f39c12' }}>⚔️ Kills: {samurai.kills}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Battle Events Timeline */}
      <div className="card">
        <h3>Battle Timeline</h3>
        {events.length === 0 ? (
          <p style={{ color: '#aaa', marginTop: '15px' }}>No events recorded</p>
        ) : (
          <div style={{ marginTop: '15px' }}>
            {events.map((event, idx) => (
              <div
                key={idx}
                style={{
                  padding: '10px',
                  marginBottom: '10px',
                  background: 'rgba(52, 152, 219, 0.1)',
                  borderLeft: '3px solid #3498db',
                  borderRadius: '3px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ color: '#3498db', fontWeight: 'bold' }}>
                      {getEventIcon(event.event_type)} {event.event_type}
                    </span>
                    {event.data?.name && (
                      <span style={{ marginLeft: '10px', color: '#ecf0f1' }}>
                        {event.data.name}
                      </span>
                    )}
                    {event.data?.team && (
                      <span style={{
                        marginLeft: '10px',
                        fontSize: '12px',
                        color: event.data.team === 1 ? '#3498db' : '#e74c3c'
                      }}>
                        Team {event.data.team}
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#95a5a6', fontSize: '12px' }}>
                    {event.timestamp.toFixed(2)}s
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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

function getEventIcon(eventType) {
  switch (eventType) {
    case 'SPAWN': return '🎯'
    case 'DEATH': return '💀'
    case 'ATTACK': return '⚔️'
    case 'DAMAGE': return '💥'
    case 'HEAL': return '💚'
    default: return '📌'
  }
}