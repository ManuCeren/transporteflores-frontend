export interface IUsuario {
    idUsuarios: number;
    nombreUsuario: string;
    rol: string;
    contrasena: string;
    email: string;
    idCliente?: number | null;
    idConductor?: number | null;
}
