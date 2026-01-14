import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaRedo, FaClock } from 'react-icons/fa';

export function FocusTimer() {
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(5);
  const [dragStart, setDragStart] = useState(null);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            clearInterval(interval);
            // Opcional: Tocar um som aqui
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(editValue);
    setSeconds(0);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditValue(minutes);
    setDragStart(null);
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };

  const handleEditSave = () => {
    setIsEditing(false);
    const newMin = parseInt(editValue) || 5;
    setMinutes(Math.max(1, Math.min(99, newMin)));
    setSeconds(0);
    setIsActive(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave();
  };

  const handleMouseDown = (e) => {
    setDragStart(e.clientY);
  };

  const handleMouseMove = (e) => {
    if (dragStart === null || !isEditing) return;
    const delta = dragStart - e.clientY;
    const step = Math.floor(delta / 10);
    if (step !== 0) {
      const newValue = parseInt(editValue) + step;
      setEditValue(Math.max(1, Math.min(99, newValue)));
      setDragStart(e.clientY);
    }
  };

  const handleMouseUp = () => {
    setDragStart(null);
  };

  return (
    <div className="timer-container">
      <h3 className="timer-label">Tempo de Foco</h3>
      
      <div className="timer-wrapper">
        {isEditing ? (
          <div 
            className="timer-edit-box"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <input 
              type="number" 
              className="timer-input-edit"
              value={editValue} 
              onChange={handleEditChange}
              onBlur={handleEditSave}
              onKeyDown={handleKeyDown}
              onMouseDown={handleMouseDown}
              autoFocus
              style={{ cursor: 'ns-resize' }}
            />
            <span className="timer-unit">min</span>
          </div>
        ) : (
          <div 
            className="timer-display-group" 
            onClick={handleEditClick} 
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FaClock size={20} color="#fff" />
            <span className="timer-display">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      <div className="timer-controls">
        <button className={`timer-btn-primary ${isActive ? 'active' : ''}`} onClick={toggleTimer}>
          {isActive ? <FaPause /> : <FaPlay />}
        </button>
        <button className="timer-btn-secondary" onClick={resetTimer}>
          <FaRedo />
        </button>
      </div>
    </div>
  );
}