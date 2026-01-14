import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

export function TaskModal({ isOpen, onClose, onSave, day }) {
  const [time, setTime] = useState('');
  const [activity, setActivity] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Envia os dados para o Dashboard salvar
    onSave(day, time, activity);
    // Limpa o form
    setTime('');
    setActivity('');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
            <h3>Nova tarefa para {day.toUpperCase()}</h3>
            <button onClick={onClose} style={styles.closeBtn}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <label style={styles.label}>Defina o seu horário:</label>
            <input 
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={styles.input} 
            />

            <label style={styles.label}>Digite sua atividade:</label>
            <input 
                type="text" 
                placeholder="Ex: Estudar, Correr, Praticar exercícios..." 
                required
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                style={styles.input} 
            />

            <button type="submit" style={styles.saveBtn}>Salvar Atividade</button>
        </form>
      </div>
    </div>
  );
}

// Estilos Inline (para ser rápido e garantir que não quebre o layout)
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', backdropFilter: 'blur(5px)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  },
  modal: {
    background: 'rgba(63, 63, 63, 0.34)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderTop: '1px solid rgba(255, 255, 255, 0.15)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.5)',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
    padding: '40px',
    borderRadius: '24px',
    width: '90%',
    maxWidth: '480px',
    color: 'white'
  },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: '#dbdbdb', cursor: 'pointer', fontSize: '1.2rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { fontSize: '0.85rem', color: '#b3b3b3', marginBottom: '6px', fontWeight: '500', textAlign: 'center' },
  input: {
    padding: '14px',
    background: '#0f0f0f',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: 'white',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: '500',
    caretColor: 'white',
    colorScheme: 'white'
  },
  saveBtn: {
    marginTop: '10px',
    padding: '12px 40px',
    background: '#f3f0f0',
    color: '#1d1d1d',
    border: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  timeInputContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  timeColumn: {
    display: 'flex',
    flexDirection: 'column'
  },
  timeSelect: {
    padding: '12px',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1.2rem',
    fontWeight: '600',
    textAlign: 'center',
    cursor: 'pointer',
    outline: 'none',
    width: '70px'
  },
  timeSeparator: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '8px'
  }
};