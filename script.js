// --- CONFIGURAÇÃO DO FIREBASE (Copie do Console do Firebase) ---
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_PROJECT_ID.appspot.com",
    messagingSenderId: "NUMERO",
    appId: "ID"
};

// Importa funções do Firebase via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, orderBy, query } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// Inicia o App
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const taskList = document.getElementById('taskList');
const btnAdd = document.getElementById('btnAdd');
const input = document.getElementById('taskInput');

// 1. CREATE (Adicionar Tarefa)
btnAdd.addEventListener('click', async () => {
    const text = input.value;
    if (text === "") return alert("Escreva algo!");

    try {
        await addDoc(collection(db, "tarefas"), {
            nome: text,
            data: new Date()
        });
        input.value = ""; // Limpa input
    } catch (e) {
        console.error("Erro: ", e);
    }
});

// 2. READ (Ler Tarefas em Tempo Real)
const q = query(collection(db, "tarefas"), orderBy("data", "desc"));

onSnapshot(q, (snapshot) => {
    taskList.innerHTML = ""; // Limpa a lista para não duplicar
    
    if(snapshot.empty) {
        taskList.innerHTML = "<p>Nenhuma tarefa ainda.</p>";
    }

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const id = docSnap.id;

        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <span>${data.nome}</span>
            <button class="btn-delete" data-id="${id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        taskList.appendChild(li);
    });

    // Adiciona evento de DELETE aos botões criados
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
});

// 3. DELETE (Apagar Tarefa)
async function handleDelete(e) {
    // Pega o ID que guardamos no botão
    const id = e.currentTarget.getAttribute('data-id');
    if(confirm("Tem certeza que quer apagar?")) {
        await deleteDoc(doc(db, "tarefas", id));
    }
}