import React from 'react';
import { FaGoogle } from 'react-icons/fa';
import '../styles/Login.css';

export function Login({ onLogin }) {
  return (
    <div className="login-container">
      {/* Orbs agora serão pontos de luz branca/cinza */}
      <span className="orb orb-1"></span>
      <span className="orb orb-2"></span>

      <div className="login-box">
        {/* Removido o style inline que deixava o ponto verde */}
        <h1>Planify .</h1>
        
        <p>
          Organize sua rotina com nosso cronograma intuitivo, focado na sua produtividade.
        </p>

        <p className="subtitle">
          Acesse sua conta usando o Google.
        </p>

        <button onClick={onLogin} className="google-btn">
          <FaGoogle /> Continuar com Google
        </button>

        <p className="login-hint">
          Ambiente seguro autenticado pelo Google.
        </p>
      </div>
    </div>
  );
}