export type PlayerColor =
  | 'red'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'purple'
  | 'orange'
  | 'cyan'
  | 'pink'
  | 'lime'
  | 'white';

export interface Cell {
  atoms: number;
  owner: PlayerColor | null | '';
}

export type Board = Cell[][];

export interface Player {
  id: string;
  name: string;
  color: PlayerColor;
  isAlive: boolean;
  isReady: boolean;
}

export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameState {
  board: Board;
  players: Player[];
  currentPlayerIndex: number;
  status: GameStatus;
  winner: Player | null;
  roomCode: string;
  rows: number;
  cols: number;
  turnCount: number;
}

export interface Room {
  code: string;
  hostId: string;
  players: Player[];
  maxPlayers: number;
  status: GameStatus;
  isPrivate: boolean;
}

// WebSocket message types
export type WSMessageType =
  | 'create_room'
  | 'join_room'
  | 'find_match'
  | 'cancel_match'
  | 'leave_room'
  | 'change_color'
  | 'player_ready'
  | 'start_game'
  | 'make_move'
  | 'game_state'
  | 'room_update'
  | 'error'
  | 'player_joined'
  | 'player_left'
  | 'game_over'
  | 'player_left'
  | 'chat_message'
  | 'ping'
  | 'pong';

export interface WSMessage {
  type: WSMessageType;
  payload: unknown;
}

export interface MakeMovePayload {
  row: number;
  col: number;
}

export interface GameStatePayload {
  game: GameState;
}

export interface RoomUpdatePayload {
  room: Room;
}

export interface ErrorPayload {
  message: string;
}

export interface ChatPayload {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  color: PlayerColor;
}
