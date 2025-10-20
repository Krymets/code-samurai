import React, { useState } from 'react';
import { DECKS, getCard } from '../../data/gameData';
import './DeckSelect.css';

function DeckSelect({ selectedCharacter, onSelect, onBack }) {
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const handleSelect = (deck) => {
    setSelectedId(deck.id);
  };

  const handleConfirm = () => {
    if (selectedId) {
      const deck = DECKS.find(d => d.id === selectedId);
      onSelect(deck);
    }
  };

  const displayedDeck = hoveredId
    ? DECKS.find(d => d.id === hoveredId)
    : selectedId
    ? DECKS.find(d => d.id === selectedId)
    : DECKS[0];

  return (
    <div className="deck-select">
      <div className="select-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h2 className="select-title">Choose Your Deck</h2>
        <div className="selected-character-info">
          <span>{selectedCharacter.icon} {selectedCharacter.name}</span>
        </div>
      </div>

      <div className="select-layout">
        {/* Deck list */}
        <div className="deck-list">
          {DECKS.map((deck) => (
            <div
              key={deck.id}
              className={`deck-card ${
                selectedId === deck.id ? 'selected' : ''
              } ${hoveredId === deck.id ? 'hovered' : ''}`}
              onClick={() => handleSelect(deck)}
              onMouseEnter={() => setHoveredId(deck.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ borderColor: deck.color }}
            >
              <div className="card-icon">{deck.icon}</div>
              <div className="card-info">
                <div className="card-name">{deck.name}</div>
                <div className="card-description">{deck.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Deck details */}
        <div className="deck-details">
          <div
            className="details-header"
            style={{ backgroundColor: displayedDeck.color + '20' }}
          >
            <div className="details-icon">{displayedDeck.icon}</div>
            <div>
              <h3>{displayedDeck.name} Deck</h3>
              <p className="details-description">{displayedDeck.description}</p>
            </div>
          </div>

          <div className="deck-cards">
            <h4>Strategy Cards</h4>
            {displayedDeck.cards.map((cardPair, index) => {
              const condCard = getCard(cardPair.conditionId);
              const actCard = getCard(cardPair.actionId);

              return (
                <div key={index} className="card-pair">
                  <div className="card-pair-number">{index + 1}</div>
                  <div className="card-pair-content">
                    <div className="condition-card">
                      <span className="card-pair-icon">{condCard?.icon}</span>
                      <div>
                        <div className="card-pair-label">IF</div>
                        <div className="card-pair-name">{condCard?.name}</div>
                      </div>
                    </div>
                    <div className="card-pair-arrow">→</div>
                    <div className="action-card">
                      <span className="card-pair-icon">{actCard?.icon}</span>
                      <div>
                        <div className="card-pair-label">DO</div>
                        <div className="card-pair-name">{actCard?.name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className="btn-confirm"
            onClick={handleConfirm}
            disabled={!selectedId}
            style={{
              backgroundColor: selectedId ? displayedDeck.color : '#666',
            }}
          >
            {selectedId ? 'Confirm Deck' : 'Select a Deck'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeckSelect;