# Code Samurai - Frontend

React frontend для Code Samurai.

## 🚀 Quick Start

```bash
# Установить зависимости
npm install

# Запустить dev server
npm run dev

# Собрать для production
npm run build

# Preview production build
npm run preview
```

## 📁 Структура

```
frontend/
├── src/
│   ├── components/      # Reusable компоненты
│   ├── pages/           # Страницы приложения
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── SamuraisPage.jsx
│   │   ├── BattlesPage.jsx
│   │   └── LeaderboardPage.jsx
│   ├── services/        # API services
│   │   └── api.js       # Django API client
│   ├── hooks/           # Custom hooks
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json
```

## 🔗 API Integration

Backend API должен быть запущен на `http://localhost:8000`

Vite proxy настроен автоматически:
- `/api/*` → `http://localhost:8000/api/*`
- `/ws/*` → `ws://localhost:8000/ws/*`

## 🎨 Styling

Используются простые CSS стили без фреймворков.

Цветовая схема:
- Background: `#1a1a2e`
- Card: `#16213e`
- Accent: `#e94560`
- Hover: `#0f3460`

## 📦 Dependencies

- **React 18** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Vite** - Build tool

## 🔧 Configuration

Создать `.env` файл:

```bash
VITE_API_URL=http://localhost:8000/api
```

## 🚀 Deployment

### Build для production

```bash
npm run build
```

Static files будут в `dist/` папке.

### Deploy на Vercel

```bash
npm install -g vercel
vercel
```

### Deploy на Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

## 📝 TODO

- [ ] Deck builder UI
- [ ] Live battle viewer с WebSocket
- [ ] Battle replay player
- [ ] Profile settings
- [ ] Tournament bracket
- [ ] Mobile responsive design
- [ ] Dark/Light theme toggle

---

**Tech Stack:** React + Vite + React Router + Axios