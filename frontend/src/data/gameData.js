/**
 * Game Data - Samurais, Cards, Decks, Opponents
 * All game content for standalone GitHub Pages version
 */

// Card Types
export const CardType = {
  CONDITION: 'CONDITION',
  ACTION: 'ACTION'
};

// All available cards
export const CARDS = [
  // CONDITION CARDS (IF)
  {
    id: 'cond_hp_low',
    name: 'HP Low',
    type: CardType.CONDITION,
    description: 'If HP < 40%',
    condition: (samurai) => samurai.hp / samurai.maxHp < 0.4,
    icon: '💔'
  },
  {
    id: 'cond_hp_critical',
    name: 'HP Critical',
    type: CardType.CONDITION,
    description: 'If HP < 20%',
    condition: (samurai) => samurai.hp / samurai.maxHp < 0.2,
    icon: '☠️'
  },
  {
    id: 'cond_hp_healthy',
    name: 'HP Healthy',
    type: CardType.CONDITION,
    description: 'If HP > 70%',
    condition: (samurai) => samurai.hp / samurai.maxHp > 0.7,
    icon: '💚'
  },
  {
    id: 'cond_enemy_close',
    name: 'Enemy Close',
    type: CardType.CONDITION,
    description: 'If enemy distance < 150',
    condition: (samurai, enemies) => {
      if (!enemies || enemies.length === 0) return false;
      const closest = enemies.reduce((min, e) => {
        const dist = Math.hypot(e.x - samurai.x, e.y - samurai.y);
        return dist < min ? dist : min;
      }, Infinity);
      return closest < 150;
    },
    icon: '⚔️'
  },
  {
    id: 'cond_enemy_far',
    name: 'Enemy Far',
    type: CardType.CONDITION,
    description: 'If enemy distance > 300',
    condition: (samurai, enemies) => {
      if (!enemies || enemies.length === 0) return false;
      const closest = enemies.reduce((min, e) => {
        const dist = Math.hypot(e.x - samurai.x, e.y - samurai.y);
        return dist < min ? dist : min;
      }, Infinity);
      return closest > 300;
    },
    icon: '🏃'
  },
  {
    id: 'cond_outnumbered',
    name: 'Outnumbered',
    type: CardType.CONDITION,
    description: 'If enemies > allies',
    condition: (samurai, enemies, allies) => {
      return enemies.length > allies.length;
    },
    icon: '😰'
  },
  {
    id: 'cond_advantage',
    name: 'Advantage',
    type: CardType.CONDITION,
    description: 'If allies > enemies',
    condition: (samurai, enemies, allies) => {
      return allies.length > enemies.length;
    },
    icon: '💪'
  },
  {
    id: 'cond_alone',
    name: 'Alone',
    type: CardType.CONDITION,
    description: 'If no allies nearby',
    condition: (samurai, enemies, allies) => {
      return allies.length === 0;
    },
    icon: '🗿'
  },

  // ACTION CARDS (DO)
  {
    id: 'act_attack_closest',
    name: 'Attack Closest',
    type: CardType.ACTION,
    description: 'Attack nearest enemy',
    execute: (samurai, enemies) => {
      if (!enemies || enemies.length === 0) return 'idle';
      const target = enemies.reduce((closest, e) => {
        const dist = Math.hypot(e.x - samurai.x, e.y - samurai.y);
        const closestDist = Math.hypot(closest.x - samurai.x, closest.y - samurai.y);
        return dist < closestDist ? e : closest;
      });
      return { action: 'attack', target };
    },
    icon: '⚔️'
  },
  {
    id: 'act_attack_weakest',
    name: 'Attack Weakest',
    type: CardType.ACTION,
    description: 'Attack enemy with lowest HP',
    execute: (samurai, enemies) => {
      if (!enemies || enemies.length === 0) return 'idle';
      const target = enemies.reduce((weakest, e) =>
        e.hp < weakest.hp ? e : weakest
      );
      return { action: 'attack', target };
    },
    icon: '🎯'
  },
  {
    id: 'act_attack_strongest',
    name: 'Attack Strongest',
    type: CardType.ACTION,
    description: 'Attack enemy with highest HP',
    execute: (samurai, enemies) => {
      if (!enemies || enemies.length === 0) return 'idle';
      const target = enemies.reduce((strongest, e) =>
        e.hp > strongest.hp ? e : strongest
      );
      return { action: 'attack', target };
    },
    icon: '💀'
  },
  {
    id: 'act_retreat',
    name: 'Retreat',
    type: CardType.ACTION,
    description: 'Move away from enemies',
    execute: (samurai, enemies) => {
      return { action: 'retreat', speed: 1.0 };
    },
    icon: '🏃'
  },
  {
    id: 'act_fast_retreat',
    name: 'Fast Retreat',
    type: CardType.ACTION,
    description: 'Quickly move away',
    execute: (samurai, enemies) => {
      return { action: 'retreat', speed: 2.0 };
    },
    icon: '💨'
  },
  {
    id: 'act_defend',
    name: 'Defend',
    type: CardType.ACTION,
    description: 'Block incoming damage (50%)',
    execute: (samurai) => {
      return { action: 'defend', reduction: 0.5 };
    },
    icon: '🛡️'
  },
  {
    id: 'act_dash',
    name: 'Dash',
    type: CardType.ACTION,
    description: 'Quick dash to closest enemy',
    execute: (samurai, enemies) => {
      if (!enemies || enemies.length === 0) return 'idle';
      const target = enemies.reduce((closest, e) => {
        const dist = Math.hypot(e.x - samurai.x, e.y - samurai.y);
        const closestDist = Math.hypot(closest.x - samurai.x, closest.y - samurai.y);
        return dist < closestDist ? e : closest;
      });
      return { action: 'dash', target };
    },
    icon: '⚡'
  },
  {
    id: 'act_circle',
    name: 'Circle',
    type: CardType.ACTION,
    description: 'Circle around enemy',
    execute: (samurai, enemies) => {
      return { action: 'circle' };
    },
    icon: '🔄'
  },
  {
    id: 'act_berserk',
    name: 'Berserk',
    type: CardType.ACTION,
    description: 'Aggressive attack (x1.5 damage)',
    execute: (samurai, enemies) => {
      if (!enemies || enemies.length === 0) return 'idle';
      const target = enemies.reduce((closest, e) => {
        const dist = Math.hypot(e.x - samurai.x, e.y - samurai.y);
        const closestDist = Math.hypot(closest.x - samurai.x, closest.y - samurai.y);
        return dist < closestDist ? e : closest;
      });
      return { action: 'berserk', target, damageMultiplier: 1.5 };
    },
    icon: '😡'
  },
  {
    id: 'act_wait',
    name: 'Wait',
    type: CardType.ACTION,
    description: 'Do nothing, observe',
    execute: () => {
      return { action: 'idle' };
    },
    icon: '⏸️'
  }
];

