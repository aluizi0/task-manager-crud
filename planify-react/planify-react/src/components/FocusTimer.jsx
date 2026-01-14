import React, { useState, useEffect } from 'react';
import { FaPlay, FaPause, FaRedo, FaPen } from 'react-icons/fa';
import { useToast } from '../components/ToastContext'; // Certifique-se que o caminho está certo

export function FocusTimer() {
  const { addToast } = useToast(); // Hook de notificação
  
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  
  // Estados de Edição
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(25);

  useEffect(() => {
    let interval = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // --- O TIMER ACABOU AQUI ---
            setIsActive(false);
            clearInterval(interval);
            
            // Dispara o alerta visual
            addToast("Tempo de foco finalizado! Parabéns!", "info");
            
            // Opcional: Tocar um som de notificação do navegador
            // const audio = new Audio('url_do_som.mp3');
            // audio.play();

          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } 

    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, addToast]);

  // Controles do Timer
  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(editValue); // Volta para o valor definido (padrão 25 ou o editado)
    setSeconds(0);
  };

  // Funções de Edição
  const handleEditClick = () => {
    setIsEditing(true);
    setEditValue(minutes);
  };

  const handleEditSave = () => {
    setIsEditing(false);
    const newMin = parseInt(editValue) || 25;
    // Garante que o valor esteja entre 1 e 999 minutos
    const validMin = Math.max(1, Math.min(999, newMin));
    
    setMinutes(validMin);
    setEditValue(validMin); // Atualiza o valor padrão de reset
    setSeconds(0);
    setIsActive(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleEditSave();
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
      
      <h3 className="timer-label">Tempo de Foco</h3>
      
      {isEditing ? (
        /* MODO EDIÇÃO: Input numérico */
        <div className="timer-display-group">
          <input 
            className="timer-input-edit"
            type="number" 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditSave} // Salva ao clicar fora
            onKeyDown={handleKeyDown} // Salva ao dar Enter
            autoFocus
          />
          <button className="btn-ok" onClick={handleEditSave}>OK</button>
        </div>
      ) : (
        /* MODO VISUALIZAÇÃO: Números Grandes */
        <div className="timer-display-group">
          <span className="timer-display">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          
          {/* Botão de Editar (Lápis) */}
          <button 
            className="btn-action" 
            onClick={handleEditClick} 
            title="Editar tempo"
            style={{position:'absolute', right: '-30px', top: '10px'}}
          >
            <FaPen size={12}/>
          </button>
        </div>
      )}

      {/* Botões de Controle */}
      <div className="timer-controls">
        <button className="timer-btn-primary" onClick={toggleTimer}>
          {isActive ? <FaPause /> : <FaPlay style={{marginLeft:'4px'}} />}
        </button>
        
        <button className="timer-btn-secondary" onClick={resetTimer} title="Reiniciar">
          <FaRedo />
        </button>
      </div>
      
    </div>
  );
}