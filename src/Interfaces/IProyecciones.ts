// src/interfaces/IProyecciones.ts

export interface ProyeccionData {
  monthIndex: number;
  value: number;
  date: string;
}

export interface ProjectionResult {
  historicalData: ProyeccionData[];
  projectedData: ProyeccionData[];
  projectionType: string;
  slopeA: number;
  interceptB: number;
}