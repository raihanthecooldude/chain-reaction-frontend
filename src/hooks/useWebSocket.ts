import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import type { ChatPayload, GameState, Room, WSMessage, WSMessageType } from '../types';

// --- Singleton WebSocket instance ---
let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let pingTimer: ReturnType<typeof setInterval> | null = null;
let initialized = false;

function getWsUrl(): string {
  const base = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8080/ws`;
  const playerId = useGameStore.getState().localPlayer?.id || 'anon';
  return `${base}?playerId=${playerId}`;
}

function handleMessage(msg: WSMessage) {
  const store = useGameStore.getState();
  switch (msg.type) {
    case 'room_update': {
      const payload = msg.payload as { room: Room };
      store.setRoom(payload.room);
      break;
    }
    case 'game_state': {
      const payload = msg.payload as { game: GameState };
      const prev = store.gameState;
      if (prev && payload.game.board) {
        store.clearExplosions();
        payload.game.board.forEach((row, r) => {
          row.forEach((cell, c) => {
            const prevCell = prev.board[r]?.[c];
            if (prevCell && cell.atoms < prevCell.atoms && prevCell.atoms > 0) {
              store.addExplosion(`${r},${c}`);
              setTimeout(() => useGameStore.getState().clearExplosions(), 600);
            }
          });
        });
      }
      store.setGameState(payload.game);
      break;
    }
    case 'chat_message': {
      const payload = msg.payload as ChatPayload;
      const players = store.gameState?.players || store.room?.players || [];
      const player = players.find((p) => p.id === payload.playerId);
      store.addMessage({ ...payload, color: player?.color || 'white' });
      break;
    }
    case 'error': {
      const payload = msg.payload as { message: string };
      store.setError(payload.message);
      setTimeout(() => useGameStore.getState().setError(null), 4000);
      break;
    }
    case 'player_left': {
      const payload = msg.payload as { playerName: string };
      const who = payload.playerName || 'A player';
      store.setNotice(`${who} has left the game. Their progress has been removed.`);
      setTimeout(() => useGameStore.getState().setNotice(null), 5000);
      break;
    }
    case 'pong':
      break;
    default:
      console.log('[WS] Unhandled message:', msg.type);
  }
}

export function connect() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)
  ) {
    console.log('[WS] Already connected/connecting, skipping');
    return;
  }
  const url = getWsUrl();
  console.log('[WS] Connecting to', url);
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('[WS] Connected!');
    const store = useGameStore.getState();
    store.setConnected(true);
    store.setError(null);
    if (pingTimer) clearInterval(pingTimer);
    pingTimer = setInterval(() => send('ping', {}), 25000);

    // If we were in a room/game (e.g. this is a reconnect after a dropped socket),
    // rejoin it so the server cancels any pending forfeit and replays current state.
    const roomCode = store.room?.code || store.gameState?.roomCode;
    if (roomCode && store.localPlayer.name) {
      send('join_room', {
        playerId: store.localPlayer.id,
        playerName: store.localPlayer.name,
        playerColor: store.localPlayer.color,
        roomCode,
      });
    }
  };

  socket.onclose = (e) => {
    console.log('[WS] Disconnected:', e.code, e.reason);
    useGameStore.getState().setConnected(false);
    if (pingTimer) clearInterval(pingTimer);
    socket = null;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(connect, 3000);
  };

  socket.onerror = (e) => {
    console.error('[WS] Error:', e);
    useGameStore
      .getState()
      .setError('Cannot connect to server. Is the backend running on port 8080?');
  };

  socket.onmessage = (event) => {
    try {
      const msg: WSMessage = JSON.parse(event.data);
      console.log('[WS] Received:', msg.type, msg.payload);
      handleMessage(msg);
    } catch {
      console.error('[WS] Failed to parse:', event.data);
    }
  };
}

export function send(type: WSMessageType, payload: unknown = {}) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn('[WS] Cannot send — socket state:', socket?.readyState ?? 'null');
    return;
  }
  const msg = JSON.stringify({ type, payload });
  console.log('[WS] Sending:', type, payload);
  socket.send(msg);
}

export function useWebSocket() {
  useEffect(() => {
    if (!initialized) {
      initialized = true;
      connect();
    }
  }, []);
  return { send };
}
