import { create } from 'zustand';
import type { ChatMessage, GameState, PlayerColor, Room } from '../types';

interface LocalPlayer {
  id: string;
  name: string;
  color: PlayerColor;
}

// Resolve the local player synchronously (before any WebSocket connects),
// so the connection is always stamped with a real player id instead of "anon".
function initLocalPlayer(): LocalPlayer {
  try {
    const stored = localStorage.getItem('cr_player');
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<LocalPlayer>;
      if (parsed.id) {
        return { id: parsed.id, name: parsed.name ?? '', color: parsed.color ?? 'cyan' };
      }
    }
  } catch {
    // ignore corrupt storage and fall through to a fresh player
  }
  const player: LocalPlayer = { id: crypto.randomUUID(), name: '', color: 'cyan' };
  localStorage.setItem('cr_player', JSON.stringify(player));
  return player;
}

interface GameStore {
  // Local player identity
  localPlayer: LocalPlayer;
  setLocalPlayer: (player: LocalPlayer) => void;

  // Room state
  room: Room | null;
  setRoom: (room: Room | null) => void;

  // Game state
  gameState: GameState | null;
  setGameState: (state: GameState | null) => void;

  // UI
  isExploding: Set<string>; // "row,col" keys
  addExplosion: (key: string) => void;
  clearExplosions: () => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;

  // Connection
  isConnected: boolean;
  setConnected: (v: boolean) => void;

  // Error
  error: string | null;
  setError: (e: string | null) => void;

  // Transient info notice (e.g. a player forfeited)
  notice: string | null;
  setNotice: (n: string | null) => void;

  // Matchmaking
  isSearching: boolean;
  setSearching: (v: boolean) => void;

  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  localPlayer: initLocalPlayer(),
  setLocalPlayer: (player) => set({ localPlayer: player }),

  room: null,
  setRoom: (room) => set({ room }),

  gameState: null,
  setGameState: (gameState) => set({ gameState }),

  isExploding: new Set(),
  addExplosion: (key) => set((s) => ({ isExploding: new Set([...s.isExploding, key]) })),
  clearExplosions: () => set({ isExploding: new Set() }),

  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages.slice(-99), msg] })),

  isConnected: false,
  setConnected: (isConnected) => set({ isConnected }),

  error: null,
  setError: (error) => set({ error }),

  notice: null,
  setNotice: (notice) => set({ notice }),

  isSearching: false,
  setSearching: (isSearching) => set({ isSearching }),

  reset: () =>
    set({
      room: null,
      gameState: null,
      isExploding: new Set(),
      messages: [],
      error: null,
      notice: null,
      isSearching: false,
    }),
}));
