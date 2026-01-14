import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
// 👇 IMPORTANTE: Adicione o signInWithGoogle aqui
import { auth, signInWithGoogle } from "./services/firebase"; 
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 👇 Esta é a função que faltava!
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Erro ao logar:", error);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loading) return <div className="loading-screen" style={{background: '#000', color: '#fff', height: '100vh', display:'flex', justifyContent:'center', alignItems:'center'}}>Carregando...</div>;

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      {!user ? (
        // 👇 AQUI ESTAVA O ERRO: Faltava passar o onLogin={handleLogin}
        <Login onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;