// Pre-built decks
export const DECKS = [
  {
    id: 'deck_aggressive',
    name: 'Aggressive',
    description: 'All-out attack strategy',
    icon: '⚔️',
    color: '#ff4444',
    cards: [
      { conditionId: 'cond_enemy_close', actionId: 'act_berserk' },
      { conditionId: 'cond_enemy_far', actionId: 'act_dash' },
      { conditionId: 'cond_hp_healthy', actionId: 'act_attack_closest' },
      { conditionId: 'cond_hp_low', actionId: 'act_attack_weakest' },
      { conditionId: 'cond_advantage', actionId: 'act_attack_strongest' }
    ]
  },
  {
    id: 'deck_defensive',
    name: 'Defensive',
    description: 'Survive and counter-attack',
    icon: '🛡️',
    color: '#4444ff',
    cards: [
      { conditionId: 'cond_hp_critical', actionId: 'act_fast_retreat' },
      { conditionId: 'cond_hp_low', actionId: 'act_defend' },
      { conditionId: 'cond_enemy_close', actionId: 'act_defend' },
      { conditionId: 'cond_outnumbered', actionId: 'act_retreat' },
      { conditionId: 'cond_hp_healthy', actionId: 'act_attack_closest' }
    ]
  },
  {
    id: 'deck_tactical',
    name: 'Tactical',
    description: 'Smart decision making',
    icon: '🧠',
    color: '#44ff44',
    cards: [
      { conditionId: 'cond_hp_critical', actionId: 'act_fast_retreat' },
      { conditionId: 'cond_outnumbered', actionId: 'act_attack_weakest' },
      { conditionId: 'cond_advantage', actionId: 'act_attack_strongest' },
      { conditionId: 'cond_enemy_far', actionId: 'act_dash' },
      { conditionId: 'cond_enemy_close', actionId: 'act_attack_closest' }
    ]
  },
  {
    id: 'deck_berserker',
    name: 'Berserker',
    description: 'Pure aggression, no defense',
    icon: '😡',
    color: '#ff8800',
    cards: [
      { conditionId: 'cond_hp_healthy', actionId: 'act_berserk' },
      { conditionId: 'cond_hp_low', actionId: 'act_berserk' },
      { conditionId: 'cond_hp_critical', actionId: 'act_berserk' },
      { conditionId: 'cond_enemy_far', actionId: 'act_dash' },
      { conditionId: 'cond_enemy_close', actionId: 'act_berserk' }
    ]
  },
  {
    id: 'deck_control',
    name: 'Control',
    description: 'Maintain distance and control',
    icon: '🎯',
    color: '#ff44ff',
    cards: [
      { conditionId: 'cond_enemy_close', actionId: 'act_retreat' },
      { conditionId: 'cond_enemy_far', actionId: 'act_attack_weakest' },
      { conditionId: 'cond_hp_low', actionId: 'act_circle' },
      { conditionId: 'cond_outnumbered', actionId: 'act_retreat' },
      { conditionId: 'cond_advantage', actionId: 'act_attack_closest' }
    ]
  }
];

