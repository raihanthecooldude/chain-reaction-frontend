import type { Board, Cell, PlayerColor } from '../types';

export const PLAYER_COLORS: PlayerColor[] = [
  'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'cyan', 'pink', 'lime', 'white'
];

export const COLOR_MAP: Record<PlayerColor, string> = {
  red: '#ff3b3b',
  blue: '#3b8bff',
  green: '#3bff6e',
  yellow: '#ffe03b',
  purple: '#b03bff',
  orange: '#ff8c3b',
  cyan: '#3bffee',
  pink: '#ff3bb8',
  lime: '#b8ff3b',
  white: '#ffffff',
};

export const COLOR_GLOW: Record<PlayerColor, string> = {
  red: 'rgba(255,59,59,0.7)',
  blue: 'rgba(59,139,255,0.7)',
  green: 'rgba(59,255,110,0.7)',
  yellow: 'rgba(255,224,59,0.7)',
  purple: 'rgba(176,59,255,0.7)',
  orange: 'rgba(255,140,59,0.7)',
  cyan: 'rgba(59,255,238,0.7)',
  pink: 'rgba(255,59,184,0.7)',
  lime: 'rgba(184,255,59,0.7)',
  white: 'rgba(255,255,255,0.7)',
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
