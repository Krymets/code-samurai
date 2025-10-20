import React, { useState } from 'react';
import CharacterSelect from '../components/game/CharacterSelect';
import DeckSelect from '../components/game/DeckSelect';
import OpponentSelect from '../components/game/OpponentSelect';
import BattleArena from '../components/game/BattleArena';
import BattleResult from '../components/game/BattleResult';
import StatsPanel from '../components/game/StatsPanel';
import { getStatsSummary } from '../services/storage';
import './GamePage.css';

const GameStage = {
  CHARACTER_SELECT: 'CHARACTER_SELECT',
  DECK_SELECT: 'DECK_SELECT',
  OPPONENT_SELECT: 'OPPONENT_SELECT',
  BATTLE: 'BATTLE',
  RESULT: 'RESULT'
};

function GamePage() {
  const [stage, setStage] = useState(GameStage.CHARACTER_SELECT);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [battleResult, setBattleResult] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const handleCharacterSelect = (samurai) => {
    setSelectedCharacter(samurai);
    setStage(GameStage.DECK_SELECT);
  };

  const handleDeckSelect = (deck) => {
    setSelectedDeck(deck);
    setStage(GameStage.OPPONENT_SELECT);
  };

  const handleOpponentSelect = (opponent) => {
    setSelectedOpponent(opponent);
    setStage(GameStage.BATTLE);
  };

  const handleBattleComplete = (result) => {
    setBattleResult(result);
    setStage(GameStage.RESULT);
  };

  const handlePlayAgain = () => {
    // Reset to character select
    setSelectedCharacter(null);
    setSelectedDeck(null);
    setSelectedOpponent(null);
    setBattleResult(null);
    setStage(GameStage.CHARACTER_SELECT);
  };

  const handleRematch = () => {
    // Keep same selections, go straight to battle
    setBattleResult(null);
    setStage(GameStage.BATTLE);
  };

  const handleBackToCharacter = () => {
    setStage(GameStage.CHARACTER_SELECT);
  };

  const handleBackToDeck = () => {
    setStage(GameStage.DECK_SELECT);
  };

  const handleBackToOpponent = () => {
    setStage(GameStage.OPPONENT_SELECT);
  };

  return (
    <div className="game-page">
      {/* Header */}
      <header className="game-header">
        <h1>⚔️ Code Samurai</h1>
        <div className="header-actions">
          <button
            className="btn-stats"
            onClick={() => setShowStats(!showStats)}
          >
            📊 Stats
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="game-content">
        {stage === GameStage.CHARACTER_SELECT && (
          <CharacterSelect onSelect={handleCharacterSelect} />
        )}

        {stage === GameStage.DECK_SELECT && (
          <DeckSelect
            selectedCharacter={selectedCharacter}
            onSelect={handleDeckSelect}
            onBack={handleBackToCharacter}
          />
        )}

        {stage === GameStage.OPPONENT_SELECT && (
          <OpponentSelect
            selectedCharacter={selectedCharacter}
            selectedDeck={selectedDeck}
            onSelect={handleOpponentSelect}
            onBack={handleBackToDeck}
          />
        )}

        {stage === GameStage.BATTLE && (
          <BattleArena
            playerSamurai={selectedCharacter}
            playerDeck={selectedDeck}
            opponent={selectedOpponent}
            onComplete={handleBattleComplete}
            onBack={handleBackToOpponent}
          />
        )}

        {stage === GameStage.RESULT && (
          <BattleResult
            result={battleResult}
            opponent={selectedOpponent}
            onPlayAgain={handlePlayAgain}
            onRematch={handleRematch}
          />
        )}
      </div>

      {/* Stats Panel (overlay) */}
      {showStats && (
        <div className="stats-overlay" onClick={() => setShowStats(false)}>
          <div className="stats-modal" onClick={(e) => e.stopPropagation()}>
            <StatsPanel onClose={() => setShowStats(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default GamePage;