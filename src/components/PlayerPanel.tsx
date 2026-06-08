import { motion } from 'framer-motion'
import type { Player, PlayerColor } from '../types'
import { COLOR_MAP } from '../utils/game'
import styles from './PlayerPanel.module.css'

interface PlayerPanelProps {
  players: Player[]
  currentPlayerIndex: number
  localPlayerId: string
  turnCount: number
}

export default function PlayerPanel({
  players,
  currentPlayerIndex,
  localPlayerId,
  turnCount,
}: PlayerPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.turnInfo}>
        <span className={styles.turnLabel}>TURN</span>
        <span className={styles.turnNum}>{turnCount}</span>
      </div>

      <div className={styles.list}>
        {players.map((player, i) => {
          const isActive = i === currentPlayerIndex
          const isMe = player.id === localPlayerId
          const color = COLOR_MAP[player.color]

          return (
            <motion.div
              key={player.id}
              className={`
                ${styles.row}
                ${isActive ? styles.active : ''}
                ${!player.isAlive ? styles.eliminated : ''}
              `}
              style={isActive ? { '--player-color': color } as React.CSSProperties : {}}
              animate={isActive ? { scale: [1, 1.01, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={styles.colorDot}
                style={{
                  background: player.isAlive ? color : '#333',
                  boxShadow: player.isAlive && isActive ? `0 0 14px ${color}` : 'none',
                }}
              />
              <div className={styles.info}>
                <span className={styles.name}>
                  {player.name}
                  {isMe && <span className={styles.youTag}>YOU</span>}
                </span>
                {!player.isAlive && (
                  <span className={styles.dead}>ELIMINATED</span>
                )}
              </div>
              {isActive && player.isAlive && (
                <div className={styles.activePip} style={{ background: color }} />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
