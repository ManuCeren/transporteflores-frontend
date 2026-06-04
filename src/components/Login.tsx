// src/components/Login.tsx
import { useState } from 'react';
import { login, guardarUsuario } from '../service/authService';

interface Props {
  onLogin: () => void;
}

export default function Login({ onLogin }: Props) {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const usuario = await login(nombreUsuario, contrasena);
      guardarUsuario(usuario);
      onLogin();
    } catch {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '380px' }}>
        <h4 className="text-center mb-4">
          <img src="/logo-flores.png" className="logo-login" />
          Transporte Flores</h4>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Usuario</label>
            <input
              className="form-control"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <button className="btn btn-primary w-100" type="submit">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}