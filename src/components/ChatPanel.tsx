import { useState, useRef, useEffect } from 'react'
import { useGameStore } from '../store/gameStore'
import { COLOR_MAP } from '../utils/game'
import styles from './ChatPanel.module.css'

interface ChatPanelProps {
  onSend: (message: string) => void
}

export default function ChatPanel({ onSend }: ChatPanelProps) {
  const messages = useGameStore((s) => s.messages)
  const unreadChat = useGameStore((s) => s.unreadChat)
  const markChatViewed = useGameStore((s) => s.markChatViewed)
  const setChatViewing = useGameStore((s) => s.setChatViewing)
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const msg = input.trim()
    if (!msg) return
    onSend(msg)
    setInput('')
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>
          CHAT
          {unreadChat > 0 && (
            <span className={styles.unreadBadge}>{unreadChat > 9 ? '9+' : unreadChat}</span>
          )}
        </span>
      </div>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <p className={styles.empty}>No messages yet...</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={styles.message}>
            <span
              className={styles.author}
              style={{ color: COLOR_MAP[msg.color] }}
            >
              {msg.playerName}
            </span>
            <span className={styles.text}>{msg.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputRow}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={markChatViewed}
          onBlur={() => setChatViewing(false)}
          placeholder="Say something..."
          maxLength={100}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend()
          }}
        />
        <button className={styles.sendBtn} onClick={handleSend}>▶</button>
      </div>
    </div>
  )
}
