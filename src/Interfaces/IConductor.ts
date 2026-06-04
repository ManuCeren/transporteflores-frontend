import type { IUnidades } from "./IUnidades";

export interface IConductore {
    idConductores?: number;         
    nombre: string;                 
    licencia: string;              
    fechaIngreso?: string;          
    estado: string;                 
    telefono: string;               
    idVehiculo?: number;           
    idVehiculoNavigation?: IUnidades; 
}
