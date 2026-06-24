import type { Board, Cell, PlayerColor } from '../types';

export const PLAYER_COLORS: PlayerColor[] = [
  'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink', 'lime', 'white'
];

// Vivid, saturated player colors — these carry the board's energy. Tuned to stay
// readable on BOTH the dark and light themes (yellow/lime are amber-leaning so
// they don't wash out on white).
export const COLOR_MAP: Record<PlayerColor, string> = {
  red: '#ff3b4e',
  blue: '#2f7dff',
  green: '#18c964',
  yellow: '#ffb800',
  purple: '#9b5cff',
  orange: '#ff7a18',
  cyan: '#00c2d6',
  pink: '#ff3d97',
  lime: '#86d80f',
  white: '#9aa4b2',
};

// Soft color glows for atoms/active cells — a bit of pop without going neon.
export const COLOR_GLOW: Record<PlayerColor, string> = {
  red: 'rgba(255,59,78,0.5)',
  blue: 'rgba(47,125,255,0.5)',
  green: 'rgba(24,201,100,0.5)',
  yellow: 'rgba(255,184,0,0.5)',
  purple: 'rgba(155,92,255,0.5)',
  orange: 'rgba(255,122,24,0.5)',
  cyan: 'rgba(0,194,214,0.5)',
  pink: 'rgba(255,61,151,0.5)',
  lime: 'rgba(134,216,15,0.5)',
  white: 'rgba(154,164,178,0.5)',
};

export function createEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, (): Cell => ({ atoms: 0, owner: null }))
  );
}

export function getCriticalMass(row: number, col: number, rows: number, cols: number): number {
  const isCorner =
    (row === 0 || row === rows - 1) && (col === 0 || col === cols - 1);
  const isEdge =
    row === 0 || row === rows - 1 || col === 0 || col === cols - 1;
  if (isCorner) return 2;
  if (isEdge) return 3;
  return 4;
}

export function getBoardDimensions(playerCount: number): { rows: number; cols: number } {
  if (playerCount <= 2) return { rows: 6, cols: 9 };
  if (playerCount <= 4) return { rows: 8, cols: 11 };
  if (playerCount <= 6) return { rows: 9, cols: 12 };
  return { rows: 10, cols: 14 };
}

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function formatPlayerName(name: string): string {
  return name.trim().substring(0, 16) || 'Anonymous';
}
