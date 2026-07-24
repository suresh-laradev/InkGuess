import { useGameStore } from '../store/useGameStore'
import { Chat } from './Chat'
import { WordSelection } from './WordSelection'
import { Canvas } from './Canvas'
import { ScoreBoard } from './ScoreBoard'
import { socketService } from '../sockets/socketService'

export const GameBoard: React.FC = () => {
    
    const roomCode = useGameStore((state)=> state.roomCode )
    const players = useGameStore((state)=> state.players )
    const playerId = useGameStore((state)=> state.playerId )
    const round = useGameStore((state)=> state.round )
    const maxRounds = useGameStore((state)=> state.maxRounds )
    const timer = useGameStore((state)=> state.timer )
    const hint = useGameStore((state)=> state.hint)
    const status = useGameStore((state)=> state.status)
    const currentWord = useGameStore((state)=> state.currentWord)
    const turnOwnerId = useGameStore((state)=> state.turnOwnerId)

    const localPlayer = players.find((p)=> p.id === playerId);
    const isHost = localPlayer?.isHost || false;
    const isDrawer = playerId === turnOwnerId && status !== 'lobby';
    const drawerPlayer = players.find((p)=> p.id == turnOwnerId);

    // Start game action
    const handleStartGame = () => {
        socketService.startGame();
    }

    // Copy room code
    const handleCopyCode = () => {
        if(roomCode){
            navigator.clipboard.writeText(roomCode);
            alert('Room code copied to clipboard!');
        }
    }

    // handle Rematch
    const handleRematch = () => {
        socketService.requestRematch();
    }
    
    // Lobby Phase Layout
    if (status === 'lobby') {
    return (
      <div className="glass-panel animate-slide-up" style={{ maxWidth: '640px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <h1 className="logo" style={{ fontSize: '2.5rem' }}>Game Lobby</h1>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(139, 92, 246, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
          padding: '8px 16px',
          borderRadius: '16px',
          margin: '1.5rem 0',
          cursor: 'pointer'
        }} onClick={handleCopyCode}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ROOM CODE</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '2px' }}>{roomCode}</span>
          <span style={{ fontSize: '0.9rem' }}>📋</span>
        </div>

        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Connected Players ({players.length})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', justifyContent: 'center' }}>
            {players.map((p) => (
              <div key={p.id} style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                padding: '12px 8px',
                borderRadius: '12px',
                fontWeight: 600,
                color: p.id === playerId ? 'var(--accent-indigo)' : 'var(--text-primary)',
                position: 'relative'
              }}>
                {p.name}
                {p.isHost && <span style={{ position: 'absolute', top: '-6px', right: '-4px', fontSize: '0.9rem' }}>👑</span>}
              </div>
            ))}
          </div>
        </div>

        <div>
          {isHost ? (
            <button
              className="btn-primary"
              onClick={handleStartGame}
              disabled={players.length < 1} // For dev testing, we allow starting with 1
              style={{ padding: '1rem 2.5rem', fontSize: '1.15rem' }}
            >
              Start Match
            </button>
          ) : (
            <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              Waiting for the host to start the match...
            </p>
          )}
        </div>
      </div>
    );
  }

    // Game Over Phase Layout
    if (status === 'game-over') {
    const standings = [...players].sort((a, b) => b.score - a.score);
    const gold = standings[0];
    const silver = standings[1];
    const bronze = standings[2];

    return (
      <div className="glass-panel animate-slide-up" style={{ maxWidth: '640px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
        <h1 className="logo" style={{ fontSize: '3rem', margin: '1rem 0' }}>🏆 Leaderboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Match completed successfully after {maxRounds} rounds!</p>

        {/* Podiums */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: '12px',
          height: '220px',
          marginBottom: '2.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          {/* Silver - 2nd place */}
          {silver && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{silver.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>{silver.score} pts</div>
              <div style={{
                width: '80px',
                height: '100px',
                background: 'linear-gradient(0deg, rgba(192, 192, 192, 0.4) 0%, rgba(192, 192, 192, 0.1) 100%)',
                border: '1px solid rgba(192, 192, 192, 0.3)',
                borderBottom: 'none',
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'silver'
              }}>2</div>
            </div>
          )}

          {/* Gold - 1st place */}
          {gold && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>👑</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{gold.name}</div>
              <div style={{ color: 'var(--accent-purple)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 700 }}>{gold.score} pts</div>
              <div style={{
                width: '90px',
                height: '140px',
                background: 'linear-gradient(0deg, rgba(255, 215, 0, 0.4) 0%, rgba(255, 215, 0, 0.1) 100%)',
                border: '1px solid rgba(255, 215, 0, 0.5)',
                borderBottom: 'none',
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 800,
                color: 'gold',
                boxShadow: '0 0 15px rgba(255, 215, 0, 0.2)'
              }}>1</div>
            </div>
          )}

          {/* Bronze - 3rd place */}
          {bronze && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{bronze.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px' }}>{bronze.score} pts</div>
              <div style={{
                width: '80px',
                height: '70px',
                background: 'linear-gradient(0deg, rgba(205, 127, 50, 0.4) 0%, rgba(205, 127, 50, 0.1) 100%)',
                border: '1px solid rgba(205, 127, 50, 0.3)',
                borderBottom: 'none',
                borderRadius: '8px 8px 0 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#cd7f32'
              }}>3</div>
            </div>
          )}
        </div>

        {/* Other players list */}
        {standings.length > 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '2.5rem', textAlign: 'left', maxWidth: '320px', margin: '0 auto 2.5rem auto' }}>
            {standings.slice(3).map((p, idx) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                <span>{idx + 4}. {p.name}</span>
                <span style={{ fontWeight: 600 }}>{p.score} pts</span>
              </div>
            ))}
          </div>
        )}

        <div>
          {isHost ? (
            <button className="btn-primary" onClick={handleRematch} style={{ padding: '0.85rem 2rem' }}>
              Play Again / Rematch
            </button>
          ) : (
            <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
              Waiting for host to start a rematch...
            </p>
          )}
        </div>
      </div>
    );
  }

    // Active Gameplay Layout
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: "1.5rem",
            width: "100%",
            maxWidth: "1200px"
        }}>
            {/* Game Header */}
            <div className='glass-panel game-header'>
                {/* Left: Round & Info */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    textAlign: 'left'
                }}>
                    <span style={{
                        fontSize: '0.8rem',
                        color: 'var(--acent-purple)',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Round {round} of {maxRounds}
                    </span>
                    <span style={{fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)'}}>
                        {status === 'selecting' && 'word Selection'}
                        {status === 'round-end' && 'Round Complete'}
                        {status === 'drawing' && (
                            <>
                            Drawer : <strong style={{ color: 'var(--accent-indigo)'}}> {drawerPlayer?.name} </strong>
                            </>
                        )}
                    </span>
                </div>

                {/* Center: Hints / word */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    {status === 'drawing' && (
                        <>
                        {
                            isDrawer ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span style={{fontSize: '0.75rem',color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Word to Draw</span>
                                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-pink)',textTransform: 'uppercase', letterSpacing : '2px' }}>{currentWord}</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase'}}>Guess the Word:</span>
                                    <span style={{fontSize: '1.75rem',fontWeight: 800, color: 'var(--text-secondary)',textTransform: 'uppercase', letterSpacing: '4px' , fontFamily: 'monospace' }} >{hint}</span>
                                </div>
                            )
                        }
                        </>
                    )}

                    {status === 'round-end' && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 700 }}>WORD REVEALED</span>
                            <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '2px' }}>
                                {currentWord}
                            </span>
                        </div>
                    )}
                </div>

                {/* Right: Timer */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Time Left</span>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: timer <= 10 ? 'var(--accent-pink)' : 'var(--text-primary)'
                        }}>
                        ⏱ {timer}s
                    </div>
                </div>
            </div>

            {/* Main Board Sections */}
            <div className='game-layout'>
                {/* Left Column - Scores */}
                <ScoreBoard/>

                {/* Middle Column - Canvas */}
                <div style={{flex:1,display: 'flex',flexDirection: 'column'}} >
                    <Canvas/>
                </div>

                {/* Right Column - Chat */}
                <Chat/>
            </div>

            {/* Word Option Popup (Overlay) */}
            <WordSelection/>
        </div>
    )
}
