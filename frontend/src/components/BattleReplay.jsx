import { useEffect, useRef, useState } from 'react'

const ARENA_SIZE = 600
const ARENA_X = 50
const ARENA_Y = 50
const SAMURAI_RADIUS = 15

export default function BattleReplay({ battle }) {
  const canvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const animationFrameRef = useRef(null)
  const lastTimeRef = useRef(0)

  const events = battle.replay_data?.events || []
  const finalStats = battle.replay_data?.final_stats || {}
  const duration = battle.replay_data?.duration || battle.duration || 10

  const particlesRef = useRef([])
  const bloodPoolsRef = useRef([])
  const flyingSwordsRef = useRef([])
  const screenShakeRef = useRef({ x: 0, y: 0, intensity: 0 })

  // Initialize samurais with animation state
  const initializeSamurais = () => {
    const samurais = []

    // Team 1
    if (finalStats.team1) {
      finalStats.team1.forEach((s, idx) => {
        samurais.push({
          id: s.id,
          name: s.name,
          team: 1,
          x: ARENA_X + 100,
          y: ARENA_Y + ARENA_SIZE / 2 + (idx - 0.5) * 80,
          hp: s.max_hp,
          displayHp: s.max_hp,
          maxHp: s.max_hp,
          alive: true,
          color: idx === 0 ? '#d95763' : idx === 1 ? '#e67379' : '#f18f95',
          targetX: ARENA_X + 100,
          targetY: ARENA_Y + ARENA_SIZE / 2 + (idx - 0.5) * 80,
          isAttacking: false,
          attackProgress: 0,
          swordAngle: -Math.PI / 4,
          walkCycle: 0,
          bobOffset: 0
        })
      })
    }

    // Team 2
    if (finalStats.team2) {
      finalStats.team2.forEach((s, idx) => {
        samurais.push({
          id: s.id,
          name: s.name,
          team: 2,
          x: ARENA_X + ARENA_SIZE - 100,
          y: ARENA_Y + ARENA_SIZE / 2 + (idx - 0.5) * 80,
          hp: s.max_hp,
          displayHp: s.max_hp,
          maxHp: s.max_hp,
          alive: true,
          color: idx === 0 ? '#5fcde4' : idx === 1 ? '#87d5eb' : '#afdef1',
          targetX: ARENA_X + ARENA_SIZE - 100,
          targetY: ARENA_Y + ARENA_SIZE / 2 + (idx - 0.5) * 80,
          isAttacking: false,
          attackProgress: 0,
          swordAngle: Math.PI / 4,
          walkCycle: 0,
          bobOffset: 0
        })
      })
    }

    return samurais
  }

  const [samurais, setSamurais] = useState(initializeSamurais())

  // Process events and trigger animations
  const processEvents = (time, dt) => {
    const newSamurais = [...samurais]

    // Process new events that happened in this frame
    events.forEach(event => {
      if (event.timestamp > time - dt && event.timestamp <= time) {
        if (event.event_type === 'DEATH') {
          const samurai = newSamurais.find(s => s.id === event.data.samurai_id)
          if (samurai && samurai.alive) {
            samurai.alive = false
            samurai.hp = 0

            // Death effects
            createBloodPool(samurai.x, samurai.y)
            createFlyingSword(samurai.x, samurai.y, samurai.team)
            createParticles(samurai.x, samurai.y, '#e74c3c', 20)
            triggerScreenShake(8)
          }
        }
      }
    })

    // Update animations
    newSamurais.forEach(samurai => {
      // Smooth HP transitions
      const hpDiff = samurai.hp - samurai.displayHp
      samurai.displayHp += hpDiff * 0.1

      if (samurai.alive) {
        // Walk cycle animation
        samurai.walkCycle += dt * 10
        samurai.bobOffset = Math.sin(samurai.walkCycle) * 2

        // Move towards enemies (simple AI)
        const enemies = newSamurais.filter(s => s.team !== samurai.team && s.alive)
        if (enemies.length > 0) {
          const closest = enemies.reduce((prev, curr) => {
            const prevDist = Math.hypot(prev.x - samurai.x, prev.y - samurai.y)
            const currDist = Math.hypot(curr.x - samurai.x, curr.y - samurai.y)
            return currDist < prevDist ? curr : prev
          })

          const dx = closest.x - samurai.x
          const dy = closest.y - samurai.y
          const dist = Math.hypot(dx, dy)

          if (dist > 60) {
            // Move towards enemy
            samurai.x += (dx / dist) * 1.5 * dt * 60
            samurai.y += (dy / dist) * 1.5 * dt * 60
          } else {
            // In attack range - trigger attack
            if (!samurai.isAttacking) {
              samurai.isAttacking = true
              samurai.attackProgress = 0
            }
          }
        }

        // Attack animation
        if (samurai.isAttacking) {
          samurai.attackProgress += dt * 5
          samurai.swordAngle = (samurai.team === 1 ? -Math.PI / 4 : Math.PI / 4) +
                               Math.sin(samurai.attackProgress * Math.PI) * Math.PI / 2

          if (samurai.attackProgress >= 1) {
            samurai.isAttacking = false
            samurai.attackProgress = 0

            // Hit particles
            createParticles(samurai.x + (samurai.team === 1 ? 30 : -30), samurai.y, '#ffc857', 10)
            triggerScreenShake(3)
          }
        }
      }
    })

    return newSamurais
  }

  // Particle system
  const createParticles = (x, y, color, count) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5 - 2,
        life: 1,
        color,
        size: Math.random() * 3 + 2
      })
    }
  }

  const createBloodPool = (x, y) => {
    bloodPoolsRef.current.push({
      x, y,
      radius: 0,
      maxRadius: 30,
      alpha: 0.6
    })
  }

  const createFlyingSword = (x, y, team) => {
    flyingSwordsRef.current.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: -8,
      rotation: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: team === 1 ? '#d95763' : '#5fcde4',
      life: 1
    })
  }

  const triggerScreenShake = (intensity) => {
    screenShakeRef.current.intensity = Math.max(screenShakeRef.current.intensity, intensity)
  }

  const updateEffects = (dt) => {
    // Update particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.3 // gravity
      p.life -= dt
      return p.life > 0
    })

    // Update blood pools
    bloodPoolsRef.current.forEach(pool => {
      if (pool.radius < pool.maxRadius) {
        pool.radius += 0.5
      }
      pool.alpha *= 0.99
    })
    bloodPoolsRef.current = bloodPoolsRef.current.filter(p => p.alpha > 0.01)

    // Update flying swords
    flyingSwordsRef.current = flyingSwordsRef.current.filter(sword => {
      sword.x += sword.vx
      sword.y += sword.vy
      sword.vy += 0.5 // gravity
      sword.rotation += sword.vr
      sword.life -= dt
      return sword.life > 0 && sword.y < ARENA_Y + ARENA_SIZE + 50
    })

    // Update screen shake
    if (screenShakeRef.current.intensity > 0) {
      screenShakeRef.current.x = (Math.random() - 0.5) * screenShakeRef.current.intensity
      screenShakeRef.current.y = (Math.random() - 0.5) * screenShakeRef.current.intensity
      screenShakeRef.current.intensity *= 0.9
    }
  }

  // Animation loop
  useEffect(() => {
    if (!isPlaying) return

    const animate = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp
      const deltaTime = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp

      setCurrentTime(prevTime => {
        const newTime = prevTime + deltaTime * playbackSpeed
        if (newTime >= duration) {
          setIsPlaying(false)
          return duration
        }
        return newTime
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, playbackSpeed, duration])

  // Update samurais and effects
  useEffect(() => {
    const dt = 1/60
    setSamurais(processEvents(currentTime, dt))
    updateEffects(dt)
  }, [currentTime])

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const shake = screenShakeRef.current

    // Save context
    ctx.save()
    ctx.translate(shake.x, shake.y)

    // Clear
    ctx.fillStyle = '#141C24'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw arena
    ctx.fillStyle = '#1E293B'
    ctx.fillRect(ARENA_X, ARENA_Y, ARENA_SIZE, ARENA_SIZE)

    // Grid
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    const gridSize = 50
    for (let x = ARENA_X; x <= ARENA_X + ARENA_SIZE; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, ARENA_Y)
      ctx.lineTo(x, ARENA_Y + ARENA_SIZE)
      ctx.stroke()
    }
    for (let y = ARENA_Y; y <= ARENA_Y + ARENA_SIZE; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(ARENA_X, y)
      ctx.lineTo(ARENA_X + ARENA_SIZE, y)
      ctx.stroke()
    }

    // Border
    ctx.strokeStyle = '#6A4C93'
    ctx.lineWidth = 3
    ctx.strokeRect(ARENA_X, ARENA_Y, ARENA_SIZE, ARENA_SIZE)

    // Draw blood pools
    bloodPoolsRef.current.forEach(pool => {
      ctx.fillStyle = `rgba(231, 76, 60, ${pool.alpha})`
      ctx.beginPath()
      ctx.arc(pool.x, pool.y, pool.radius, 0, Math.PI * 2)
      ctx.fill()
    })

    // Draw flying swords
    flyingSwordsRef.current.forEach(sword => {
      ctx.save()
      ctx.translate(sword.x, sword.y)
      ctx.rotate(sword.rotation)
      ctx.strokeStyle = sword.color
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(-15, 0)
      ctx.lineTo(15, 0)
      ctx.stroke()
      ctx.restore()
    })

    // Draw samurais
    samurais.forEach(samurai => {
      if (!samurai.alive) {
        // Death marker
        ctx.fillStyle = 'rgba(231, 76, 60, 0.3)'
        ctx.beginPath()
        ctx.arc(samurai.x, samurai.y, SAMURAI_RADIUS * 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.font = '24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('💀', samurai.x, samurai.y + 8)
        return
      }

      const y = samurai.y + samurai.bobOffset

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.ellipse(samurai.x, samurai.y + SAMURAI_RADIUS + 2, SAMURAI_RADIUS * 0.8, SAMURAI_RADIUS * 0.3, 0, 0, Math.PI * 2)
      ctx.fill()

      // Samurai body
      ctx.fillStyle = samurai.color
      ctx.beginPath()
      ctx.arc(samurai.x, y, SAMURAI_RADIUS, 0, Math.PI * 2)
      ctx.fill()

      // Border
      ctx.strokeStyle = samurai.team === 1 ? '#d95763' : '#5fcde4'
      ctx.lineWidth = 2
      ctx.stroke()

      // Sword
      ctx.save()
      ctx.translate(samurai.x, y)
      ctx.rotate(samurai.swordAngle)

      // Sword glow when attacking
      if (samurai.isAttacking) {
        ctx.strokeStyle = '#ffc857'
        ctx.lineWidth = 6
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(25, 0)
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      ctx.strokeStyle = '#94A3B8'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(25, 0)
      ctx.stroke()

      // Sword tip
      ctx.fillStyle = '#CBD5E1'
      ctx.beginPath()
      ctx.arc(25, 0, 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()

      // HP bar
      const barWidth = 40
      const barHeight = 5
      const barX = samurai.x - barWidth / 2
      const barY = y - SAMURAI_RADIUS - 12

      // Background
      ctx.fillStyle = '#334155'
      ctx.fillRect(barX, barY, barWidth, barHeight)

      // HP
      const hpPercent = samurai.displayHp / samurai.maxHp
      ctx.fillStyle = hpPercent > 0.5 ? '#2ecc71' : hpPercent > 0.25 ? '#f39c12' : '#e74c3c'
      ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight)

      // HP border
      ctx.strokeStyle = '#64748B'
      ctx.lineWidth = 1
      ctx.strokeRect(barX, barY, barWidth, barHeight)

      // Name
      ctx.fillStyle = '#F1F5F9'
      ctx.font = 'bold 11px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(samurai.name, samurai.x, y + SAMURAI_RADIUS + 18)
    })

    // Draw particles
    particlesRef.current.forEach(p => {
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.life
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1

    // Time display
    ctx.fillStyle = '#F1F5F9'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'left'
    ctx.fillText(`⏱️ ${currentTime.toFixed(2)}s / ${duration.toFixed(2)}s`, ARENA_X, ARENA_Y - 20)

    // Restore context
    ctx.restore()

  }, [samurais, currentTime, duration])

  const handlePlay = () => {
    if (currentTime >= duration) {
      handleRestart()
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleRestart = () => {
    setCurrentTime(0)
    lastTimeRef.current = 0
    setIsPlaying(false)
    setSamurais(initializeSamurais())
    particlesRef.current = []
    bloodPoolsRef.current = []
    flyingSwordsRef.current = []
    screenShakeRef.current = { x: 0, y: 0, intensity: 0 }
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={700}
        height={700}
        style={{
          border: '2px solid #6A4C93',
          borderRadius: '8px',
          background: '#0F172A',
          display: 'block',
          margin: '0 auto'
        }}
      />

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '20px',
        alignItems: 'center'
      }}>
        {!isPlaying ? (
          <button className="primary" onClick={handlePlay} style={{ fontSize: '16px' }}>
            ▶️ Play
          </button>
        ) : (
          <button onClick={handlePause} style={{ fontSize: '16px' }}>
            ⏸️ Pause
          </button>
        )}

        <button onClick={handleRestart} style={{ fontSize: '16px' }}>
          🔄 Restart
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#F1F5F9' }}>Speed:</span>
          {[0.5, 1, 2, 4].map(speed => (
            <button
              key={speed}
              onClick={() => setPlaybackSpeed(speed)}
              style={{
                background: playbackSpeed === speed ? '#6A4C93' : 'transparent',
                border: '1px solid #6A4C93',
                padding: '5px 12px',
                cursor: 'pointer',
                borderRadius: '4px',
                color: '#F1F5F9',
                fontSize: '14px'
              }}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '700px',
        margin: '15px auto',
        height: '6px',
        background: '#334155',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${(currentTime / duration) * 100}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #6A4C93, #9D7CBF)',
          transition: 'width 0.1s linear'
        }} />
      </div>
    </div>
  )
}