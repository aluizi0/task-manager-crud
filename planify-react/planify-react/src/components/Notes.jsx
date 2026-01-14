import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '../components/ToastContext'; // Hook de notificação

export function Notes({ userId }) {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  // 1. Carrega a nota do usuário ao iniciar
  useEffect(() => {
    async function fetchNote() {
      if (!userId) return;
      try {
        const docRef = doc(db, "notes", userId); // Usa o ID do usuário como ID do documento
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setNote(docSnap.data().content || '');
        }
      } catch (error) {
        console.error("Erro ao buscar notas:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [userId]);

  // 2. Salva automático quando o usuário clica fora (onBlur)
  const handleSave = async () => {
    if (!userId) return;
    try {
      await setDoc(doc(db, "notes", userId), {
        content: note,
        updatedAt: new Date()
      });
      // Opcional: Avisar que salvou (pode ser chato se aparecer toda hora, então deixei comentado)
      // addToast("Notas salvas!", "info"); 
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
      addToast("Erro ao salvar anotação.", "error");
    }
  };

  return (
    <>  
        <h3 className="notes-title">Anotações</h3>
        {/* Área de texto transparente */}
        <textarea
            className="notes-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleSave} // <--- A Mágica: Salva ao sair do campo
            placeholder={loading ? "Carregando..." : "Escreva suas ideias... (Salva automático ao clicar fora)"}
            spellCheck="false"
        />
    </>
  );
}