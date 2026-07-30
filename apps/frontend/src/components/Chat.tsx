import React, { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/useGameStore';
import { socketService } from '../sockets/socketService';

export const Chat: React.FC = () => {

  const [inputValue,setInputValue] = useState('');
  const chatMessages = useGameStore((state)=> state.chatMessages);
  const playerId = useGameStore((state)=> state.playerId);
  const turnOwnerId = useGameStore((state)=> state.turnOwnerId);
  const status = useGameStore((state)=> state.status);
  const players = useGameStore((state)=> state.players);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isCurrentDrawer = playerId === turnOwnerId && status !== 'lobby';
  const playerState = players.find(p => p.id === playerId);
  const hasAlreadyGuessed = playerState?.hasGuessed || false;

  useEffect(()=>{
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  },[chatMessages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if(!inputValue.trim()) return;

    // Send guess to server
    socketService.submitGuess(inputValue.trim());
    setInputValue('');
  }

  return (
    <div className='glass-panel chat=panel'>
      <h2 style={{ fontSize: '1.15rem', margin: '0 0 1rem 0', fontWeight: 700}}>Chat & Guesses</h2>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        marginBottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingRight: '4px',
        textAlign: 'left'
      }}>
        {
          chatMessages.map((msg)=> {
            let style: React.CSSProperties = {
              padding: '6px 10px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              wordBreak: 'break-word',
              lineHeight: '1.3',
            }

            if( msg.type === 'system'){
              style= {
                ...style,
                background: 'rgba(139, 92,246, 0.1)',
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                borderLeft: '3px solid var(--accent-purple)'
              };
            } else if (msg.type === 'correct'){
               style= {
                ...style,
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--accent-green)',
                fontStyle: 'bold',
                borderLeft: '3px solid var(--accent-green)'
              };
            } else {
               style= {
                ...style,
                background: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-primary)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              };
            }

            return (
              <div key={msg.id} style={style}>
                {msg.type === 'guess' && (
                  <strong style={{color: 'var(--accent-indigo)', marginRight: '6px'}}>{msg.sender}</strong>
                )}
                {msg.text}
              </div>
            );
          })
        }
        <div ref={messagesEndRef}></div>
      </div>


      {/* Form Input */}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px'}}>
          <input type="text" className='text-input'
          placeholder={
            isCurrentDrawer ? "You are drawing! No cheating." : hasAlreadyGuessed ? "you guessed it! shh..." : status === 'drawing' ? "Type your guess here..." : "Waiting..."
          }
          value={inputValue}
          onChange={(e)=> setInputValue(e.target.value)}
          disabled= {isCurrentDrawer || hasAlreadyGuessed || status !== 'drawing'}
          style={{
            padding: '0.6rem 0.8rem',
            fontSize: '0.9rem',
            opacity: (isCurrentDrawer || hasAlreadyGuessed || status !== 'drawing') ? 0.6 : 1
          }}
          />
          <button type='submit'
          className='btn-primary'
          disabled= {isCurrentDrawer || hasAlreadyGuessed || status !== 'drawing' || !inputValue.trim()}
          style={{padding: '0 1rem', fontSize: '0.85rem'}}
          >Send</button>
        </form>
      
    </div>
  )
}