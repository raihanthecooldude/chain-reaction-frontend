# ⚛️ Chain Reaction - Frontend

The web client for Chain Reaction - a real-time multiplayer strategy game. It talks to the
Chain Reaction Go WebSocket server (a **separate repository**) over a single persistent
WebSocket connection.

---

## Tech stack

- **React 18** + **TypeScript**
- **Vite 5** - dev server & build
- **Zustand** - state management
- **Framer Motion** - animations
- **React Router** - routing
- **@vercel/analytics** - country / device analytics (production only)

---

## Prerequisites

- **Node.js** 18+
- The **backend** server running (it lives in its own separate repository)

---

## Run

```bash
# Install dependencies
npm install

# (optional) configure the backend URL
cp .env.example .env

# Start the dev server
npm run dev
```

Open **http://localhost:5173**. Start the backend first so the WebSocket can connect.

### Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm run dev`     | Start Vite dev server (port 5173)    |
| `npm run build`   | Type-check (`tsc`) + production build |
| `npm run preview` | Preview the production build locally |

### Environment

| Var           | Default                  | Description                              |
|---------------|--------------------------|------------------------------------------|
| `VITE_WS_URL` | `ws://localhost:8080/ws` | WebSocket URL of the backend             |

The Vite dev server also proxies `/ws` and `/api` to `localhost:8080` (see
[`vite.config.ts`](vite.config.ts)).

---

## Project structure

```
.
├── index.html
├── src/
│   ├── components/        # GameBoard, PlayerPanel, ChatPanel, ErrorToast, NoticeToast
│   ├── hooks/            # useWebSocket - singleton connection + message routing
│   ├── pages/           # HomePage, LobbyPage, GamePage
│   ├── store/           # gameStore (Zustand) - player, room, game, chat, UI state
│   ├── types/           # Shared TypeScript types + WS message types
│   ├── utils/           # Colors, board helpers, constants
│   ├── App.tsx          # Routes + global toasts + analytics
│   └── main.tsx
├── vite.config.ts
└── .env.example
```

### State (Zustand `gameStore`)

| Slice          | Purpose                                            |
|----------------|----------------------------------------------------|
| `localPlayer`  | This user's id / name / color (synced to localStorage) |
| `room`         | Lobby/room state                                   |
| `gameState`    | Live board, turn order, alive status               |
| `messages`     | Chat history                                        |
| `isExploding`  | Cells currently animating an explosion             |
| `isConnected`  | WebSocket status                                    |
| `error`        | Transient error toast                              |
| `notice`       | Transient info toast (e.g. a player forfeited)     |

> `localPlayer` is created **synchronously** on first load (see `initLocalPlayer` in the store)
> so the WebSocket always connects with a real id - never `anon`.

---

## How it connects

- One **singleton WebSocket** is opened on app load ([`hooks/useWebSocket.ts`](src/hooks/useWebSocket.ts))
  with `?playerId=<uuid>`, and auto-reconnects on drop.
- On reconnect, if the user is still in a room, the client re-sends `join_room` to rejoin and
  replay current state.
- The full WebSocket message protocol is documented in the backend repository.

---

## Analytics

[`@vercel/analytics`](https://vercel.com/docs/analytics) is mounted in
[`App.tsx`](src/App.tsx) via `<Analytics />`. It captures **country, device type, OS, and
browser** - no raw IPs stored on our side, cookieless.

- It is **inert in local dev** and only collects data once deployed on Vercel with
  **Web Analytics enabled** (Vercel dashboard → project → Analytics tab).
- Country-level only (no city). For city-level you'd switch to GA4.

---

## Deployment (Vercel)

The frontend deploys cleanly to **Vercel**:

1. Import the repo (the project root is the repository root).
2. Set `VITE_WS_URL` to your deployed backend's WebSocket URL, e.g. `wss://your-backend.fly.dev/ws`.
   (The backend must be hosted somewhere that supports persistent WebSockets - **not** Vercel.)
3. Enable **Web Analytics** in the Vercel dashboard.

Build command: `npm run build` · Output directory: `dist`.
