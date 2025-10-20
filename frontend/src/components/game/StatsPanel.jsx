import React from 'react';
import { getStatsSummary, getBattleHistory, resetAllData, exportData } from '../../services/storage';
import './StatsPanel.css';

function StatsPanel({ onClose }) {
  const stats = getStatsSummary();
  const history = getBattleHistory(10);

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all stats? This cannot be undone!')) {
      resetAllData();
      window.location.reload();
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-samurai-stats-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stats-panel">
      <div className="panel-header">
        <h2>📊 Your Statistics</h2>
        <button className="btn-close" onClick={onClose}>✕</button>
      </div>

      <div className="panel-content">
        {/* Level and XP */}
        <div className="stats-section">
          <h3>Player Progress</h3>
          <div className="level-display">
            <div className="level-number">Level {stats.level}</div>
            <div className="title-display">"{stats.currentTitle}"</div>
          </div>
          <div className="xp-progress">
            <div className="xp-bar">
              <div
                className="xp-fill"
                style={{ width: `${stats.xpProgress}%` }}
              />
            </div>
            <div className="xp-text">{stats.xp} / {stats.xpToNextLevel} XP</div>
          </div>
        </div>

        {/* Battle Stats */}
        <div className="stats-section">
          <h3>Battle Record</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Total Battles</div>
              <div className="stat-value">{stats.totalBattles}</div>
            </div>
            <div className="stat-box win">
              <div className="stat-label">Wins</div>
              <div className="stat-value">{stats.wins}</div>
            </div>
            <div className="stat-box loss">
              <div className="stat-label">Losses</div>
              <div className="stat-value">{stats.losses}</div>
            </div>
            <div className="stat-box draw">
              <div className="stat-label">Draws</div>
              <div className="stat-value">{stats.draws}</div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value">{stats.winRate}%</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Current Streak</div>
              <div className="stat-value">{stats.currentWinStreak}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Best Streak</div>
              <div className="stat-value">{stats.longestWinStreak}</div>
            </div>
          </div>
        </div>

        {/* Unlocked Titles */}
        {stats.unlockedTitles && stats.unlockedTitles.length > 0 && (
          <div className="stats-section">
            <h3>Unlocked Titles ({stats.unlockedTitles.length})</h3>
            <div className="titles-list">
              {stats.unlockedTitles.map((title, index) => (
                <div
                  key={index}
                  className={`title-badge ${title === stats.currentTitle ? 'active' : ''}`}
                >
                  🏆 {title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Battles */}
        {history.length > 0 && (
          <div className="stats-section">
            <h3>Recent Battles</h3>
            <div className="history-list">
              {history.reverse().map((battle, index) => (
                <div
                  key={battle.id || index}
                  className={`history-item ${battle.result}`}
                >
                  <div className="history-icon">
                    {battle.result === 'player' ? '✓' : battle.result === 'draw' ? '=' : '✗'}
                  </div>
                  <div className="history-info">
                    <div className="history-opponent">{battle.opponent}</div>
                    <div className="history-details">
                      {battle.playerSamurai} vs {battle.opponent} • {Math.floor(battle.battleTime)}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Data Management */}
        <div className="stats-section">
          <h3>Data Management</h3>
          <div className="data-actions">
            <button className="btn-export" onClick={handleExport}>
              📥 Export Data
            </button>
            <button className="btn-reset" onClick={handleReset}>
              🗑️ Reset All Data
            </button>
          </div>
          <p className="data-note">
            Data is stored locally in your browser. Export to backup your progress.
          </p>
        </div>
      </div>
    </div>
  );
}

export default StatsPanel;