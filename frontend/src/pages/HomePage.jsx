export default function HomePage({ user }) {
  return (
    <div className="home-page">
      <h1 className="page-title">Welcome to Code Samurai!</h1>
      <div className="hero">
        <p style={{ fontSize: '18px', marginBottom: '20px' }}>
          Build your samurai team, program their AI with cards, and battle others!
        </p>
        {user ? (
          <div>
            <p>Welcome back, {user.username}!</p>
            <a href="/samurais">
              <button className="primary" style={{ marginTop: '20px' }}>
                Manage Samurais →
              </button>
            </a>
          </div>
        ) : (
          <div>
            <p>Create an account to start playing!</p>
            <a href="/register">
              <button className="primary" style={{ marginTop: '20px' }}>
                Get Started →
              </button>
            </a>
          </div>
        )}
      </div>

      <div style={{ marginTop: '50px' }}>
        <h2>Features:</h2>
        <div className="grid">
          <div className="card">
            <h3>⚔️ Build Your Team</h3>
            <p>Create and customize samurais with unique stats</p>
          </div>
          <div className="card">
            <h3>🎴 Program AI</h3>
            <p>Use IF-DO cards to program samurai behavior</p>
          </div>
          <div className="card">
            <h3>🏆 Battle Others</h3>
            <p>Fight in real-time battles and climb the leaderboard</p>
          </div>
        </div>
      </div>
    </div>
  )
}
