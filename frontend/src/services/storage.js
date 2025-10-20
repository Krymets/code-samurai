/**
 * LocalStorage Service - Player stats and battle history
 * Standalone version without backend
 */

const STORAGE_KEYS = {
  PLAYER_STATS: 'codeSamurai_playerStats',
  BATTLE_HISTORY: 'codeSamurai_battleHistory',
  SETTINGS: 'codeSamurai_settings'
};

/**
 * Initialize default player stats
 */
const getDefaultStats = () => ({
  totalBattles: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  totalDamageDealt: 0,
  totalDamageTaken: 0,
  totalKills: 0,
  longestWinStreak: 0,
  currentWinStreak: 0,
  defeatedOpponents: {}, // opponentId: count
  favoriteCharacter: null,
  favoriteDeck: null,
  unlockedTitles: ['Beginner'],
  currentTitle: 'Beginner',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  firstPlayDate: new Date().toISOString(),
  lastPlayDate: new Date().toISOString()
});

/**
 * Get player stats from localStorage
 */
export const getPlayerStats = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYER_STATS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading player stats:', error);
  }
  return getDefaultStats();
};

/**
 * Save player stats to localStorage
 */
export const savePlayerStats = (stats) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PLAYER_STATS, JSON.stringify(stats));
    return true;
  } catch (error) {
    console.error('Error saving player stats:', error);
    return false;
  }
};

/**
 * Update stats after battle
 */
export const updateStatsAfterBattle = (battleResult, opponentData) => {
  const stats = getPlayerStats();

  // Update last play date
  stats.lastPlayDate = new Date().toISOString();

  // Battle counts
  stats.totalBattles++;

  if (battleResult.winner === 'player') {
    stats.wins++;
    stats.currentWinStreak++;
    if (stats.currentWinStreak > stats.longestWinStreak) {
      stats.longestWinStreak = stats.currentWinStreak;
    }

    // Track defeated opponents
    const oppId = opponentData.id;
    stats.defeatedOpponents[oppId] = (stats.defeatedOpponents[oppId] || 0) + 1;

    // Award XP
    const xpGained = opponentData.reward.xp;
    stats.xp += xpGained;

    // Check for level up
    while (stats.xp >= stats.xpToNextLevel) {
      stats.xp -= stats.xpToNextLevel;
      stats.level++;
      stats.xpToNextLevel = Math.floor(stats.xpToNextLevel * 1.5);
    }

    // Unlock title
    if (opponentData.reward.title && !stats.unlockedTitles.includes(opponentData.reward.title)) {
      stats.unlockedTitles.push(opponentData.reward.title);
    }

  } else if (battleResult.winner === 'enemy') {
    stats.losses++;
    stats.currentWinStreak = 0;
  } else {
    stats.draws++;
  }

  // Damage stats
  stats.totalDamageDealt += battleResult.player.damageDealt || 0;
  stats.totalDamageTaken += battleResult.player.damageTaken || 0;
  stats.totalKills += battleResult.player.kills || 0;

  savePlayerStats(stats);
  return stats;
};

/**
 * Get battle history
 */
export const getBattleHistory = (limit = 20) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.BATTLE_HISTORY);
    if (stored) {
      const history = JSON.parse(stored);
      return history.slice(-limit); // Get last N battles
    }
  } catch (error) {
    console.error('Error loading battle history:', error);
  }
  return [];
};

/**
 * Add battle to history
 */
export const addBattleToHistory = (battleData) => {
  try {
    let history = getBattleHistory(100); // Keep max 100 battles

    const battleRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...battleData
    };

    history.push(battleRecord);

    // Keep only last 100
    if (history.length > 100) {
      history = history.slice(-100);
    }

    localStorage.setItem(STORAGE_KEYS.BATTLE_HISTORY, JSON.stringify(history));
    return battleRecord;
  } catch (error) {
    console.error('Error saving battle history:', error);
    return null;
  }
};

/**
 * Get settings
 */
export const getSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return {
    soundEnabled: true,
    musicVolume: 0.5,
    sfxVolume: 0.7,
    battleSpeed: 1.0,
    showDamageNumbers: true,
    showActionText: true,
    language: 'en'
  };
};

/**
 * Save settings
 */
export const saveSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
};

/**
 * Reset all data (for testing or starting over)
 */
export const resetAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PLAYER_STATS);
    localStorage.removeItem(STORAGE_KEYS.BATTLE_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    return true;
  } catch (error) {
    console.error('Error resetting data:', error);
    return false;
  }
};

/**
 * Export all data (for backup)
 */
export const exportData = () => {
  return {
    stats: getPlayerStats(),
    history: getBattleHistory(1000),
    settings: getSettings(),
    exportDate: new Date().toISOString()
  };
};

/**
 * Import data (restore from backup)
 */
export const importData = (data) => {
  try {
    if (data.stats) savePlayerStats(data.stats);
    if (data.history) {
      localStorage.setItem(STORAGE_KEYS.BATTLE_HISTORY, JSON.stringify(data.history));
    }
    if (data.settings) saveSettings(data.settings);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

/**
 * Get win rate percentage
 */
export const getWinRate = () => {
  const stats = getPlayerStats();
  if (stats.totalBattles === 0) return 0;
  return Math.round((stats.wins / stats.totalBattles) * 100);
};

/**
 * Get stats summary for display
 */
export const getStatsSummary = () => {
  const stats = getPlayerStats();
  return {
    level: stats.level,
    xp: stats.xp,
    xpToNextLevel: stats.xpToNextLevel,
    xpProgress: (stats.xp / stats.xpToNextLevel) * 100,
    totalBattles: stats.totalBattles,
    winRate: getWinRate(),
    wins: stats.wins,
    losses: stats.losses,
    draws: stats.draws,
    longestWinStreak: stats.longestWinStreak,
    currentWinStreak: stats.currentWinStreak,
    currentTitle: stats.currentTitle,
    unlockedTitles: stats.unlockedTitles
  };
};