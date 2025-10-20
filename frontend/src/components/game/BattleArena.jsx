import React, { useEffect, useRef, useState } from 'react';
import { BattleEngine, BattleState } from '../../engine/battleEngine';
import { updateStatsAfterBattle, addBattleToHistory } from '../../services/storage';
import './BattleArena.css';

function BattleArena({ playerSamurai, playerDeck, opponent, onComplete, onBack }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [battleState, setBattleState] = useState(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Initialize battle engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new BattleEngine(
      playerSamurai,
      playerDeck,
      opponent,
      canvas.width,
      canvas.height
    );

    engineRef.current = engine;

    // Countdown before battle
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        engine.start();
        setBattleStarted(true);
      }
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [playerSamurai, playerDeck, opponent]);

  // Game loop
  useEffect(() => {
    if (!battleStarted || !engineRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const engine = engineRef.current;

    let lastTime = performance.now();
    let animationId;

    const gameLoop = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Update engine
      engine.update(deltaTime);

      // Get current state
      const state = engine.getState();
      setBattleState(state);

      // Render
      render(ctx, canvas, state);

      // Check if battle is finished
      if (state.state === BattleState.FINISHED) {
        const result = engine.getResult();

        // Update stats and history
        updateStatsAfterBattle(result, opponent);
        addBattleToHistory({
          playerSamurai: playerSamurai.name,
          playerDeck: playerDeck.name,
          opponent: opponent.name,
          result: result.winner,
          battleTime: result.battleTime,
          playerStats: result.player,
          enemyStats: result.enemy
        });

        // Notify parent
        setTimeout(() => {
          onComplete(result);
        }, 2000);
        return;
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [battleStarted, playerSamurai, playerDeck, opponent, onComplete]);

  // Render function
  const render = (ctx, canvas, state) => {
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw arena boundary
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Draw fighters
    if (state.player.isAlive) {
      drawFighter(ctx, state.player, true);
    }
    if (state.enemy.isAlive) {
      drawFighter(ctx, state.enemy, false);
    }

    // Draw connection line
    if (state.player.isAlive && state.enemy.isAlive) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(state.player.x, state.player.y);
      ctx.lineTo(state.enemy.x, state.enemy.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw timer
    drawTimer(ctx, canvas, state);
  };

  const drawFighter = (ctx, fighter, isPlayer) => {
    const { x, y, color, hp, maxHp, defendActive, attackCooldown } = fighter;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, y + 40, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // Head
    ctx.beginPath();
    ctx.arc(x, y - 20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Body
    ctx.fillRect(x - 10, y - 5, 20, 30);
    ctx.strokeRect(x - 10, y - 5, 20, 30);

    // Arms
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x - 20, y + 15);
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + 20, y + 15);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 25);
    ctx.lineTo(x - 10, y + 45);
    ctx.moveTo(x + 5, y + 25);
    ctx.lineTo(x + 10, y + 45);
    ctx.stroke();

    // Defend shield effect
    if (defendActive) {
      ctx.strokeStyle = '#4488ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y + 10, 30, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Attack cooldown indicator
    if (attackCooldown > 0) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.arc(x + 25, y - 25, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // HP Bar
    const barWidth = 60;
    const barHeight = 8;
    const barX = x - barWidth / 2;
    const barY = y - 45;

    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // HP
    const hpPercent = hp / maxHp;
    const hpColor = hpPercent > 0.5 ? '#44ff44' : hpPercent > 0.2 ? '#ffaa44' : '#ff4444';
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

    // Border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // HP Text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(hp)}/${maxHp}`, x, barY - 3);

    // Name
    ctx.font = 'bold 12px Arial';
    ctx.fillStyle = isPlayer ? '#44ff44' : '#ff4444';
    ctx.fillText(fighter.name, x, y + 65);

    // Action text
    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(fighter.currentAction, x, y + 78);
  };

  const drawTimer = (ctx, canvas, state) => {
    const timeLeft = state.maxBattleTime - state.battleTime;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = Math.floor(timeLeft % 60);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${minutes}:${seconds.toString().padStart(2, '0')}`,
      canvas.width / 2,
      40
    );
  };

  return (
    <div className="battle-arena">
      {!battleStarted && (
        <div className="countdown-overlay">
          <div className="countdown-number">{countdown > 0 ? countdown : 'FIGHT!'}</div>
        </div>
      )}

      <div className="arena-header">
        <button className="btn-back-small" onClick={onBack}>
          ← Back
        </button>
        <h2>⚔️ Battle Arena</h2>
        <div className="battle-info">
          <span className="player-side">
            {playerSamurai.icon} {playerSamurai.name}
          </span>
          <span className="vs">VS</span>
          <span className="enemy-side">
            {opponent.icon} {opponent.name}
          </span>
        </div>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={1000}
          height={600}
          className="battle-canvas"
        />
      </div>

      {battleState && (
        <div className="battle-stats">
          <div className="fighter-stat player">
            <h4>{battleState.player.name}</h4>
            <div className="stat-item">
              HP: {Math.ceil(battleState.player.hp)}/{battleState.player.maxHp}
            </div>
            <div className="stat-item">
              Action: {battleState.player.currentAction}
            </div>
          </div>

          <div className="fighter-stat enemy">
            <h4>{battleState.enemy.name}</h4>
            <div className="stat-item">
              HP: {Math.ceil(battleState.enemy.hp)}/{battleState.enemy.maxHp}
            </div>
            <div className="stat-item">
              Action: {battleState.enemy.currentAction}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BattleArena;