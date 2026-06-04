export interface IRuta {
  idRutas: number;
  origen: string;
  destino: string;
  distancia: number;
  origenLat?: number;
  origenLong?: number;
  destinoLat?: number;
  destinoLong?: number;
}
