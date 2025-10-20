/**
 * Battle Engine - Core game logic ported from Python
 * Handles battle simulation, AI decisions, and combat
 */

import { getCard } from '../data/gameData';

// Battle states
export const BattleState = {
  PREPARING: 'PREPARING',
  FIGHTING: 'FIGHTING',
  FINISHED: 'FINISHED'
};

// Action types
export const ActionType = {
  IDLE: 'idle',
  ATTACK: 'attack',
  DEFEND: 'defend',
  RETREAT: 'retreat',
  DASH: 'dash',
  CIRCLE: 'circle',
  BERSERK: 'berserk'
};

/**
 * Battle Fighter - represents a samurai in battle
 */
export class BattleFighter {
  constructor(samurai, deck, team, aiModifiers = {}) {
    // Identity
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = samurai.name;
    this.team = team; // 'player' or 'enemy'

    // Stats
    this.maxHp = samurai.stats.maxHp;
    this.hp = samurai.stats.maxHp;
    this.attack = samurai.stats.attack;
    this.defense = samurai.stats.defense;
    this.speed = samurai.stats.speed;
    this.attackSpeed = samurai.stats.attackSpeed;

    // Visual
    this.color = samurai.color;
    this.icon = samurai.icon;

    // Position (will be set by arena)
    this.x = 0;
    this.y = 0;

    // State
    this.isAlive = true;
    this.currentAction = ActionType.IDLE;
    this.target = null;
    this.defendActive = false;
    this.defendReduction = 0;

    // Deck and AI
    this.deck = deck;
    this.aiModifiers = {
      decisionDelay: aiModifiers.decisionDelay || 0.5,
      mistakeChance: aiModifiers.mistakeChance || 0,
      aggression: aiModifiers.aggression || 0.7
    };
    this.lastDecisionTime = 0;

    // Combat cooldowns
    this.attackCooldown = 0;
    this.dashCooldown = 0;

    // Stats tracking
    this.damageDealt = 0;
    this.damageTaken = 0;
    this.kills = 0;
  }

  /**
   * Make AI decision based on deck cards
   */
  makeDecision(enemies, allies, currentTime) {
    // Check decision delay
    if (currentTime - this.lastDecisionTime < this.aiModifiers.decisionDelay) {
      return;
    }

    this.lastDecisionTime = currentTime;

    // AI makes mistakes
    if (Math.random() < this.aiModifiers.mistakeChance) {
      // Random action instead of smart one
      const randomActions = [ActionType.IDLE, ActionType.CIRCLE, ActionType.RETREAT];
      this.currentAction = randomActions[Math.floor(Math.random() * randomActions.length)];
      return;
    }

    // Evaluate deck cards (IF-THEN logic)
    for (const cardPair of this.deck.cards) {
      const condCard = getCard(cardPair.conditionId);
      const actCard = getCard(cardPair.actionId);

      if (!condCard || !actCard) continue;

      // Check condition
      const conditionMet = condCard.condition(this, enemies, allies);

      if (conditionMet) {
        // Execute action
        const result = actCard.execute(this, enemies, allies);

        if (typeof result === 'string') {
          this.currentAction = result;
        } else if (result && result.action) {
          this.currentAction = result.action;
          if (result.target) this.target = result.target;
          if (result.reduction) {
            this.defendActive = true;
            this.defendReduction = result.reduction;
          }
          if (result.damageMultiplier) {
            this.damageMultiplier = result.damageMultiplier;
          }
        }

        // Found matching condition, stop checking
        break;
      }
    }
  }

  /**
   * Take damage
   */
  takeDamage(damage) {
    // Apply defense
    let finalDamage = Math.max(1, damage - this.defense);

    // Apply defend reduction
    if (this.defendActive) {
      finalDamage *= (1 - this.defendReduction);
      this.defendActive = false; // Defend is consumed
    }

    this.hp -= finalDamage;
    this.damageTaken += finalDamage;

    if (this.hp <= 0) {
      this.hp = 0;
      this.isAlive = false;
    }

    return finalDamage;
  }

  /**
   * Execute attack on target
   */
  executeAttack(target) {
    if (!target || !target.isAlive) return false;
    if (this.attackCooldown > 0) return false;

    // Calculate damage
    let damage = this.attack;
    if (this.damageMultiplier) {
      damage *= this.damageMultiplier;
      this.damageMultiplier = 1; // Reset after use
    }

    // Apply damage to target
    const actualDamage = target.takeDamage(damage);
    this.damageDealt += actualDamage;

    // Check for kill
    if (!target.isAlive) {
      this.kills++;
    }

    // Set attack cooldown
    this.attackCooldown = 1.0 / this.attackSpeed;

    return true;
  }

