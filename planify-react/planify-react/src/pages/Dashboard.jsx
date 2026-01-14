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
  const { addToast } = useToast();
  const [tasks, setTasks] = useState([]);
  
  // Estados Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [taskToEdit, setTaskToEdit] = useState(null);

  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [taskToCopy, setTaskToCopy] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // --- 🎨 FUNÇÃO DE CORES (TONS ESCUROS/SÓBRIOS) ---
  const getTimeColor = (timeStr) => {
    if (!timeStr) return '#444'; 
    const hour = parseInt(timeStr.split(':')[0]); 
    
    // Paleta de 24 Cores Mais Escuras e Elegantes (Matte/Deep)
    const colors = [
        "#C0392B", // 00h - Vermelho Escuro
        "#922B21", // 01h - Vinho
        "#76448A", // 02h - Roxo Médio
        "#512E5F", // 03h - Roxo Profundo
        "#1F618D", // 04h - Azul Escuro
        "#154360", // 05h - Azul Marinho
        "#117864", // 06h - Verde Petróleo
        "#094639", // 07h - Verde Floresta Profundo
        "#ffffff", // 08h - Verde Escuro
        "#3ed17e", // 09h - Verde Musgo
        "#7D6608", // 10h - Ocre Escuro
        "#7E5109", // 11h - Dourado Queimado
        "#784212", // 12h - Marrom Avermelhado
        "#6E2C00", // 13h - Chocolate Amargo
        "#A04000", // 14h - Laranja Queimado Escuro
        "#D35400", // 15h - Abóbora Escura
        "#884EA0", // 16h - Violeta
        "#2471A3", // 17h - Azul Aço
        "#2E86C1", // 18h - Azul Cobalto
        "#17A589", // 19h - Turquesa Escuro
        "#229954", // 20h - Verde Esmeralda Escuro
        "#D4AC0D", // 21h - Mostarda Escuro
        "#BA4A00", // 22h - Cobre
        "#A93226"  // 23h - Vermelho Tijolo
    ];

    const index = hour % 24; 
    return colors[index] || '#555';
  };

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

  // 2. SALVAR
  const handleSaveTask = async (taskText, time, description) => {
    if (!taskText) {
        addToast("Digite o nome da atividade!", "error");
        return;
    }

    try {
        const dataToSave = {
            text: taskText, 
            time: time || '',
            description: description || '',
        };

        if (taskToEdit) {
            const taskRef = doc(db, "tasks", taskToEdit.id);
            await updateDoc(taskRef, dataToSave);
            addToast("Atividade atualizada!", "success");
        } else {
            await addDoc(collection(db, "tasks"), {
                ...dataToSave,
                day: selectedDay, 
                userId: user.uid, 
                createdAt: new Date().toISOString()
            });
            addToast("Atividade criada!", "success");
        }
        setIsModalOpen(false);
        setTaskToEdit(null);
    } catch (error) { 
        console.error("Erro", error); 
        addToast("Erro ao salvar.", "error");
    }
  };

  // 3. COPIAR
  const handleConfirmCopy = async (targetDays) => {
    if (!taskToCopy) return;
    try {
        const copyPromises = targetDays.map(day => {
            return addDoc(collection(db, "tasks"), {
                text: taskToCopy.text, 
                time: taskToCopy.time,
                description: taskToCopy.description || '',
                day: day, userId: user.uid, createdAt: new Date().toISOString()
            });
        });
        await Promise.all(copyPromises);
        addToast(`Copiado para ${targetDays.length} dias!`, "success");
        setIsCopyModalOpen(false); setTaskToCopy(null);
    } catch (error) { addToast("Erro ao copiar.", "error"); }
  };

  // 4. DELETAR
  const handleConfirmDelete = async (targetDays) => {
    if (!taskToDelete || !targetDays || targetDays.length === 0) return;
    try {
        const batch = writeBatch(db);
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid), where("text", "==", taskToDelete.text));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            if (targetDays.includes(doc.data().day)) batch.delete(doc.ref);
        });
        await batch.commit();
        addToast("Atividades excluídas.", "info");
        setIsDeleteModalOpen(false); setTaskToDelete(null);
    } catch (error) { addToast("Erro ao excluir.", "error"); }
  };

  // Auxiliares
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
                  {tasks.filter(t => t.day === day).map(task => {
                    
                    const taskColor = getTimeColor(task.time);

                    return (
                        <div 
                            key={task.id} 
                            className="task-card-item"
                            // Borda Esquerda com a cor escura
                            style={{ borderLeft: `4px solid ${taskColor}` }}
                        >
                          <div className="task-header-row">
                              {task.time ? (
                                  <span 
                                    className="task-time" 
                                    onClick={() => handleOpenEdit(task)} 
                                    // Texto da hora usa a mesma cor da borda
                                    style={{cursor: 'pointer', color: taskColor}} 
                                  >
                                      {task.time}
                                  </span>
                              ) : (<span></span>)}

                              <div className="task-actions">
                                <button onClick={(e) => { e.stopPropagation(); handleOpenCopy(task); }} className="btn-action" title="Copiar"><FaCopy /></button>
                                <button onClick={(e) => { e.stopPropagation(); handleOpenDelete(task); }} className="btn-action" title="Excluir"><FaTrash /></button>
                              </div>
                          </div>

                          <span className="task-text" onClick={() => handleOpenEdit(task)} title="Clique para ver detalhes">
                            {task.text}
                          </span>
                        </div>
                    );
                  })}
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