// Pre-built samurais
export const SAMURAIS = [
  {
    id: 'samurai_kenji',
    name: 'Kenji the Novice',
    title: 'Beginner Samurai',
    description: 'Balanced fighter, good for learning',
    icon: '🗡️',
    color: '#88ccff',
    stats: {
      maxHp: 100,
      attack: 15,
      defense: 10,
      speed: 1.0,
      attackSpeed: 1.0
    }
  },
  {
    id: 'samurai_hiroshi',
    name: 'Hiroshi the Defender',
    title: 'Tank Warrior',
    description: 'High HP and defense, slow attacks',
    icon: '🛡️',
    color: '#4466ff',
    stats: {
      maxHp: 150,
      attack: 12,
      defense: 18,
      speed: 0.8,
      attackSpeed: 0.7
    }
  },
  {
    id: 'samurai_akira',
    name: 'Akira the Berserker',
    title: 'Glass Cannon',
    description: 'Devastating attacks, low HP',
    icon: '😡',
    color: '#ff4444',
    stats: {
      maxHp: 80,
      attack: 25,
      defense: 5,
      speed: 1.2,
      attackSpeed: 1.3
    }
  },
  {
    id: 'samurai_takeshi',
    name: 'Takeshi the Master',
    title: 'Tactical Expert',
    description: 'Balanced stats, high skill',
    icon: '⚔️',
    color: '#ffaa00',
    stats: {
      maxHp: 120,
      attack: 18,
      defense: 15,
      speed: 1.1,
      attackSpeed: 1.0
    }
  },
  {
    id: 'samurai_yuki',
    name: 'Yuki the Ninja',
    title: 'Speed Demon',
    description: 'Fast and agile, medium damage',
    icon: '🥷',
    color: '#9944ff',
    stats: {
      maxHp: 90,
      attack: 16,
      defense: 8,
      speed: 1.5,
      attackSpeed: 1.4
    }
  },
  {
    id: 'samurai_ryu',
    name: 'Ryu the Dragon',
    title: 'Elite Warrior',
    description: 'High damage and HP, slow movement',
    icon: '🐉',
    color: '#ff0000',
    stats: {
      maxHp: 140,
      attack: 22,
      defense: 12,
      speed: 0.9,
      attackSpeed: 0.9
    }
  }
];