  /**
   * Move towards position
   */
  moveTo(targetX, targetY, deltaTime) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) return; // Close enough

    const moveSpeed = this.speed * 150 * deltaTime; // Increased from 60 to 150
    const ratio = Math.min(moveSpeed / distance, 1);

    this.x += dx * ratio;
    this.y += dy * ratio;
  }

  /**
   * Move away from position
   */
  moveAway(targetX, targetY, deltaTime, speedMultiplier = 1.0) {
    const dx = this.x - targetX;
    const dy = this.y - targetY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.1) {
      // Move in random direction
      const angle = Math.random() * Math.PI * 2;
      this.x += Math.cos(angle) * this.speed * speedMultiplier * 150 * deltaTime; // Increased from 60 to 150
      this.y += Math.sin(angle) * this.speed * speedMultiplier * 150 * deltaTime;
      return;
    }

    const moveSpeed = this.speed * speedMultiplier * 150 * deltaTime; // Increased from 60 to 150
    const ratio = moveSpeed / distance;

    this.x += dx * ratio;
    this.y += dy * ratio;
  }

  /**
   * Update cooldowns
   */
  updateCooldowns(deltaTime) {
    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    }
    if (this.dashCooldown > 0) {
      this.dashCooldown = Math.max(0, this.dashCooldown - deltaTime);
    }
  }
}

/**
 * Battle Engine - manages the entire battle
 */
export class BattleEngine {
  constructor(playerSamurai, playerDeck, opponentData, arenaWidth = 800, arenaHeight = 600) {
    this.arenaWidth = arenaWidth;
    this.arenaHeight = arenaHeight;

    // Create fighters
    this.playerFighter = new BattleFighter(
      playerSamurai,
      playerDeck,
      'player'
    );

    this.enemyFighter = new BattleFighter(
      opponentData.samurai,
      opponentData.deck,
      'enemy',
      opponentData.aiModifiers
    );

    // Position fighters
    this.playerFighter.x = arenaWidth * 0.25;
    this.playerFighter.y = arenaHeight * 0.5;

    this.enemyFighter.x = arenaWidth * 0.75;
    this.enemyFighter.y = arenaHeight * 0.5;

    // Battle state
    this.state = BattleState.PREPARING;
    this.winner = null;
    this.battleTime = 0;
    this.maxBattleTime = 120; // 2 minutes max

    // Events for visualization
    this.events = [];
  }

  /**
   * Start the battle
   */
  start() {
    this.state = BattleState.FIGHTING;
    this.addEvent('battle_start', 'Battle begins!');
  }

  /**
   * Update battle state
   */
  update(deltaTime) {
    if (this.state !== BattleState.FIGHTING) return;

    this.battleTime += deltaTime;

    // Check for timeout
    if (this.battleTime >= this.maxBattleTime) {
      this.endBattle('timeout');
      return;
    }

    // Update cooldowns
    this.playerFighter.updateCooldowns(deltaTime);
    this.enemyFighter.updateCooldowns(deltaTime);

    // AI decisions
    if (this.playerFighter.isAlive) {
      this.playerFighter.makeDecision(
        [this.enemyFighter].filter(f => f.isAlive),
        [],
        this.battleTime
      );
    }

    if (this.enemyFighter.isAlive) {
      this.enemyFighter.makeDecision(
        [this.playerFighter].filter(f => f.isAlive),
        [],
        this.battleTime
      );
    }

    // Execute actions
    this.executeActions(deltaTime);

    // Keep fighters in bounds
    this.keepInBounds(this.playerFighter);
    this.keepInBounds(this.enemyFighter);

    // Check for battle end
    if (!this.playerFighter.isAlive || !this.enemyFighter.isAlive) {
      this.endBattle('knockout');
    }
  }

  /**
   * Execute fighter actions
   */
  executeActions(deltaTime) {
    this.executeFighterAction(this.playerFighter, this.enemyFighter, deltaTime);
    this.executeFighterAction(this.enemyFighter, this.playerFighter, deltaTime);
  }

