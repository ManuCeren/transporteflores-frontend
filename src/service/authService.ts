// src/services/authService.ts
import type { IUsuarioLogin } from '../Interfaces/IUsuarioLogin';

const API_URL = 'http://localhost:5226/api/Auth/login';

export async function login(
  nombreUsuario: string,
  contrasena: string
): Promise<IUsuarioLogin> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombreUsuario, contrasena }),
  });

  if (!response.ok) {
    throw new Error('Usuario o contraseña incorrectos');
  }

  return await response.json();
}

export function guardarUsuario(usuario: IUsuarioLogin) {
  sessionStorage.setItem('usuario', JSON.stringify(usuario));
}

export function obtenerUsuario(): IUsuarioLogin | null {
  const data = sessionStorage.getItem('usuario');
  return data ? JSON.parse(data) : null;
}

export function cerrarSesion() {
  sessionStorage.removeItem('usuario');
}