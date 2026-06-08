import { useGameStore } from '../store/gameStore'
import styles from './NoticeToast.module.css'

export default function NoticeToast() {
  const notice = useGameStore((s) => s.notice)
  if (!notice) return null

  return (
    <div className={styles.toast}>
      <span className={styles.icon}>🚪</span>
      {notice}
    </div>
  )
}
