import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { 
  collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, query, where, getDocs, writeBatch 
} from 'firebase/firestore';
import { FaSignOutAlt, FaPlus, FaTrash, FaCopy } from 'react-icons/fa';
import '../styles/Dashboard.css';
import { FocusTimer } from '../components/FocusTimer'; 
import { Notes } from '../components/Notes';
import { TaskModal } from '../components/TaskModal';
import { CopyModal } from '../components/CopyModal';
import { DeleteModal } from '../components/DeleteModal';
import { useToast } from '../components/ToastContext';

export function Dashboard({ user, onLogout }) {
  const { addToast } = useToast(); // <--- Hook de Alerta
  const [tasks, setTasks] = useState([]);
  
  // Estados Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [taskToCopy, setTaskToCopy] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // 1. CARREGAR
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedTasks = tasksData.sort((a, b) => {
         if (a.time < b.time) return -1;
         if (a.time > b.time) return 1;
         return 0;
      });
      setTasks(sortedTasks);
    });
    return () => unsubscribe();
  }, [user]);

  // 2. SALVAR (CRIA OU EDITA) COM ALERTA
  const handleSaveTask = async (taskText, time) => {
    if (!taskText) {
        addToast("Digite o nome da atividade!", "error");
        return;
    }

    try {
        if (taskToEdit) {
            const taskRef = doc(db, "tasks", taskToEdit.id);
            await updateDoc(taskRef, { text: taskText, time: time || '' });
            addToast("Atividade atualizada!", "success"); // <--- Alerta
        } else {
            await addDoc(collection(db, "tasks"), {
                text: taskText, day: selectedDay, time: time || '',
                userId: user.uid, createdAt: new Date().toISOString()
            });
            addToast("Atividade criada com sucesso!", "success"); // <--- Alerta
        }
        setIsModalOpen(false);
        setTaskToEdit(null);
    } catch (error) { 
        console.error("Erro", error); 
        addToast("Erro ao salvar.", "error");
    }
  };

  // 3. COPIAR COM ALERTA
  const handleConfirmCopy = async (targetDays) => {
    if (!taskToCopy) return;
    try {
        const copyPromises = targetDays.map(day => {
            return addDoc(collection(db, "tasks"), {
                text: taskToCopy.text, time: taskToCopy.time,
                day: day, userId: user.uid, createdAt: new Date().toISOString()
            });
        });
        await Promise.all(copyPromises);
        addToast(`Copiado para ${targetDays.length} dias!`, "success"); // <--- Alerta
        setIsCopyModalOpen(false); setTaskToCopy(null);
    } catch (error) { 
        addToast("Erro ao copiar.", "error");
    }
  };

  // 4. DELETAR COM ALERTA
  const handleConfirmDelete = async (targetDays) => {
    if (!taskToDelete) return;
    try {
        const batch = writeBatch(db);
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid), where("text", "==", taskToDelete.text));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            if (targetDays.includes(doc.data().day)) batch.delete(doc.ref);
        });
        await batch.commit();
        addToast("Atividades excluídas.", "info"); // <--- Alerta
        setIsDeleteModalOpen(false); setTaskToDelete(null);
    } catch (error) { 
        addToast("Erro ao excluir.", "error");
    }
  };

  // Funções auxiliares de abrir modal
  const openCreateModal = (day) => { setTaskToEdit(null); setSelectedDay(day); setIsModalOpen(true); };
  const handleOpenEdit = (task) => { setTaskToEdit(task); setSelectedDay(task.day); setIsModalOpen(true); };
  const handleOpenCopy = (task) => { setTaskToCopy(task); setIsCopyModalOpen(true); };
  const handleOpenDelete = (task) => { setTaskToDelete(task); setIsDeleteModalOpen(true); };

  const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'];

  return (
    <div className="dashboard-container">
      <span className="orb orb-1"></span>
      <span className="orb orb-2"></span>

      <header className="dashboard-header">
        <div className="user-info">
          {user.photoURL && <img src={user.photoURL} alt="User" className="user-avatar" referrerPolicy="no-referrer" />}
          <div><span className="greeting">Olá,</span><h2>{user.displayName}</h2></div>
        </div>
        <button onClick={onLogout} className="btn-logout"><FaSignOutAlt /> Sair</button>
      </header>

      <div className="main-grid">
        <section className="schedule-section">
          <div className="week-grid">
            {daysOfWeek.map(day => (
              <div key={day} className="day-column">
                <h3 className="day-title">{day}</h3>
                <div className="task-list">
                  {tasks.filter(t => t.day === day).map(task => (
                    
                    /* --- AQUI ESTÁ A ESTRUTURA HTML ATUALIZADA PARA O NOVO CSS --- */
                    <div key={task.id} className="task-card-item">
                      {/* Linha 1: Horário e Botões */}
                      <div className="task-header-row">
                          {task.time ? (
                              <span className="task-time" onClick={() => handleOpenEdit(task)} style={{cursor: 'pointer'}}>
                                  {task.time}
                              </span>
                          ) : (<span></span>)}

                          <div className="task-actions">
                            <button onClick={(e) => { e.stopPropagation(); handleOpenCopy(task); }} className="btn-action" title="Copiar"><FaCopy /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleOpenDelete(task); }} className="btn-action" title="Excluir"><FaTrash /></button>
                          </div>
                      </div>

                      {/* Linha 2: Texto da Tarefa (Cresce conforme necessário) */}
                      <span className="task-text" onClick={() => handleOpenEdit(task)} title="Clique para editar">
                        {task.text}
                      </span>
                    </div>
                    /* ----------------------------------------------------------- */

                  ))}
                </div>
                <button className="btn-add" onClick={() => openCreateModal(day)}><FaPlus /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="timer-section">
          <div className="focus-card"><FocusTimer /></div>
        </section>

        <section className="notes-section">
          <div className="notes-card">
            <h3 className="section-title">Anotações Importantes</h3>
            <Notes userId={user.uid} />
          </div>
        </section>
      </div>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTask} day={selectedDay} taskToEdit={taskToEdit} />
      <CopyModal isOpen={isCopyModalOpen} onClose={() => setIsCopyModalOpen(false)} onConfirm={handleConfirmCopy} task={taskToCopy} />
      <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleConfirmDelete} task={taskToDelete} />
    </div>
  );
}