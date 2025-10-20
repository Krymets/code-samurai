# ⚔️ Code Samurai - Tactical Card Battle Game

> A browser-based tactical game where you program samurai AI using strategic card decks!

**[▶️ Play Now](https://krymets.github.io/code-samurai/)** | **[📖 Deployment Guide](./GITHUB_PAGES_DEPLOYMENT.md)**

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)

## 🎮 Game Overview

Code Samurai is a unique tactical battle game where you:
- **Choose a Samurai** with unique stats (HP, Attack, Defense, Speed)
- **Select a Strategic Deck** with IF-THEN card logic to control your fighter's AI
- **Battle AI Opponents** from Newbie to Boss difficulty
- **Earn XP and Level Up** with persistent progress tracking
- **Unlock Titles** by defeating challenging opponents

All running **100% in your browser** with no backend required!

## ✨ Features

### 🥋 6 Unique Samurais
- **Kenji the Novice** - Balanced fighter
- **Hiroshi the Defender** - High HP tank
- **Akira the Berserker** - Glass cannon
- **Takeshi the Master** - Tactical expert
- **Yuki the Ninja** - Speed demon
- **Ryu the Dragon** - Elite warrior

### 🎴 5 Strategic Decks
Each deck contains 5 condition-action card pairs (IF-DO logic):
- **Aggressive** - All-out attack
- **Defensive** - Survive and counter
- **Tactical** - Smart decisions
- **Berserker** - Pure aggression
- **Control** - Distance management

### 🤖 5 AI Difficulty Levels
- 🟢 **Training Dummy** (Lv.1) - 30% mistake rate
- 🟡 **Veteran Warrior** (Lv.2) - Solid tactics
- 🟠 **Expert Duelist** (Lv.3) - Highly skilled
- 🔴 **Grand Master** (Lv.4) - Near perfect
- 💀 **Shadow Shogun** (Lv.5) - Ultimate boss

### 💾 Progress Tracking
- **Level System** with XP progression
- **Win/Loss Statistics** and win rate
- **Battle History** (last 100 battles)
- **Unlockable Titles** for achievements
- **Data Export/Import** for backups

## 🚀 Quick Start

### Play Online
Visit the live game (once deployed):
```
https://krymets.github.io/code-samurai/
```

### Local Development
```bash
# Clone repository
git clone https://github.com/krymets/code-samurai.git
cd code-samurai/frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

### Build for Production
```bash
cd frontend
npm run build
# Output in dist/ folder
```

## 📦 Deploy to GitHub Pages

### Automatic Deployment

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Deploy game"
   git push origin main
   ```

2. Enable GitHub Pages in repository settings:
   - Settings → Pages → Source: **GitHub Actions**

3. Done! Game will auto-deploy via GitHub Actions

See [GITHUB_PAGES_DEPLOYMENT.md](./GITHUB_PAGES_DEPLOYMENT.md) for detailed instructions.

## 🎯 How It Works

### Card-Based AI System

Each deck has 5 cards with **Condition → Action** logic:

```javascript
IF HP Critical (< 20%)
  → DO Fast Retreat

IF Enemy Close (< 150px)
  → DO Attack Closest

IF Outnumbered
  → DO Defend
```

During battle, the samurai evaluates cards top-to-bottom and executes the first matching condition.

### Battle Engine

Real-time combat simulation with:
- **Movement AI** - Chase, retreat, circle, dash
- **Combat System** - Damage calculation with attack/defense
- **Cooldowns** - Attack speed and special abilities
- **Physics** - Collision, bounds checking
- **Canvas Rendering** - Visual battle representation

## 🏗️ Project Structure

```
code-samurai/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy to GitHub Pages
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── game/
│   │   │       ├── CharacterSelect.jsx
│   │   │       ├── DeckSelect.jsx
│   │   │       ├── OpponentSelect.jsx
│   │   │       ├── BattleArena.jsx    # Canvas battle rendering
│   │   │       ├── BattleResult.jsx
│   │   │       └── StatsPanel.jsx
│   │   ├── data/
│   │   │   └── gameData.js            # All game content
│   │   ├── engine/
│   │   │   └── battleEngine.js        # Battle logic
│   │   ├── services/
│   │   │   └── storage.js             # localStorage management
│   │   ├── pages/
│   │   │   └── GamePage.jsx
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
├── README.md
└── GITHUB_PAGES_DEPLOYMENT.md
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Canvas API** - Battle visualization
- **localStorage** - Data persistence
- **GitHub Actions** - CI/CD pipeline

## 🎮 Game Mechanics

### Combat

- **Damage Formula**: `max(1, Attack - Defense)`
- **Defend Ability**: Reduces damage by 50%
- **Berserk Mode**: +50% damage multiplier
- **Battle Timeout**: 2 minutes (winner by HP %)

### Progression

- **XP System**: Earn XP by winning battles
- **Level Up**: XP requirement increases by 1.5x per level
- **Titles**: Unlock by defeating specific opponents
- **Statistics**: Track wins, losses, streaks, damage

### AI Behavior

Opponents have modifiers affecting:
- **Decision Delay**: Reaction time (0.2s - 1.5s)
- **Mistake Chance**: Probability of wrong decision (0% - 30%)
- **Aggression**: Combat behavior (0.5 - 1.0)

## 📊 Data Storage

All data stored in browser localStorage:
- **`codeSamurai_playerStats`** - Level, XP, win/loss
- **`codeSamurai_battleHistory`** - Recent battles
- **`codeSamurai_settings`** - User preferences

**Note**: Clearing browser data will reset progress!
Use **Export Data** feature to backup.

## 🐛 Troubleshooting

### Game doesn't load on GitHub Pages
- Check `vite.config.js` → `base` matches your repo name
- Example: `/code-samurai/` for repo `code-samurai`

### Build fails
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Progress lost
- Data is in localStorage (browser-specific)
- Use Export/Import in stats panel
- Different browsers = different saves

## 🤝 Contributing

Contributions welcome! Ideas:
- New samurais and decks
- Additional card types
- Tournament mode
- Multiplayer (PvP)
- More AI opponents
- Sound effects & music

## 📝 License

MIT License - Free to use, modify, and distribute!

## 🎉 Credits

Built with ❤️ for open source gaming community

**Author**: Code Samurai Team
**Version**: 2.0.0 (Browser Standalone)

---

⭐ Star this repo if you enjoy the game!
🐛 Report issues: [GitHub Issues](https://github.com/krymets/code-samurai/issues)
🎮 Play now: [Live Demo](https://krymets.github.io/code-samurai/)