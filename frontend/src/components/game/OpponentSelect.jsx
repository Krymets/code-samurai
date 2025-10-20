import React, { useState } from 'react';
import { OPPONENTS } from '../../data/gameData';
import { getPlayerStats } from '../../services/storage';
import './OpponentSelect.css';

function OpponentSelect({ selectedCharacter, selectedDeck, onSelect, onBack }) {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const playerStats = getPlayerStats();

  const handleSelect = (opponent) => {
    setSelectedId(opponent.id);
  };

  const handleConfirm = () => {
    if (selectedId) {
      const opponent = OPPONENTS.find(o => o.id === selectedId);
      onSelect(opponent);
    }
  };

  const displayedOpponent = hoveredId
    ? OPPONENTS.find(o => o.id === hoveredId)
    : selectedId
    ? OPPONENTS.find(o => o.id === selectedId)
    : OPPONENTS[0];

  const getDefeatCount = (opponentId) => {
    return playerStats.defeatedOpponents[opponentId] || 0;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Newbie': return '#88ff88';
      case 'Veteran': return '#ffaa44';
      case 'Expert': return '#ff6644';
      case 'Master': return '#ffaa00';
      case 'BOSS': return '#aa00ff';
      default: return '#666';
    }
  };

  return (
    <div className="opponent-select">
      <div className="select-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h2 className="select-title">Choose Your Opponent</h2>
        <div className="selected-info">
          <span>{selectedCharacter.icon} {selectedCharacter.name}</span>
          <span className="separator">|</span>
          <span>{selectedDeck.icon} {selectedDeck.name}</span>
        </div>
      </div>

      <div className="select-layout">
        {/* Opponent list */}
        <div className="opponent-list">
          {OPPONENTS.map((opponent) => {
            const defeatCount = getDefeatCount(opponent.id);
            const diffColor = getDifficultyColor(opponent.difficulty);

            return (
              <div
                key={opponent.id}
                className={`opponent-card ${
                  selectedId === opponent.id ? 'selected' : ''
                } ${hoveredId === opponent.id ? 'hovered' : ''}`}
                onClick={() => handleSelect(opponent)}
                onMouseEnter={() => setHoveredId(opponent.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ borderColor: diffColor }}
              >
                <div className="card-icon">{opponent.icon}</div>
                <div className="card-info">
                  <div className="card-name">{opponent.name}</div>
                  <div
                    className="card-difficulty"
                    style={{ color: diffColor }}
                  >
                    {opponent.difficulty}
                  </div>
                  {defeatCount > 0 && (
                    <div className="card-defeats">
                      ✓ Defeated {defeatCount}x
                    </div>
                  )}
                </div>
                <div className="card-level">Lv.{opponent.level}</div>
              </div>
            );
          })}
        </div>

        {/* Opponent details */}
        <div className="opponent-details">
          <div
            className="details-header"
            style={{
              backgroundColor: getDifficultyColor(displayedOpponent.difficulty) + '20'
            }}
          >
            <div className="details-icon">{displayedOpponent.icon}</div>
            <div>
              <h3>{displayedOpponent.name}</h3>
              <p
                className="details-difficulty"
                style={{ color: getDifficultyColor(displayedOpponent.difficulty) }}
              >
                {displayedOpponent.difficulty} - Level {displayedOpponent.level}
              </p>
            </div>
          </div>

          <div className="details-description">
            {displayedOpponent.description}
          </div>

          {/* Opponent stats */}
          <div className="opponent-stats">
            <h4>Enemy Stats</h4>
            <div className="stat-comparison">
              <div className="stat-row">
                <span className="stat-label">Samurai:</span>
                <span className="stat-value">
                  {displayedOpponent.samurai.icon} {displayedOpponent.samurai.name}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Deck:</span>
                <span className="stat-value">
                  {displayedOpponent.deck.icon} {displayedOpponent.deck.name}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">HP:</span>
                <span className="stat-value">{displayedOpponent.samurai.stats.maxHp}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Attack:</span>
                <span className="stat-value">{displayedOpponent.samurai.stats.attack}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Defense:</span>
                <span className="stat-value">{displayedOpponent.samurai.stats.defense}</span>
              </div>
            </div>
          </div>

          {/* Rewards */}
          <div className="opponent-rewards">
            <h4>Victory Rewards</h4>
            <div className="reward-item">
              <span className="reward-icon">⭐</span>
              <span className="reward-text">+{displayedOpponent.reward.xp} XP</span>
            </div>
            <div className="reward-item">
              <span className="reward-icon">🏆</span>
              <span className="reward-text">Title: "{displayedOpponent.reward.title}"</span>
            </div>
          </div>

          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={!selectedId}
            style={{
              backgroundColor: selectedId
                ? getDifficultyColor(displayedOpponent.difficulty)
                : '#666',
            }}
          >
            {selectedId ? 'Start Battle!' : 'Select an Opponent'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OpponentSelect;