import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { useWebSocket } from '../hooks/useWebSocket'
import { PLAYER_COLORS, COLOR_MAP, formatPlayerName } from '../utils/game'
import type { PlayerColor } from '../types'
import styles from './HomePage.module.css'

type Mode = 'home' | 'create' | 'join' | 'searching'

export default function HomePage() {
  const navigate = useNavigate()
  const { localPlayer, setLocalPlayer, room, setRoom, isSearching, setSearching, reset } = useGameStore()
  const { send } = useWebSocket()
  const [mode, setMode] = useState<Mode>('home')
  const [name, setName] = useState(localPlayer?.name || '')
  const [roomCode, setRoomCode] = useState('')
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [nameError, setNameError] = useState('')

  useEffect(() => {
    reset()
  }, [])

  // Navigate to lobby when room is created/joined
  useEffect(() => {
    if (room && mode !== 'home') {
      navigate(`/lobby/${room.code}`)
    }
  }, [room])

  const saveName = () => {
    const formatted = formatPlayerName(name)
    if (!formatted) {
      setNameError('Enter a name to continue')
      return false
    }
    setNameError('')
    const updated = { ...localPlayer!, name: formatted }
    setLocalPlayer(updated)
    localStorage.setItem('cr_player', JSON.stringify(updated))
    return true
  }

  const selectColor = (color: PlayerColor) => {
    const updated = { ...localPlayer!, color }
    setLocalPlayer(updated)
    localStorage.setItem('cr_player', JSON.stringify(updated))
  }

  const handleCreateRoom = () => {
    if (!saveName()) return
    send('create_room', {
      playerId: localPlayer!.id,
      playerName: formatPlayerName(name),
      playerColor: localPlayer!.color,
      maxPlayers,
      isPrivate: true,
    })
  }

  const handleJoinRoom = () => {
    if (!saveName()) return
    const code = roomCode.trim().toUpperCase()
    if (code.length < 4) {
      setNameError('Enter a valid room code')
      return
    }
    send('join_room', {
      playerId: localPlayer!.id,
      playerName: formatPlayerName(name),
      playerColor: localPlayer!.color,
      roomCode: code,
    })
  }

  const handleFindMatch = () => {
    if (!saveName()) return
    setMode('searching')
    setSearching(true)
    send('find_match', {
      playerId: localPlayer!.id,
      playerName: formatPlayerName(name),
      playerColor: localPlayer!.color,
    })
  }

  const cancelSearch = () => {
    setMode('home')
    setSearching(false)
    send('cancel_match', { playerId: localPlayer!.id })
  }

  return (
    <div className={styles.page}>
      {/* Ambient orbs */}
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <div className={styles.container}>
        {/* Logo */}
        <motion.div
          className={styles.logo}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className={styles.logoIcon}>
            <AtomLogo />
          </div>
          <h1 className={styles.title}>CHAIN<br />REACTION</h1>
          <p className={styles.subtitle}>MULTIPLAYER · STRATEGY · DOMINATION</p>
        </motion.div>

        {/* Cards */}
        <AnimatePresence mode="wait">
          {mode === 'home' && (
            <motion.div
              key="home"
              className={styles.card}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              {/* Player setup */}
              <div className={styles.playerSetup}>
                <label className={styles.label}>CALLSIGN</label>
                <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError('') }}
                  placeholder="Enter your name..."
                  maxLength={16}
                  onKeyDown={(e) => e.key === 'Enter' && saveName()}
                />
                {nameError && <p className={styles.error}>{nameError}</p>}

                <label className={styles.label}>COLOR</label>
                <div className={styles.colorGrid}>
                  {PLAYER_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`${styles.colorBtn} ${localPlayer?.color === c ? styles.colorSelected : ''}`}
                      style={{
                        background: COLOR_MAP[c],
                        boxShadow: localPlayer?.color === c ? `0 0 16px ${COLOR_MAP[c]}` : 'none',
                      }}
                      onClick={() => selectColor(c)}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.actions}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setMode('create')}>
                  <span className={styles.btnIcon}>⬡</span>
                  CREATE ROOM
                </button>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setMode('join')}>
                  <span className={styles.btnIcon}>⌘</span>
                  JOIN WITH CODE
                </button>
                {/* FIND MATCH disabled for now
                <button className={`${styles.btn} ${styles.btnAccent}`} onClick={handleFindMatch}>
                  <span className={styles.btnIcon}>◈</span>
                  FIND MATCH
                </button>
                */}
              </div>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.div
              key="create"
              className={styles.card}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              <button className={styles.back} onClick={() => setMode('home')}>← BACK</button>
              <h2 className={styles.cardTitle}>CREATE ROOM</h2>

              <div className={styles.field}>
                <label className={styles.label}>YOUR NAME</label>
                <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError('') }}
                  placeholder="Enter your name..."
                  maxLength={16}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>MAX PLAYERS: {maxPlayers}</label>
                <div className={styles.sliderRow}>
                  {[2,3,4,5,6,8].map((n) => (
                    <button
                      key={n}
                      className={`${styles.numBtn} ${maxPlayers === n ? styles.numSelected : ''}`}
                      onClick={() => setMaxPlayers(n)}
                    >{n}</button>
                  ))}
                </div>
              </div>

              {nameError && <p className={styles.error}>{nameError}</p>}

              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCreateRoom}>
                CREATE & INVITE FRIENDS
              </button>
            </motion.div>
          )}

          {mode === 'join' && (
            <motion.div
              key="join"
              className={styles.card}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.25 }}
            >
              <button className={styles.back} onClick={() => setMode('home')}>← BACK</button>
              <h2 className={styles.cardTitle}>JOIN ROOM</h2>

              <div className={styles.field}>
                <label className={styles.label}>YOUR NAME</label>
                <input
                  className={styles.input}
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError('') }}
                  placeholder="Enter your name..."
                  maxLength={16}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>COLOR</label>
                <div className={styles.colorGrid}>
                  {PLAYER_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`${styles.colorBtn} ${localPlayer?.color === c ? styles.colorSelected : ''}`}
                      style={{
                        background: COLOR_MAP[c],
                        boxShadow: localPlayer?.color === c ? `0 0 16px ${COLOR_MAP[c]}` : 'none',
                      }}
                      onClick={() => selectColor(c)}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>ROOM CODE</label>
                <input
                  className={`${styles.input} ${styles.codeInput}`}
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  maxLength={8}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                />
              </div>

              {nameError && <p className={styles.error}>{nameError}</p>}

              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleJoinRoom}>
                JOIN ROOM
              </button>
            </motion.div>
          )}

          {mode === 'searching' && (
            <motion.div
              key="searching"
              className={styles.card}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.searchingState}>
                <div className={styles.radarRing} />
                <div className={styles.radarRing2} />
                <div className={styles.radarDot} />
                <p className={styles.searchingText}>SCANNING FOR OPPONENTS</p>
                <p className={styles.searchingSubtext}>Finding a match for you...</p>
                <button className={`${styles.btn} ${styles.btnDanger}`} onClick={cancelSearch}>
                  CANCEL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function AtomLogo() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="6" fill="#00c8ff" opacity="0.9" />
      <ellipse cx="30" cy="30" rx="24" ry="10" stroke="#00c8ff" strokeWidth="1.5" opacity="0.5" />
      <ellipse cx="30" cy="30" rx="24" ry="10" stroke="#00c8ff" strokeWidth="1.5" opacity="0.5"
        transform="rotate(60 30 30)" />
      <ellipse cx="30" cy="30" rx="24" ry="10" stroke="#00c8ff" strokeWidth="1.5" opacity="0.5"
        transform="rotate(120 30 30)" />
      <circle cx="54" cy="30" r="3" fill="#ff3b8b" />
      <circle cx="18" cy="8" r="3" fill="#b03bff" />
      <circle cx="18" cy="52" r="3" fill="#00c8ff" />
    </svg>
  )
}
