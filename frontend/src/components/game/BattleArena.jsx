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
  const particlesRef = useRef([]);
  const bloodPoolsRef = useRef([]);
  const clashEffectsRef = useRef([]);
  const prevHpRef = useRef({ player: 0, enemy: 0 });
  const prevAliveRef = useRef({ player: true, enemy: true });
  const bloodStainsRef = useRef([]);
  const footprintsRef = useRef([]);
  const torchesRef = useRef([
    { x: 50, y: 100, flicker: 0 },
    { x: 950, y: 100, flicker: 0 },
    { x: 50, y: 500, flicker: 0 },
    { x: 950, y: 500, flicker: 0 }
  ]);

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
      render(ctx, canvas, state, deltaTime);

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
  const render = (ctx, canvas, state, deltaTime) => {
    // Detect HP changes (hits) and trigger blood effects
    if (prevHpRef.current.player > state.player.hp && state.player.hp > 0) {
      createBloodSplatter(state.player.x, state.player.y - 10, 15);
      // Check if defender was blocking
      if (state.player.defendActive) {
        createClashEffect(state.player.x, state.player.y);
      }
    }
    if (prevHpRef.current.enemy > state.enemy.hp && state.enemy.hp > 0) {
      createBloodSplatter(state.enemy.x, state.enemy.y - 10, 15);
      // Check if defender was blocking
      if (state.enemy.defendActive) {
        createClashEffect(state.enemy.x, state.enemy.y);
      }
    }

    // Detect death and create blood pool
    if (prevAliveRef.current.player && !state.player.isAlive) {
      createBloodPool(state.player.x, state.player.y + 40);
    }
    if (prevAliveRef.current.enemy && !state.enemy.isAlive) {
      createBloodPool(state.enemy.x, state.enemy.y + 40);
    }

    // Update previous state
    prevHpRef.current = { player: state.player.hp, enemy: state.enemy.hp };
    prevAliveRef.current = { player: state.player.isAlive, enemy: state.enemy.isAlive };

    // === BACKGROUND SKY ===
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.6);
    skyGradient.addColorStop(0, '#1a0f2e');
    skyGradient.addColorStop(0.5, '#2a1a3e');
    skyGradient.addColorStop(1, '#3a2a4e');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height * 0.6);

    // === DISTANT MOUNTAINS ===
    ctx.fillStyle = '#1a1a2a';
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.5);
    for (let i = 0; i < canvas.width; i += 100) {
      ctx.lineTo(i, canvas.height * 0.5 - Math.random() * 80 - 40);
      ctx.lineTo(i + 50, canvas.height * 0.5 - Math.random() * 60 - 20);
    }
    ctx.lineTo(canvas.width, canvas.height * 0.5);
    ctx.lineTo(canvas.width, canvas.height * 0.6);
    ctx.lineTo(0, canvas.height * 0.6);
    ctx.fill();

    // === TREES IN BACKGROUND ===
    for (let i = 0; i < 8; i++) {
      const treeX = 100 + i * 120;
      const treeY = canvas.height * 0.55;
      ctx.fillStyle = '#2a1a1a';
      ctx.fillRect(treeX - 5, treeY, 10, 60);
      ctx.fillStyle = '#1a3a1a';
      ctx.beginPath();
      ctx.moveTo(treeX, treeY - 20);
      ctx.lineTo(treeX - 20, treeY + 20);
      ctx.lineTo(treeX + 20, treeY + 20);
      ctx.closePath();
      ctx.fill();
    }

    // === ARENA FLOOR WITH WOOD TEXTURE ===
    const floorGradient = ctx.createLinearGradient(0, canvas.height * 0.6, 0, canvas.height);
    floorGradient.addColorStop(0, '#4a3020');
    floorGradient.addColorStop(1, '#2a1810');
    ctx.fillStyle = floorGradient;
    ctx.fillRect(0, canvas.height * 0.6, canvas.width, canvas.height * 0.4);

    // Wood planks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.width; i += 80) {
      ctx.beginPath();
      ctx.moveTo(i, canvas.height * 0.6);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Horizontal wood texture
    for (let i = canvas.height * 0.6; i < canvas.height; i += 15) {
      ctx.strokeStyle = `rgba(60, 40, 20, ${Math.random() * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // === TORCHES ===
    torchesRef.current.forEach(torch => {
      torch.flicker = Math.sin(state.battleTime * 10 + torch.x) * 5;

      // Torch pole
      ctx.fillStyle = '#4a2a1a';
      ctx.fillRect(torch.x - 5, torch.y - 80, 10, 80);

      // Fire
      const fireGradient = ctx.createRadialGradient(
        torch.x, torch.y - 85, 5,
        torch.x, torch.y - 85, 25 + torch.flicker
      );
      fireGradient.addColorStop(0, '#ffff00');
      fireGradient.addColorStop(0.3, '#ff8800');
      fireGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = fireGradient;
      ctx.beginPath();
      ctx.arc(torch.x, torch.y - 85, 20 + torch.flicker, 0, Math.PI * 2);
      ctx.fill();

      // Light glow on floor
      const glowGradient = ctx.createRadialGradient(
        torch.x, torch.y, 0,
        torch.x, torch.y, 150
      );
      glowGradient.addColorStop(0, 'rgba(255, 180, 100, 0.3)');
      glowGradient.addColorStop(1, 'rgba(255, 180, 100, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(torch.x, torch.y, 150, 0, Math.PI * 2);
      ctx.fill();
    });

    // === PERMANENT BLOOD STAINS ===
    bloodStainsRef.current.forEach(stain => {
      const stainGradient = ctx.createRadialGradient(stain.x, stain.y, 0, stain.x, stain.y, stain.size);
      stainGradient.addColorStop(0, 'rgba(60, 0, 0, 0.4)');
      stainGradient.addColorStop(1, 'rgba(60, 0, 0, 0)');
      ctx.fillStyle = stainGradient;
      ctx.beginPath();
      ctx.arc(stain.x, stain.y, stain.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // === ARENA BOUNDARY ===
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
    ctx.shadowBlur = 0;

    // Center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 20);
    ctx.lineTo(canvas.width / 2, canvas.height - 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw blood pools FIRST (under fighters)
    updateParticles(ctx, deltaTime);

    // Draw fighters (alive or dead)
    drawFighter(ctx, state.player, state.enemy, true, state.battleTime);
    drawFighter(ctx, state.enemy, state.player, false, state.battleTime);

    // Draw connection line with distance (only if both alive)
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
    const { x, y, color, hp, maxHp, defendActive, attackCooldown, currentAction, isAlive } = fighter;

    // If dead, draw fallen warrior
    if (!isAlive) {
      ctx.save();
      ctx.translate(x, y + 40);
      ctx.rotate(Math.PI / 2); // Lie down

      // Body (lying down)
      ctx.fillStyle = color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.fillRect(-15, -5, 30, 35);
      ctx.strokeRect(-15, -5, 30, 35);

      // Head
      ctx.beginPath();
      ctx.arc(0, -25, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Helmet ornament
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(0, -35, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyes closed (X marks)
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-10, -30);
      ctx.lineTo(-6, -26);
      ctx.moveTo(-10, -26);
      ctx.lineTo(-6, -30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, -30);
      ctx.lineTo(10, -26);
      ctx.moveTo(6, -26);
      ctx.lineTo(10, -30);
      ctx.stroke();

      // Limbs
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';

      // Arms
      ctx.beginPath();
      ctx.moveTo(-15, 5);
      ctx.lineTo(-25, 15);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(15, 5);
      ctx.lineTo(25, 15);
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(-8, 30);
      ctx.lineTo(-15, 50);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 30);
      ctx.lineTo(15, 50);
      ctx.stroke();

      // Sword dropped nearby
      ctx.save();
      ctx.translate(40, 10);
      ctx.rotate(-0.3);
      const swordGradient = ctx.createLinearGradient(0, 0, 40, 0);
      swordGradient.addColorStop(0, '#c0c0c0');
      swordGradient.addColorStop(0.5, '#ffffff');
      swordGradient.addColorStop(1, '#999999');
      ctx.fillStyle = swordGradient;
      ctx.fillRect(0, -3, 45, 6);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, -3, 45, 6);
      ctx.restore();

      ctx.restore();
      return; // Skip rest of drawing
    }

    // Animation variables (only for living fighters)
    const walkCycle = Math.sin(battleTime * 8) * 8; // Increased amplitude for more visible walking
    const breathe = Math.sin(battleTime * 2) * 2;
    const isAttacking = attackCooldown > 0.5;
    const isMoving = currentAction !== 'idle' && currentAction !== 'defend';

    // Direction to opponent
    const facingRight = opponent && opponent.x > x;
    const dir = facingRight ? 1 : -1;

    // Shadow (larger and more visible)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x, y + 60, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);

    // === LEGS WITH PROPER KNEES (drawn first, behind body) ===
    const leftLegWalk = isMoving ? walkCycle : 0;
    const rightLegWalk = isMoving ? -walkCycle : 0;

    // Left leg (thigh)
    const leftKneeX = -10 + leftLegWalk * 0.5;
    const leftKneeY = 18;
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-8, 10);
    ctx.lineTo(leftKneeX, leftKneeY);
    ctx.stroke();

    // Left leg (shin)
    const leftFootX = -12 + leftLegWalk;
    const leftFootY = 50;
    ctx.beginPath();
    ctx.moveTo(leftKneeX, leftKneeY);
    ctx.lineTo(leftFootX, leftFootY);
    ctx.stroke();

    // Left foot (sandal)
    ctx.fillStyle = '#8b4513';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(leftFootX, leftFootY, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right leg (thigh)
    const rightKneeX = 10 + rightLegWalk * 0.5;
    const rightKneeY = 18;
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(8, 10);
    ctx.lineTo(rightKneeX, rightKneeY);
    ctx.stroke();

    // Right leg (shin)
    const rightFootX = 12 + rightLegWalk;
    const rightFootY = 50;
    ctx.beginPath();
    ctx.moveTo(rightKneeX, rightKneeY);
    ctx.lineTo(rightFootX, rightFootY);
    ctx.stroke();

    // Right foot (sandal)
    ctx.fillStyle = '#8b4513';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(rightFootX, rightFootY, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // === BODY (on top of legs) ===
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;

    // Torso (larger, with armor plates)
    ctx.fillRect(-18, -10 + breathe, 36, 40);
    ctx.strokeRect(-18, -10 + breathe, 36, 40);

    // Armor plates (horizontal lines)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(-18, -5 + breathe + i * 10);
      ctx.lineTo(18, -5 + breathe + i * 10);
      ctx.stroke();
    }

    // === HEAD ===
    ctx.fillStyle = '#f5deb3'; // Skin tone
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -30 + breathe, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // === TRADITIONAL SAMURAI KABUTO HELMET ===
    ctx.fillStyle = color;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;

    // Helmet dome
    ctx.beginPath();
    ctx.arc(0, -35 + breathe, 20, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helmet crest (maedate)
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(0, -55 + breathe);
    ctx.lineTo(-8, -45 + breathe);
    ctx.lineTo(-6, -35 + breathe);
    ctx.lineTo(0, -50 + breathe);
    ctx.lineTo(6, -35 + breathe);
    ctx.lineTo(8, -45 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Helmet side plates (fukikaeshi)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-20, -25 + breathe);
    ctx.lineTo(-25, -15 + breathe);
    ctx.lineTo(-22, -10 + breathe);
    ctx.lineTo(-18, -20 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(20, -25 + breathe);
    ctx.lineTo(25, -15 + breathe);
    ctx.lineTo(22, -10 + breathe);
    ctx.lineTo(18, -20 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Face guard (menpo) - lower face mask
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.moveTo(-12, -22 + breathe);
    ctx.lineTo(-10, -15 + breathe);
    ctx.lineTo(10, -15 + breathe);
    ctx.lineTo(12, -22 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Eyes (visible through helmet)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-7, -28 + breathe, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(7, -28 + breathe, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-7 + dir, -28 + breathe, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7 + dir, -28 + breathe, 2, 0, Math.PI * 2);
    ctx.fill();

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

  // Create blood particles on hit
  const createBloodSplatter = (x, y, count = 15) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        size: Math.random() * 4 + 2,
        life: 1.0,
        gravity: 0.4
      });
    }

    // Create permanent blood stain on the floor
    bloodStainsRef.current.push({
      x: x + (Math.random() - 0.5) * 30,
      y: y + 20 + (Math.random() - 0.5) * 20,
      size: 15 + Math.random() * 10
    });
  };

  // Create sword clash effect
  const createClashEffect = (x, y) => {
    clashEffectsRef.current.push({
      x,
      y,
      life: 0.5,
      size: 30
    });
  };

  // Create blood pool when dead
  const createBloodPool = (x, y) => {
    bloodPoolsRef.current.push({
      x,
      y,
      size: 0,
      maxSize: 60,
      growing: true
    });
  };

  // Update and draw particles
  const updateParticles = (ctx, deltaTime) => {
    // Update particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= deltaTime * 2;

      if (p.life > 0) {
        ctx.fillStyle = `rgba(139, 0, 0, ${p.life})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        return true;
      }
      return false;
    });

    // Update clash effects
    clashEffectsRef.current = clashEffectsRef.current.filter(c => {
      c.life -= deltaTime * 3;
      if (c.life > 0) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${c.life * 2})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
        ctx.stroke();

        // Sparks
        for (let i = 0; i < 4; i++) {
          const angle = (c.life * 10 + i * Math.PI / 2);
          const dist = c.size;
          ctx.fillStyle = `rgba(255, 200, 100, ${c.life * 2})`;
          ctx.beginPath();
          ctx.arc(
            c.x + Math.cos(angle) * dist,
            c.y + Math.sin(angle) * dist,
            3,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        return true;
      }
      return false;
    });

    // Update blood pools
    bloodPoolsRef.current.forEach(pool => {
      if (pool.growing && pool.size < pool.maxSize) {
        pool.size += deltaTime * 50;
        if (pool.size >= pool.maxSize) {
          pool.growing = false;
        }
      }

      // Draw blood pool
      const gradient = ctx.createRadialGradient(pool.x, pool.y, 0, pool.x, pool.y, pool.size);
      gradient.addColorStop(0, 'rgba(100, 0, 0, 0.8)');
      gradient.addColorStop(0.5, 'rgba(80, 0, 0, 0.6)');
      gradient.addColorStop(1, 'rgba(60, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(pool.x, pool.y, pool.size, 0, Math.PI * 2);
      ctx.fill();
    });
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