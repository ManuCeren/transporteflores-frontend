import { useState } from 'react';
import AdminLayout from "./layout/AdminLayout";
import Login from './components/Login';
import { obtenerUsuario } from './service/authService';

function App() {
  const [autenticado, setAutenticado] = useState(!!obtenerUsuario());

  return autenticado ? (
    <AdminLayout onLogout={() => setAutenticado(false)} />
  ) : (
    <Login onLogin={() => setAutenticado(true)} />
  );
}

export default App;