  /**
   * Execute single fighter action
   */
  executeFighterAction(fighter, opponent, deltaTime) {
    if (!fighter.isAlive) return;

    const action = fighter.currentAction;
    const attackRange = 40;

    switch (action) {
      case ActionType.ATTACK:
      case ActionType.BERSERK:
        if (opponent.isAlive) {
          const distance = Math.hypot(opponent.x - fighter.x, opponent.y - fighter.y);
          if (distance <= attackRange) {
            // In range, attack
            if (fighter.executeAttack(opponent)) {
              this.addEvent('attack', `${fighter.name} attacks ${opponent.name}!`);
            }
          } else {
            // Move towards opponent
            fighter.moveTo(opponent.x, opponent.y, deltaTime);
          }
        }
        break;

      case ActionType.RETREAT:
        if (opponent.isAlive) {
          fighter.moveAway(opponent.x, opponent.y, deltaTime, 1.0);
        }
        break;

      case ActionType.DASH:
        if (opponent.isAlive && fighter.dashCooldown === 0) {
          // Quick movement towards enemy
          fighter.moveTo(opponent.x, opponent.y, deltaTime * 3);
          fighter.dashCooldown = 2.0; // 2 second cooldown
        }
        break;

      case ActionType.CIRCLE:
        if (opponent.isAlive) {
          // Circle around opponent
          const dx = fighter.x - opponent.x;
          const dy = fighter.y - opponent.y;
          const distance = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx) + deltaTime * 2; // Rotate
          const targetX = opponent.x + Math.cos(angle) * Math.max(distance, 100);
          const targetY = opponent.y + Math.sin(angle) * Math.max(distance, 100);
          fighter.moveTo(targetX, targetY, deltaTime);
        }
        break;

      case ActionType.DEFEND:
        // Defend is passive, handled in takeDamage
        break;

      case ActionType.IDLE:
      default:
        // Do nothing
        break;
    }
  }

  /**
   * Keep fighter within arena bounds
   */
  keepInBounds(fighter) {
    const margin = 20;
    fighter.x = Math.max(margin, Math.min(this.arenaWidth - margin, fighter.x));
    fighter.y = Math.max(margin, Math.min(this.arenaHeight - margin, fighter.y));
  }

  /**
   * End the battle
   */
  endBattle(reason) {
    this.state = BattleState.FINISHED;

    if (reason === 'knockout') {
      if (this.playerFighter.isAlive) {
        this.winner = 'player';
        this.addEvent('victory', `${this.playerFighter.name} wins!`);
      } else {
        this.winner = 'enemy';
        this.addEvent('defeat', `${this.enemyFighter.name} wins!`);
      }
    } else if (reason === 'timeout') {
      // Winner is whoever has more HP
      const playerHpPercent = this.playerFighter.hp / this.playerFighter.maxHp;
      const enemyHpPercent = this.enemyFighter.hp / this.enemyFighter.maxHp;

      if (playerHpPercent > enemyHpPercent) {
        this.winner = 'player';
        this.addEvent('timeout_victory', 'Time out! You win by HP!');
      } else if (enemyHpPercent > playerHpPercent) {
        this.winner = 'enemy';
        this.addEvent('timeout_defeat', 'Time out! Enemy wins by HP!');
      } else {
        this.winner = 'draw';
        this.addEvent('timeout_draw', 'Time out! It\'s a draw!');
      }
    }
  }

  /**
   * Add event for visualization
   */
  addEvent(type, message) {
    this.events.push({
      type,
      message,
      time: this.battleTime
    });
  }

  /**
   * Get battle result
   */
  getResult() {
    return {
      winner: this.winner,
      battleTime: this.battleTime,
      player: {
        name: this.playerFighter.name,
        hpRemaining: this.playerFighter.hp,
        maxHp: this.playerFighter.maxHp,
        damageDealt: this.playerFighter.damageDealt,
        damageTaken: this.playerFighter.damageTaken,
        kills: this.playerFighter.kills
      },
      enemy: {
        name: this.enemyFighter.name,
        hpRemaining: this.enemyFighter.hp,
        maxHp: this.enemyFighter.maxHp,
        damageDealt: this.enemyFighter.damageDealt,
        damageTaken: this.enemyFighter.damageTaken,
        kills: this.enemyFighter.kills
      },
      events: this.events
    };
  }

  /**
   * Get current battle state for rendering
   */
  getState() {
    return {
      state: this.state,
      battleTime: this.battleTime,
      maxBattleTime: this.maxBattleTime,
      player: {
        x: this.playerFighter.x,
        y: this.playerFighter.y,
        hp: this.playerFighter.hp,
        maxHp: this.playerFighter.maxHp,
        isAlive: this.playerFighter.isAlive,
        currentAction: this.playerFighter.currentAction,
        color: this.playerFighter.color,
        name: this.playerFighter.name,
        icon: this.playerFighter.icon,
        attackCooldown: this.playerFighter.attackCooldown,
        defendActive: this.playerFighter.defendActive
      },
      enemy: {
        x: this.enemyFighter.x,
        y: this.enemyFighter.y,
        hp: this.enemyFighter.hp,
        maxHp: this.enemyFighter.maxHp,
        isAlive: this.enemyFighter.isAlive,
        currentAction: this.enemyFighter.currentAction,
        color: this.enemyFighter.color,
        name: this.enemyFighter.name,
        icon: this.enemyFighter.icon,
        attackCooldown: this.enemyFighter.attackCooldown,
        defendActive: this.enemyFighter.defendActive
      }
    };
  }
}