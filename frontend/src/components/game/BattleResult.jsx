import React from 'react';
import { getStatsSummary } from '../../services/storage';
import './BattleResult.css';

function BattleResult({ result, opponent, onPlayAgain, onRematch }) {
  const stats = getStatsSummary();
  const isVictory = result.winner === 'player';
  const isDraw = result.winner === 'draw';

  return (
    <div className="battle-result">
      <div className={`result-card ${isVictory ? 'victory' : isDraw ? 'draw' : 'defeat'}`}>
        <div className="result-icon">
          {isVictory ? '🏆' : isDraw ? '🤝' : '💀'}
        </div>

        <h2 className="result-title">
          {isVictory ? 'VICTORY!' : isDraw ? 'DRAW!' : 'DEFEAT'}
        </h2>

        <div className="battle-summary">
          <div className="summary-row">
            <span className="label">Battle Time:</span>
            <span className="value">{Math.floor(result.battleTime)}s</span>
          </div>

          <div className="summary-section">
            <h3>Your Stats</h3>
            <div className="summary-row">
              <span className="label">HP Remaining:</span>
              <span className="value hp-player">
                {Math.ceil(result.player.hpRemaining)}/{result.player.maxHp}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Damage Dealt:</span>
              <span className="value">{Math.ceil(result.player.damageDealt)}</span>
            </div>
            <div className="summary-row">
              <span className="label">Damage Taken:</span>
              <span className="value">{Math.ceil(result.player.damageTaken)}</span>
            </div>
          </div>

          <div className="summary-section">
            <h3>Enemy Stats</h3>
            <div className="summary-row">
              <span className="label">HP Remaining:</span>
              <span className="value hp-enemy">
                {Math.ceil(result.enemy.hpRemaining)}/{result.enemy.maxHp}
              </span>
            </div>
            <div className="summary-row">
              <span className="label">Damage Dealt:</span>
              <span className="value">{Math.ceil(result.enemy.damageDealt)}</span>
            </div>
          </div>
        </div>

        {isVictory && opponent.reward && (
          <div className="rewards-section">
            <h3>🎉 Rewards Earned!</h3>
            <div className="reward-item">
              ⭐ +{opponent.reward.xp} XP
            </div>
            {opponent.reward.title && (
              <div className="reward-item">
                🏆 Title Unlocked: "{opponent.reward.title}"
              </div>
            )}
          </div>
        )}

        <div className="player-progress">
          <h4>Your Progress</h4>
          <div className="progress-row">
            <span>Level {stats.level}</span>
            <div className="xp-bar">
              <div
                className="xp-fill"
                style={{ width: `${stats.xpProgress}%` }}
              />
            </div>
            <span>{stats.xp}/{stats.xpToNextLevel} XP</span>
          </div>
          <div className="stats-row">
            <div className="stat">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value">{stats.winRate}%</div>
            </div>
            <div className="stat">
              <div className="stat-label">Total Battles</div>
              <div className="stat-value">{stats.totalBattles}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Win Streak</div>
              <div className="stat-value">{stats.currentWinStreak}</div>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <button className="btn-rematch" onClick={onRematch}>
            ⚔️ Rematch
          </button>
          <button className="btn-new-battle" onClick={onPlayAgain}>
            🎮 New Battle
          </button>
        </div>
      </div>
    </div>
  );
}

export default BattleResult;