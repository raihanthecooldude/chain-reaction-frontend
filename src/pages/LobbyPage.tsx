import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { send, useWebSocket } from '../hooks/useWebSocket';
import { useGameStore } from '../store/gameStore';
import type { PlayerColor } from '../types';
import { COLOR_MAP, PLAYER_COLORS } from '../utils/game';
import styles from './LobbyPage.module.css';

export default function LobbyPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { room, gameState, localPlayer, setLocalPlayer } = useGameStore();
  const [copied, setCopied] = useState(false);
  useWebSocket();

  useEffect(() => {
    if (gameState?.status === 'playing') {
      navigate(`/game/${roomCode}`);
    }
  }, [gameState]);

  useEffect(() => {
    if (!localPlayer?.name && !room) {
      navigate('/');
    }
  }, []);

  const isHost = room?.hostId === localPlayer?.id;
  const myPlayer = room?.players.find((p) => p.id === localPlayer?.id);
  const canStart = isHost && (room?.players.length ?? 0) >= 2;
  const takenColors =
    room?.players.filter((p) => p.id !== localPlayer?.id).map((p) => p.color) ?? [];

  const handleStart = () => {
    send('start_game', { roomCode });
  };

  const handleLeave = () => {
    send('leave_room', { playerId: localPlayer?.id, roomCode });
    navigate('/');
  };

  const handleColorChange = (color: PlayerColor) => {
    if (takenColors.includes(color)) return;
    const updated = { ...localPlayer!, color };
    setLocalPlayer(updated);
    localStorage.setItem('cr_player', JSON.stringify(updated));
    // Re-join with new color (leave and rejoin)
    send('change_color', { playerId: localPlayer?.id, roomCode, color });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!room) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Connecting to room...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <div className={styles.container}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className={styles.title}>LOBBY</h1>
            <p className={styles.subtitle}>Waiting for players...</p>
          </div>
          <button className={styles.leaveBtn} onClick={handleLeave}>
            ✕ LEAVE
          </button>
        </motion.div>

        {/* Room code */}
        <motion.div
          className={styles.codeCard}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className={styles.codeLabel}>ROOM CODE</span>
          <button className={styles.codeValue} onClick={copyCode} title='Click to copy'>
            {roomCode}
            <span className={`${styles.copyHint} ${copied ? styles.copiedHint : ''}`}>
              {copied ? '✓ COPIED' : 'COPY'}
            </span>
          </button>
          <p className={styles.codeHint}>Share this code with friends to invite them</p>
        </motion.div>

        {/* Players */}
        <motion.div
          className={styles.playersCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className={styles.playersHeader}>
            <span className={styles.sectionLabel}>PLAYERS</span>
            <span className={styles.playerCount}>
              {room.players.length}/{room.maxPlayers}
            </span>
          </div>

          <div className={styles.playersList}>
            <AnimatePresence>
              {room.players.map((player, i) => (
                <motion.div
                  key={player.id}
                  className={styles.playerRow}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    className={styles.playerColor}
                    style={{
                      background: COLOR_MAP[player.color],
                      boxShadow: `0 0 12px ${COLOR_MAP[player.color]}66`,
                    }}
                  >
                    <AtomIcon color={COLOR_MAP[player.color]} />
                  </div>
                  <div className={styles.playerInfo}>
                    <span className={styles.playerName}>
                      {player.name}
                      {player.id === localPlayer?.id && (
                        <span className={styles.youTag}>YOU</span>
                      )}
                      {player.id === room.hostId && (
                        <span className={styles.hostTag}>HOST</span>
                      )}
                    </span>
                  </div>
                </motion.div>
              ))}

              {Array.from({ length: room.maxPlayers - room.players.length }).map(
                (_, i) => (
                  <div key={`empty-${i}`} className={styles.emptySlot}>
                    <div className={styles.emptyDot} />
                    <span>Waiting for player...</span>
                  </div>
                ),
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Color picker (changeable until the game starts) */}
        {myPlayer && (
          <motion.div
            className={styles.colorCard}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className={styles.sectionLabel}>YOUR COLOR</span>
            <div className={styles.colorGrid}>
              {PLAYER_COLORS.map((c) => {
                const isTaken = takenColors.includes(c);
                const isMine = localPlayer?.color === c;
                return (
                  <button
                    key={c}
                    className={`${styles.colorBtn} ${isMine ? styles.colorSelected : ''} ${isTaken ? styles.colorTaken : ''}`}
                    style={{
                      background: COLOR_MAP[c],
                      boxShadow: isMine ? `0 0 16px ${COLOR_MAP[c]}` : 'none',
                      opacity: isTaken ? 0.25 : 1,
                    }}
                    onClick={() => handleColorChange(c)}
                    disabled={isTaken}
                    title={isTaken ? 'Already taken' : c}
                  />
                );
              })}
            </div>
            {takenColors.includes(localPlayer?.color as PlayerColor) && (
              <p className={styles.colorWarning}>
                ⚠ Your color is taken! Pick another before the game starts.
              </p>
            )}
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className={styles.actions}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          {!isHost && myPlayer && (
            <div className={styles.waitingNote}>Waiting for the host to start the game…</div>
          )}
          {isHost && (
            <button
              className={`${styles.btn} ${styles.btnStart} ${!canStart ? styles.btnDisabled : ''}`}
              onClick={handleStart}
              disabled={!canStart}
            >
              {room.players.length < 2 ? 'WAITING FOR PLAYERS...' : '▶ START GAME'}
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function AtomIcon({ color }: { color: string }) {
  return (
    <svg width='22' height='22' viewBox='0 0 22 22' fill='none'>
      <circle cx='11' cy='11' r='3' fill={color} />
      <ellipse
        cx='11'
        cy='11'
        rx='9'
        ry='4'
        stroke={color}
        strokeWidth='1'
        opacity='0.6'
      />
      <ellipse
        cx='11'
        cy='11'
        rx='9'
        ry='4'
        stroke={color}
        strokeWidth='1'
        opacity='0.6'
        transform='rotate(60 11 11)'
      />
      <ellipse
        cx='11'
        cy='11'
        rx='9'
        ry='4'
        stroke={color}
        strokeWidth='1'
        opacity='0.6'
        transform='rotate(120 11 11)'
      />
    </svg>
  );
}
