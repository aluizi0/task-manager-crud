// --- CONFIGURAÇÃO (MANTENHA A SUA CONFIGURAÇÃO DO FIREBASE AQUI) ---
// Cole aqui o seu const firebaseConfig = { ... } do projeto NOVO
const firebaseConfig = {
  apiKey: "AIzaSyC_3_0I53wPsUx99OjIx1UvkIwOWBrW5pA",
  authDomain: "planify-aluizi0.firebaseapp.com",
  projectId: "planify-aluizi0",
  storageBucket: "planify-aluizi0.firebasestorage.app",
  messagingSenderId: "1011202181166",
  appId: "1:1011202181166:web:33ad0bc03bc293821e77bf",
  measurementId: "G-XSYCSGREDZ"
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, orderBy, query, where } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let currentUser = null;
let unsubscribe = null;
let copiedTaskData = null; // Memória temporária para o Copiar/Colar

// --- 1. AUTENTICAÇÃO ---

document.getElementById('btnLogin').addEventListener('click', async () => {
    try { await signInWithPopup(auth, provider); } 
    catch (e) { alert("Erro: " + e.message); }
});

document.getElementById('btnLogout').addEventListener('click', () => {
    signOut(auth).then(() => window.location.reload());
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('app-screen').classList.remove('hidden');
        document.getElementById('userPhoto').src = user.photoURL;
        document.getElementById('userName').innerText = user.displayName.split(' ')[0];
        loadUserTasks(user.uid);
    } else {
        currentUser = null;
        document.getElementById('login-screen').classList.remove('hidden');
        document.getElementById('app-screen').classList.add('hidden');
    }
});

// --- 2. SISTEMA DE MODAL (ABRIR/FECHAR) ---

// Torna as funções acessíveis no HTML
window.openModal = (day) => {
    document.getElementById('taskModal').classList.remove('hidden');
    document.getElementById('modalDay').value = day;
    document.getElementById('modalTitle').innerText = `Adicionar em: ${day.toUpperCase()}`;
    
    // Verifica se tem algo copiado para mostrar o botão "Colar"
    const btnPaste = document.getElementById('btnPaste');
    if (copiedTaskData) {
        btnPaste.classList.remove('hidden');
        document.getElementById('pastePreview').innerText = copiedTaskData.atividade;
    } else {
        btnPaste.classList.add('hidden');
    }
    
    // Foca no input de hora
    document.getElementById('modalTime').focus();
};

window.closeModal = () => {
    document.getElementById('taskModal').classList.add('hidden');
    // Limpa os campos
    document.getElementById('modalTime').value = "";
    document.getElementById('modalTask').value = "";
};

// --- 3. LÓGICA DO BANCO DE DADOS ---

function loadUserTasks(uid) {
    const q = query(
        collection(db, "cronograma"), 
        where("uid", "==", uid), 
        orderBy("hora")
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
        // Limpa as colunas
        ['seg','ter','qua','qui','sex','sab','dom'].forEach(d => {
            document.getElementById(`list-${d}`).innerHTML = "";
        });

        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            
            const card = document.createElement('div');
            card.className = 'task-card';
            card.innerHTML = `
                <div class="task-info">
                    <span class="task-time">${data.hora}</span>
                    <span class="task-name">${data.atividade}</span>
                </div>
                <div class="task-actions">
                    <button class="btn-icon btn-copy" onclick="copyItem('${data.hora}', '${data.atividade}')">
                        <i class="far fa-copy"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteItem('${id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            const coluna = document.getElementById(`list-${data.dia}`);
            if(coluna) coluna.appendChild(card);
        });
    });
}

// Salvar Tarefa (Vindo do Modal)
window.saveTask = async () => {
    if (!currentUser) return;

    const day = document.getElementById('modalDay').value;
    const time = document.getElementById('modalTime').value; // Formato "HH:MM" (24h)
    const task = document.getElementById('modalTask').value;

    if (!task || !time) return showToast("Preencha horário e tarefa!", "error");

    try {
        await addDoc(collection(db, "cronograma"), {
            uid: currentUser.uid,
            dia: day,
            hora: time,
            atividade: task,
            criadoEm: new Date().toISOString()
        });
        showToast("Tarefa agendada com sucesso!", "success");
        closeModal();
    } catch (e) {
        console.error(e);
        showToast("Erro ao salvar", "error");
    }
};

// --- 4. FUNÇÕES DE COPIAR E COLAR ---

// Copiar (Salva na memória do JS)
window.copyItem = (time, activity) => {
    copiedTaskData = { hora: time, atividade: activity };
    showToast(`Copiado: "${activity}"`, "neutral");
    // Feedback visual poderia ser adicionado aqui
};

// Colar (Pega da memória e joga nos inputs do modal)
window.pasteTask = () => {
    if (copiedTaskData) {
        document.getElementById('modalTime').value = copiedTaskData.hora;
        document.getElementById('modalTask').value = copiedTaskData.atividade;
        showToast("Dados colados! Clique em Salvar.", "neutral");
    }
};

// Deletar
window.deleteItem = async (id) => {
    // 1. Pergunta de segurança
    if(confirm("Tem certeza que deseja apagar esta tarefa?")) {
        try {
            // 2. Remove do banco de dados
            await deleteDoc(doc(db, "cronograma", id));
            
            // 3. MOSTRA O POPUP DE SUCESSO! 🔔
            // O tipo "error" aqui é só para o fundo ficar vermelho (estilo visual de remoção)
            showToast("Tarefa removida!", "delete");
            
        } catch (e) {
            console.error("Erro ao deletar:", e);
            showToast("Erro ao tentar remover.", "error");
        }
    }
};

// Toastify
// Função de Toast Personalizada
const showToast = (msg, type = "neutral") => {
    let bgColor, textColor;

    // Configura as cores baseadas no tipo
    if (type === "success") {
        // ADICIONAR: Fundo Verde, Texto Branco
        bgColor = "#00C851"; 
        textColor = "#ffffff";
    } else if (type === "delete" || type === "error") {
        // DELETAR/ERRO: Fundo Vermelho, Texto Branco
        bgColor = "#ff4444"; 
        textColor = "#ffffff";
    } else {
        // OUTROS (Neutro): Fundo Branco, Texto Preto
        bgColor = "#ffffff"; 
        textColor = "#000000";
    }

    if (typeof Toastify === 'function') {
        Toastify({ 
            text: msg, 
            duration: 3000, 
            gravity: "bottom", 
            position: "center",
            style: { 
                background: bgColor, 
                color: textColor,
                borderRadius: "8px",
                fontWeight: "bold",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" // Sombra para o fundo branco destacar
            } 
        }).showToast();
    } else { 
        alert(msg); 
    }
};