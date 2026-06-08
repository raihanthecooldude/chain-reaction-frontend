import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useWebSocket } from '../hooks/useWebSocket'
import GameBoard from '../components/GameBoard'
import PlayerPanel from '../components/PlayerPanel'
import ChatPanel from '../components/ChatPanel'
import { COLOR_MAP } from '../utils/game'
import styles from './GamePage.module.css'

export default function GamePage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { gameState, localPlayer, isExploding } = useGameStore()
  const { send } = useWebSocket()
  const [showWinner, setShowWinner] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (!localPlayer || !gameState) return
    if (gameState.status === 'waiting') {
      navigate(`/lobby/${roomCode}`)
    }
    if (gameState.status === 'finished') {
      setShowWinner(true)
    }
  }, [gameState?.status])

  if (!gameState || !localPlayer) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading game...</p>
      </div>
    )
  }

  const myPlayer = gameState.players.find((p) => p.id === localPlayer.id)
  const currentPlayer = gameState.players[gameState.currentPlayerIndex]
  const isMyTurn = currentPlayer?.id === localPlayer.id && gameState.status === 'playing'

  const handleCellClick = (row: number, col: number) => {
    if (!isMyTurn) return
    send('make_move', { roomCode, playerId: localPlayer.id, row, col })
  }

  const handleChat = (message: string) => {
    send('chat_message', {
      roomCode,
      playerId: localPlayer.id,
      playerName: localPlayer.name,
      message,
    })
  }

  const handleLeave = () => {
    send('leave_room', { playerId: localPlayer.id, roomCode })
    navigate('/')
  }

  const currentColor = currentPlayer?.isAlive ? currentPlayer.color : null
  const currentColorHex = currentColor ? COLOR_MAP[currentColor] : 'var(--accent)'

  return (
    <div className={styles.page}>
      {/* Winner overlay */}
      <AnimatePresence>
        {showWinner && gameState.winner && (
          <motion.div
            className={styles.winnerOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.winnerCard}
              initial={{ scale: 0.7, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.4 }}
              style={{
                '--winner-color': COLOR_MAP[gameState.winner.color],
              } as React.CSSProperties}
            >
              <div className={styles.winnerGlow} />
              <div className={styles.winnerAtom}>
                <div className={styles.winnerCore}
                  style={{ background: COLOR_MAP[gameState.winner.color] }}
                />
              </div>
              <p className={styles.winnerLabel}>CHAIN REACTION COMPLETE</p>
              <h2 className={styles.winnerName}
                style={{ color: COLOR_MAP[gameState.winner.color] }}
              >
                {gameState.winner.id === localPlayer.id
                  ? 'YOU WIN!'
                  : `${gameState.winner.name} WINS!`}
              </h2>
              <div className={styles.winnerActions}>
                <button
                  className={styles.winnerBtn}
                  onClick={handleLeave}
                >
                  BACK TO HOME
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.roomInfo}>
          <span className={styles.roomLabel}>ROOM</span>
          <span className={styles.roomCode}>{roomCode}</span>
        </div>

        {/* Turn indicator */}
        <motion.div
          className={styles.turnBanner}
          style={{ '--turn-color': currentColorHex } as React.CSSProperties}
          key={gameState.currentPlayerIndex}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            className={styles.turnDot}
            style={{ background: currentColorHex, boxShadow: `0 0 12px ${currentColorHex}` }}
          />
          <span className={styles.turnText}>
            {isMyTurn
              ? 'YOUR TURN'
              : `${currentPlayer?.name}'s TURN`}
          </span>
        </motion.div>

        <button className={styles.leaveBtn} onClick={handleLeave}>
          ✕
        </button>
      </div>

      {/* Main layout */}
      <div className={styles.main}>
        {/* Left: player list (mobile: horizontal strip above board) */}
        <div className={styles.sidebar}>
          <PlayerPanel
            players={gameState.players}
            currentPlayerIndex={gameState.currentPlayerIndex}
            localPlayerId={localPlayer.id}
          />
          {/* Desktop: inline below players. Mobile: slide-up drawer. */}
          <div className={`${styles.chatHolder} ${chatOpen ? styles.chatOpen : ''}`}>
            <ChatPanel onSend={handleChat} />
          </div>
        </div>

        {/* Center: board */}
        <div className={styles.boardArea}>
          <GameBoard
            board={gameState.board}
            rows={gameState.rows}
            cols={gameState.cols}
            currentColor={myPlayer?.color || null}
            isMyTurn={isMyTurn}
            onCellClick={handleCellClick}
            explodingCells={isExploding}
            disabled={gameState.status !== 'playing'}
          />

          {isMyTurn && (
            <motion.div
              className={styles.yourTurnHint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: currentColorHex }}
            >
              Click any empty or your own cell to place an atom
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile-only: toggle chat drawer */}
      <button
        className={styles.chatFab}
        onClick={() => setChatOpen((o) => !o)}
        aria-label={chatOpen ? 'Close chat' : 'Open chat'}
      >
        {chatOpen ? '✕' : '💬'}
      </button>
    </div>
  )
}
