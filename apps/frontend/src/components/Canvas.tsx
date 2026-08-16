import React, { useEffect, useRef, useState } from 'react'
import { useGameStore, type StrokeData, type StrokePoint } from '../store/useGameStore';
import { socketService } from '../sockets/socketService';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor,setBrushColor] = useState('#0f172a');
  const [brushWidth, setbrushWidth] = useState(4);
  const [currentStrokePoints, setcurrentStrokePoints] = useState<StrokePoint[]>([]);

  const canvasStrokes = useGameStore((state) => state.canvasStrokes)
  const playerId = useGameStore((state)=> state.playerId);
  const turnOwnerId = useGameStore((state)=> state.turnOwnerId);
  const status = useGameStore((state)=> state.status);

  const isDrawer = playerId === turnOwnerId && status === "drawing";

  // Available colors
  const colors = [
    '#0f172a', // Dark Slate
    '#4f46e5', // Indigo
    '#ec4899', // Pink
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow/Orange
    '#ef4444', // Red
    '#ffffff', // White (Eraser)
  ];

  // Initialize Canvas context
  useEffect(()=> {
    const canvas = canvasRef.current;
    if(!canvas) return;

    // Fixed internal resolution
    canvas.height = 600;
    canvas.width = 1000;

    const context = canvas.getContext('2d');
    if(!context) return;

    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    redrawCanvas();
  },[])

  // Redraw when strokes array changes (it will use when we use sync or update)

  useEffect(()=>{
    redrawCanvas();
  },[canvasStrokes])

  const redrawCanvas=()=> {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if(!canvas || !ctx) return;

    // clear canvas
    ctx.clearRect(0,0, canvas.width, canvas.height);

    // Render all Strokes
    canvasStrokes.forEach((stroke)=> {
      if(stroke.isFill){
        ctx.fillStyle = stroke.color;
        ctx.fillRect(0,0, canvas.width, canvas.height);
        return
      }

      if(stroke.points.length === 0) return;

      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;

      const [first,...rest] = stroke.points;
      ctx.moveTo(first.x, first.y);

      rest.forEach((pt) => {
        ctx.lineTo(pt.x,pt.y);
      })

      ctx.stroke();
      ctx.closePath();
    }) 
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>): StrokePoint => {
    const canvas = canvasRef.current;
    if(!canvas) return {x: 0, y: 0};

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX- rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    }
  }

  const getCanvasTouchCoords = (e: React.TouchEvent<HTMLCanvasElement>): StrokePoint => {
    const canvas = canvasRef.current;
    if(!canvas || e.touches.length === 0 ) return {x: 0, y: 0};

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (touch.clientX- rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    }
  }

  const startDrawing =  (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;

    const coords = getCanvasCoords(e);
    
    setIsDrawing(true);
    setcurrentStrokePoints([coords]);

    const ctx = contextRef.current;
    if(ctx) {
      ctx.beginPath();
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushWidth;
      ctx.moveTo(coords.x,coords.y);
    }
  }

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    e.preventDefault();

    const coords = getCanvasTouchCoords(e);

    setIsDrawing(true);
    setcurrentStrokePoints([coords]);

    const ctx = contextRef.current;
    if(ctx) {
      ctx.beginPath();
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushWidth;
      ctx.moveTo(coords.x,coords.y);
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer) return;

    const coords = getCanvasCoords(e);
    setcurrentStrokePoints((prev) => [...prev,coords]);

    const ctx = contextRef.current;
    if(ctx){
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  }

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer) return;
    e.preventDefault()

    const coords = getCanvasTouchCoords(e);
    setcurrentStrokePoints((prev) => [...prev,coords]);

    const ctx = contextRef.current;
    if(ctx){
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  }

  const stopDrawing = () => {
    if (!isDrawing || !isDrawer) return;

    setIsDrawing(false);

    if(currentStrokePoints.length > 0){
      const newStroke: StrokeData = {
        points: currentStrokePoints,
        color: brushColor,
        width: brushWidth,
        isDrawing: false
      }

      // Emit stroke to server
      socketService.draw(newStroke);
      // add stroke to local zustabd store
      useGameStore.getState().addStroke(newStroke)
    }

    setcurrentStrokePoints([]);
    contextRef.current?.closePath();
  }

  const stopDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    e.preventDefault();
    stopDrawing();
  };

  const handleFill = () => {
    if(!isDrawer) return;
    const fillStroke: StrokeData = {
      points: [],
      color: brushColor,
      width: 0,
      isDrawing: false,
      isFill: true,
    };
    socketService.fillCanvas(brushColor);
    useGameStore.getState().addStroke(fillStroke);
  }

  const handleClear = () => {
    if(!isDrawer) return;
    socketService.clearCanvas();
  }

  const handleUndo = () => {
    if (!isDrawer) return;
    socketService.undoStroke();
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%'}}>
      {/* { Canvas Frame} */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '16px',
        overflow: 'hidden',
        position: 'relative',
        aspectRatio: '8/5',
        width: '100%',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <canvas 
        ref = {canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawingTouch}
        onTouchMove={drawTouch}
        onTouchEnd={stopDrawingTouch}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          cursor: isDrawer ? 'crosshair' : 'default',
          touchAction: 'none'
        }}
        ></canvas>

        {!isDrawer && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(5, 2, 18, 0.65)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.8)',
            borderRadius: '12px',
            padding: '4px 10px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            view only
          </div>
        )}

        </div>
        {/* Toolbar */}
        {isDrawer && (
          <div className='canvas-toolbar animate-slide-up'>
            {/* Colors Selection */}
            <div>
              {colors.map((c)=> (
                <button key={c}
                onClick={()=> setBrushColor(c)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: c,
                  border: brushColor === c ? "2px solid #0f172a" :'1px solid black', // for now will change later
                  cursor: 'pointer',
                  transform: brushColor === c ? 'scale(1.15)': 'none',
                  transition: 'all 0.15 ease',
                  boxShadow: brushColor === c ? '0 0 8px' + c : 'none'
                }}
                title = {c === "#ffffff" ? 'Eraser': 'Color brush'}
                ></button>
              ))}
            </div>

            <div className='canvas-controls'>
              {/* width selection */}
              <div style={{display: 'flex',alignItems:'center',gap: '8px'}}>
                <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Size:</span>
                {[2,4,8,16].map((w)=> (
                  <button
                  key={w}
                  onClick={()=> setbrushWidth(w)}
                  className='btn-secondary'
                  style={{
                    width: '32px',
                    height: '32px',
                    padding: 0,
                    fontSize: '0.8rem',
                    borderRadius: '8px',
                    background: brushWidth === w ? 'var(--accent-indigo)': 'rgba(0,0,0,0,0.03)',
                    borderColor: brushWidth === w ? 'var(--accent-indigo)': 'rgba(0,0,0,0,0.1)',
                    color: brushWidth === w ? '#ffffff' : 'var(--text-secondary)'
                    
                  }}
                  >{w}</button>
                ))}
              </div>

              {/* Actions: Fill,Undo, clear */}
              <div style={{display: 'flex', gap: '8px'}}>
                <button
                onClick={handleFill}
                className='btn-secondary'
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem'
                }}
                title='Fill Entire Canvas with current color'
                >Fill Screen</button>

                <button
                onClick={handleUndo}
                className='btn-secondary'
                disabled= {canvasStrokes.length === 0}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem'
                }}
                title='undo last stroke'
                >Undo</button>

                <button
                onClick={handleClear}
                className='btn-secondary'
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.85rem',
                  color: 'var(--accent-red)',
                  borderColor: 'rgba(239, 68, 68, 0.2)'
                }}
                >Clear</button>
              </div>
            </div>
          </div>
        )
        }
    </div>
  )
}