// AI Opponents with different difficulty levels
export const OPPONENTS = [
  {
    id: 'opp_newbie',
    name: 'Training Dummy',
    difficulty: 'Newbie',
    level: 1,
    icon: '🎯',
    color: '#88ff88',
    description: 'Perfect for practice',
    samurai: SAMURAIS[0], // Kenji
    deck: DECKS[0], // Aggressive (but will make mistakes)
    aiModifiers: {
      decisionDelay: 1.5, // Slow reactions
      mistakeChance: 0.3, // 30% chance of wrong decision
      aggression: 0.5
    },
    reward: {
      xp: 10,
      title: 'Rookie Fighter'
    }
  },
  {
    id: 'opp_veteran',
    name: 'Veteran Warrior',
    difficulty: 'Veteran',
    level: 2,
    icon: '⚔️',
    color: '#ffaa44',
    description: 'Experienced fighter with solid tactics',
    samurai: SAMURAIS[3], // Takeshi
    deck: DECKS[2], // Tactical
    aiModifiers: {
      decisionDelay: 0.8,
      mistakeChance: 0.1,
      aggression: 0.7
    },
    reward: {
      xp: 25,
      title: 'Worthy Opponent'
    }
  },
  {
    id: 'opp_expert',
    name: 'Expert Duelist',
    difficulty: 'Expert',
    level: 3,
    icon: '🔥',
    color: '#ff6644',
    description: 'Highly skilled and aggressive',
    samurai: SAMURAIS[2], // Akira
    deck: DECKS[3], // Berserker
    aiModifiers: {
      decisionDelay: 0.5,
      mistakeChance: 0.05,
      aggression: 0.9
    },
    reward: {
      xp: 50,
      title: 'Battle Hardened'
    }
  },
  {
    id: 'opp_master',
    name: 'Grand Master',
    difficulty: 'Master',
    level: 4,
    icon: '👑',
    color: '#ffaa00',
    description: 'Nearly perfect execution',
    samurai: SAMURAIS[5], // Ryu
    deck: DECKS[2], // Tactical (perfect execution)
    aiModifiers: {
      decisionDelay: 0.3,
      mistakeChance: 0.02,
      aggression: 0.8
    },
    reward: {
      xp: 100,
      title: 'Elite Warrior'
    }
  },
  {
    id: 'opp_boss',
    name: 'Shadow Shogun',
    difficulty: 'BOSS',
    level: 5,
    icon: '💀',
    color: '#aa00ff',
    description: 'The ultimate challenge',
    samurai: {
      ...SAMURAIS[5],
      name: 'Shadow Shogun',
      stats: {
        maxHp: 200,
        attack: 30,
        defense: 20,
        speed: 1.3,
        attackSpeed: 1.2
      }
    },
    deck: DECKS[2], // Tactical (godlike)
    aiModifiers: {
      decisionDelay: 0.2,
      mistakeChance: 0,
      aggression: 1.0
    },
    reward: {
      xp: 250,
      title: 'Legend Slayer'
    }
  }
];

// Get card by ID
export const getCard = (cardId) => {
  return CARDS.find(c => c.id === cardId);
};

// Get deck by ID
export const getDeck = (deckId) => {
  return DECKS.find(d => d.id === deckId);
};

// Get samurai by ID
export const getSamurai = (samuraiId) => {
  return SAMURAIS.find(s => s.id === samuraiId);
};

// Get opponent by ID
export const getOpponent = (opponentId) => {
  return OPPONENTS.find(o => o.id === opponentId);
};