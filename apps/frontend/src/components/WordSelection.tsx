import React, { Component } from 'react'
import { useGameStore } from '../store/useGameStore'
import { socketService } from '../sockets/socketService';

export const WordSelection = () => {
  const status = useGameStore((state)=> state.status);
  const wordOptions = useGameStore((state) => state.wordOptions)
  const playerId = useGameStore((state) => state.playerId)
  const turnOwnerId = useGameStore((state) => state.turnOwnerId)
  const timer = useGameStore((state) => state.timer)

  const isDrawer = playerId === turnOwnerId

  if (status !== 'selecting') return null;


  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 2, 18, 0.85)',
      backdropFilter:'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div className='glass-panel pulse-border' style={{
        maxWidth: '500px',
        width: '90p%',
        textAlign: 'center',
        padding: '2.5rem 2rem',
        boxSizing: 'border-box'
      }}>
        {isDrawer ? 
        (
        <>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', background: 'linear-gradient(135deg, var(--text-primary) 30%, var(--accent-indigo) 100%)',WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Choose a Word to Draw!</h2>

        <p style={{color: 'var(--text-secondary)', marginBottom: '2rem'}}>Select one of the words below. You have <strong style={{color: 'var(--accent-pink)'}}>{timer}s</strong> remaining!</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem'}} >
          { wordOptions.map((word)=>(
            <button
            key={word}
            className='btn-primary'
            onClick={()=> socketService.selectWord(word)}
            style={{
              padding: '1rem',
              fontSize: '1.15rem',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderRadius: '16px'
            }}
            >
              {word} 
            </button>
          ))}
        </div>
        </>
        )
        : 
        (<>
        <h2 style={{ fontSize: '1.5rem',marginBottom: '0.5rem'}}>Word Selection</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>The drawer is currently choosing a word...</p>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px',
          fontSize: '1.15rem',
          color: 'var(--accent-purple)'
        }}>
          <span className='counter' style={{fontSize: '2rem', fontWeight: 800}}>{timer}s</span>
        </div>
        </>)
        }
      </div>
      
    </div>
  )
}


