import React, { useState } from 'react';
import { SAMURAIS } from '../../data/gameData';
import './CharacterSelect.css';

function CharacterSelect({ onSelect }) {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const handleSelect = (samurai) => {
    setSelectedId(samurai.id);
  };

  const handleConfirm = () => {
    if (selectedId) {
      const samurai = SAMURAIS.find(s => s.id === selectedId);
      onSelect(samurai);
    }
  };

  const displayedSamurai = hoveredId
    ? SAMURAIS.find(s => s.id === hoveredId)
    : selectedId
    ? SAMURAIS.find(s => s.id === selectedId)
    : SAMURAIS[0];

  return (
    <div className="character-select">
      <h2 className="select-title">Choose Your Samurai</h2>

      <div className="select-layout">
        {/* Character list */}
        <div className="character-list">
          {SAMURAIS.map((samurai) => (
            <div
              key={samurai.id}
              className={`character-card ${
                selectedId === samurai.id ? 'selected' : ''
              } ${hoveredId === samurai.id ? 'hovered' : ''}`}
              onClick={() => handleSelect(samurai)}
              onMouseEnter={() => setHoveredId(samurai.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ borderColor: samurai.color }}
            >
              <div className="card-icon">{samurai.icon}</div>
              <div className="card-info">
                <div className="card-name">{samurai.name}</div>
                <div className="card-title">{samurai.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Character details */}
        <div className="character-details">
          <div
            className="details-header"
            style={{ backgroundColor: displayedSamurai.color + '20' }}
          >
            <div className="details-icon">{displayedSamurai.icon}</div>
            <div>
              <h3>{displayedSamurai.name}</h3>
              <p className="details-title">{displayedSamurai.title}</p>
            </div>
          </div>

          <div className="details-description">
            {displayedSamurai.description}
          </div>

          <div className="details-stats">
            <h4>Stats</h4>
            <div className="stat-row">
              <span className="stat-label">❤️ HP:</span>
              <div className="stat-bar">
                <div
                  className="stat-fill hp"
                  style={{
                    width: `${(displayedSamurai.stats.maxHp / 150) * 100}%`,
                  }}
                />
              </div>
              <span className="stat-value">{displayedSamurai.stats.maxHp}</span>
            </div>

            <div className="stat-row">
              <span className="stat-label">⚔️ Attack:</span>
              <div className="stat-bar">
                <div
                  className="stat-fill attack"
                  style={{
                    width: `${(displayedSamurai.stats.attack / 30) * 100}%`,
                  }}
                />
              </div>
              <span className="stat-value">{displayedSamurai.stats.attack}</span>
            </div>

            <div className="stat-row">
              <span className="stat-label">🛡️ Defense:</span>
              <div className="stat-bar">
                <div
                  className="stat-fill defense"
                  style={{
                    width: `${(displayedSamurai.stats.defense / 20) * 100}%`,
                  }}
                />
              </div>
              <span className="stat-value">{displayedSamurai.stats.defense}</span>
            </div>

            <div className="stat-row">
              <span className="stat-label">⚡ Speed:</span>
              <div className="stat-bar">
                <div
                  className="stat-fill speed"
                  style={{
                    width: `${(displayedSamurai.stats.speed / 1.5) * 100}%`,
                  }}
                />
              </div>
              <span className="stat-value">{displayedSamurai.stats.speed.toFixed(1)}x</span>
            </div>
          </div>

          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={!selectedId}
            style={{
              backgroundColor: selectedId ? displayedSamurai.color : '#666',
            }}
          >
            {selectedId ? 'Confirm Selection' : 'Select a Samurai'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CharacterSelect;