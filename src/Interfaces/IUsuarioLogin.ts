// src/Interfaces/IUsuarioLogin.ts
export interface IUsuarioLogin {
  idUsuarios: number;
  nombreUsuario: string;
  rol: 'Administrador' | 'Logistica' | 'Cliente' | 'Conductor';
  email: string;
  idCliente: number | null;
  idConductor: number | null;
}