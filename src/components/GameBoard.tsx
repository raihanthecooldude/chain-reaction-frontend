import { useCallback } from 'react';
import type { Board, PlayerColor } from '../types';
import { COLOR_GLOW, COLOR_MAP, getCriticalMass } from '../utils/game';
import styles from './GameBoard.module.css';

interface GameBoardProps {
  board: Board;
  rows: number;
  cols: number;
  currentColor: PlayerColor | null;
  isMyTurn: boolean;
  onCellClick: (row: number, col: number) => void;
  explodingCells: Set<string>;
  disabled: boolean;
}

export default function GameBoard({
  board,
  rows,
  cols,
  currentColor,
  isMyTurn,
  onCellClick,
  explodingCells,
  disabled,
}: GameBoardProps) {
  const handleClick = useCallback(
    (row: number, col: number) => {
      if (!isMyTurn || disabled) return;
      const cell = board[row][col];
      // Can only place on empty or own cells
      if (cell.owner && cell.owner !== currentColor) return;
      onCellClick(row, col);
    },
    [isMyTurn, disabled, board, currentColor, onCellClick],
  );

  return (
    <div
      className={styles.boardWrapper}
      style={
        {
          '--cols': cols,
          '--rows': rows,
        } as React.CSSProperties
      }
    >
      <div
        className={styles.board}
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const isExploding = explodingCells.has(key);
            const critical = getCriticalMass(r, c, rows, cols);

            const canPlace =
              isMyTurn && !disabled && (!cell.owner || cell.owner === currentColor);
            const color = cell.owner ? COLOR_MAP[cell.owner] : null;
            const glow = cell.owner ? COLOR_GLOW[cell.owner] : null;

            return (
              <div
                key={key}
                className={`
                  ${styles.cell}
                  ${canPlace ? styles.canPlace : ''}
                  ${isExploding ? styles.exploding : ''}
                `}
                onClick={() => handleClick(r, c)}
                style={
                  color
                    ? ({
                        '--cell-color': color,
                        '--cell-glow': glow,
                      } as React.CSSProperties)
                    : {}
                }
              >
                {cell.atoms > 0 && (
                  <div className={styles.atomContainer} data-atoms={cell.atoms}>
                    {cell.atoms >= 1 && (
                      <div
                        className={`${styles.atom} ${styles.atom1} ${isExploding ? styles.atomExplode : ''}`}
                        style={{ background: color!, boxShadow: `0 0 8px ${color}` }}
                      />
                    )}
                    {cell.atoms >= 2 && (
                      <div
                        className={`${styles.atom} ${styles.atom2} ${isExploding ? styles.atomExplode : ''}`}
                        style={{ background: color!, boxShadow: `0 0 8px ${color}` }}
                      />
                    )}
                    {cell.atoms >= 3 && (
                      <div
                        className={`${styles.atom} ${styles.atom3} ${isExploding ? styles.atomExplode : ''}`}
                        style={{ background: color!, boxShadow: `0 0 8px ${color}` }}
                      />
                    )}
                    {cell.atoms >= 4 && (
                      <div
                        className={`${styles.atom} ${styles.atom4} ${isExploding ? styles.atomExplode : ''}`}
                        style={{ background: color!, boxShadow: `0 0 8px ${color}` }}
                      />
                    )}
                  </div>
                )}

                {/* Critical mass warning indicator */}
                {cell.atoms > 0 && cell.atoms === critical - 1 && (
                  <div className={styles.criticalWarning} style={{ color: color! }}>
                    !
                  </div>
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
