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
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f0f1e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw arena floor pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw arena boundary with glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
    ctx.shadowBlur = 0;

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw fighters
    if (state.player.isAlive) {
      drawFighter(ctx, state.player, state.enemy, true, state.battleTime);
    }
    if (state.enemy.isAlive) {
      drawFighter(ctx, state.enemy, state.player, false, state.battleTime);
    }

    // Draw connection line with distance
    if (state.player.isAlive && state.enemy.isAlive) {
      const distance = Math.hypot(
        state.enemy.x - state.player.x,
        state.enemy.y - state.player.y
      );

      ctx.strokeStyle = distance < 100 ? 'rgba(255, 100, 100, 0.3)' : 'rgba(255, 255, 255, 0.1)';
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

  const drawFighter = (ctx, fighter, opponent, isPlayer, battleTime) => {
    const { x, y, color, hp, maxHp, defendActive, attackCooldown, currentAction } = fighter;

    // Animation variables
    const walkCycle = Math.sin(battleTime * 8) * 3;
    const breathe = Math.sin(battleTime * 2) * 2;
    const isAttacking = attackCooldown > 0.5;

    // Direction to opponent
    const facingRight = opponent && opponent.x > x;
    const dir = facingRight ? 1 : -1;

    // Shadow (larger and more visible)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 50, 25, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);

    // === BODY ===
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;

    // Torso (larger)
    ctx.fillRect(-15, -5 + breathe, 30, 35);
    ctx.strokeRect(-15, -5 + breathe, 30, 35);

    // Head with helmet
    ctx.beginPath();
    ctx.arc(0, -25 + breathe, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helmet ornament
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, -35 + breathe, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(-8, -28 + breathe, 5, 5);
    ctx.fillRect(3, -28 + breathe, 5, 5);
    ctx.strokeRect(-8, -28 + breathe, 5, 5);
    ctx.strokeRect(3, -28 + breathe, 5, 5);

    // Pupils
    ctx.fillStyle = '#000';
    ctx.fillRect(-6 + dir, -26 + breathe, 2, 2);
    ctx.fillRect(5 + dir, -26 + breathe, 2, 2);

    // === LEGS with animation ===
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    // Left leg
    ctx.beginPath();
    ctx.moveTo(-8, 30);
    ctx.lineTo(-12 + walkCycle, 55);
    ctx.stroke();

    // Left foot
    ctx.beginPath();
    ctx.arc(-12 + walkCycle, 55, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(8, 30);
    ctx.lineTo(12 - walkCycle, 55);
    ctx.stroke();

    // Right foot
    ctx.beginPath();
    ctx.arc(12 - walkCycle, 55, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#333';
    ctx.fill();
    ctx.stroke();

    // === ARMS ===
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 5;

    // Left arm (shield side)
    const leftArmAngle = defendActive ? -0.5 : 0.2;
    ctx.beginPath();
    ctx.moveTo(-15, 5);
    ctx.lineTo(-25 * dir + Math.cos(leftArmAngle) * 10, 20 + Math.sin(leftArmAngle) * 10);
    ctx.stroke();

    // Left hand
    ctx.beginPath();
    ctx.arc(-25 * dir + Math.cos(leftArmAngle) * 10, 20 + Math.sin(leftArmAngle) * 10, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();

    // Right arm (sword side)
    const swordAngle = isAttacking ? -1.2 : 0.5;
    ctx.beginPath();
    ctx.moveTo(15, 5);
    ctx.lineTo(30 * dir, 15 + Math.sin(swordAngle) * 15);
    ctx.stroke();

    // Right hand
    ctx.beginPath();
    ctx.arc(30 * dir, 15 + Math.sin(swordAngle) * 15, 5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.stroke();

    // === SWORD ===
    ctx.save();
    ctx.translate(30 * dir, 15 + Math.sin(swordAngle) * 15);
    ctx.rotate(swordAngle * dir);

    // Sword blade with gradient
    const swordGradient = ctx.createLinearGradient(0, 0, 40, 0);
    swordGradient.addColorStop(0, '#c0c0c0');
    swordGradient.addColorStop(0.5, '#ffffff');
    swordGradient.addColorStop(1, '#999999');
    ctx.fillStyle = swordGradient;
    ctx.fillRect(0, -3, 45, 6);

    // Sword edge shine
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(5, -2);
    ctx.lineTo(40, -2);
    ctx.stroke();

    // Sword outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, -3, 45, 6);

    // Sword point
    ctx.beginPath();
    ctx.moveTo(45, -3);
    ctx.lineTo(50, 0);
    ctx.lineTo(45, 3);
    ctx.closePath();
    ctx.fillStyle = '#999';
    ctx.fill();
    ctx.stroke();

    // Sword handle
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(-8, -4, 8, 8);
    ctx.strokeRect(-8, -4, 8, 8);

    // Sword guard
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-2, -6, 2, 12);
    ctx.strokeRect(-2, -6, 2, 12);

    // Sword trail effect when attacking
    if (isAttacking) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(50, 0);
      ctx.stroke();
    }

    ctx.restore();

    // === SHIELD (when defending) ===
    if (defendActive) {
      ctx.save();
      ctx.translate(-25 * dir, 15);

      // Shield shape
      ctx.fillStyle = '#4488ff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Shield emblem
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-6, 8);
      ctx.lineTo(6, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Shield glow
      ctx.strokeStyle = 'rgba(68, 136, 255, 0.6)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();

    // === HP BAR ===
    const barWidth = 80;
    const barHeight = 10;
    const barX = x - barWidth / 2;
    const barY = y - 60;

    // Bar shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(barX + 2, barY + 2, barWidth, barHeight);

    // Bar background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // HP fill
    const hpPercent = hp / maxHp;
    const hpColor = hpPercent > 0.6 ? '#44ff44' : hpPercent > 0.3 ? '#ffaa44' : '#ff4444';
    ctx.fillStyle = hpColor;
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);

    // HP shine effect
    const hpShine = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
    hpShine.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    hpShine.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = hpShine;
    ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight / 2);

    // Bar border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    // HP text with shadow
    ctx.shadowBlur = 3;
    ctx.shadowColor = '#000';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.ceil(hp)}/${maxHp}`, x, barY - 4);
    ctx.shadowBlur = 0;

    // Name with glow
    ctx.shadowBlur = 5;
    ctx.shadowColor = isPlayer ? '#44ff44' : '#ff4444';
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = isPlayer ? '#44ff44' : '#ff4444';
    ctx.fillText(fighter.name, x, y + 75);
    ctx.shadowBlur = 0;

    // Action text
    ctx.font = 'bold 11px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText(currentAction, x, y + 90);
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