import { useGameStore } from '../store/gameStore'
import styles from './ErrorToast.module.css'

export default function ErrorToast() {
  const error = useGameStore((s) => s.error)
  if (!error) return null

  return (
    <div className={styles.toast}>
      <span className={styles.icon}>⚠</span>
      {error}
    </div>
  )
}
