import React from 'react';
import { useGameStore } from '../store/useGameStore';
import type { Player } from '../store/useGameStore';

export const ScoreBoard: React.FC = () => {
  const players = useGameStore((state) => state.players);
  const turnOwnerId = useGameStore((state) => state.turnOwnerId);
  const status = useGameStore((state) => state.status);

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="glass-panel scoreboard-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>Players</h2>
        <span style={{
          background: 'rgba(139, 92, 246, 0.15)',
          color: 'var(--accent-purple)',
          padding: '2px 8px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 700
        }}>
          {players.length} in room
        </span>
      </div>

      <div className="scoreboard-list">
        {sortedPlayers.map((player: Player, index: number) => {
          const isCurrentDrawer = player.id === turnOwnerId && status !== 'lobby';
          const hasGuessedWord = player.hasGuessed;

          let borderStyle = '1px solid rgba(255, 255, 255, 0.05)';
          let bgStyle = 'rgba(255, 255, 255, 0.02)';

          if (isCurrentDrawer) {
            borderStyle = '1px solid rgba(99, 102, 241, 0.5)';
            bgStyle = 'rgba(99, 102, 241, 0.08)';
          } else if (hasGuessedWord) {
            borderStyle = '1px solid rgba(16, 185, 129, 0.5)';
            bgStyle = 'rgba(16, 185, 129, 0.08)';
          }

          return (
            <div
              key={player.id}
              className="scoreboard-item"
              style={{
                background: bgStyle,
                border: borderStyle,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  color: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--text-muted)',
                  width: '18px'
                }}>
                  #{index + 1}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    color: player.hasGuessed ? 'var(--accent-green)' : 'var(--text-primary)'
                  }}>
                    {player.name}
                    {player.isHost && (
                      <span title="Host" style={{ marginLeft: '4px', fontSize: '0.75rem' }}>👑</span>
                    )}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {isCurrentDrawer ? '🎨 Drawing' : hasGuessedWord ? '✓ Guessed' : 'Waiting...'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {player.score}
                </span>
                {player.scoreAddedThisTurn > 0 && (
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--accent-green)',
                    animation: 'slideInUp 0.3s forwards'
                  }}>
                    +{player.scoreAddedThisTurn}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {players.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
            No players connected
          </div>
        )}
      </div>
    </div>
  );
};
