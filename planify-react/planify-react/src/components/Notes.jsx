import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export function Notes({ userId }) {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState(''); // Para mostrar "Salvando..."

  // 1. Carregar nota salva ao abrir
  useEffect(() => {
    if (!userId) return;
    const loadNote = async () => {
      const docRef = doc(db, "notes", userId); // Usa o ID do usuário como ID do documento
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setNote(docSnap.data().content);
      }
    };
    loadNote();
  }, [userId]);

  // 2. Salvar quando perder o foco (onBlur)
  const handleBlur = async () => {
    if (!userId) return;
    setStatus('Salvando...');
    try {
      await setDoc(doc(db, "notes", userId), {
        content: note,
        updatedAt: new Date()
      });
      setStatus('Salvo!');
      setTimeout(() => setStatus(''), 2000); // Limpa msg depois de 2s
    } catch (e) {
      setStatus('Erro ao salvar');
    }
  };

  return (
    <div className="notes-card">
      <h3>Anotações Importantes</h3>
      
      <textarea 
        className="notes-input"
        placeholder="Escreva suas ideias... (Salva automático ao clicar fora)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={handleBlur}
      ></textarea>
    </div>
  );
}