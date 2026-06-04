import { useEffect, useState } from 'react';

const API_BASE_URL = 'http://localhost:5226/api';

interface IVehiculoAsignado {
  idUnidad: number;
  tipoUnidad: string;
  placa: string;
  marca: string;
  modelo: string;
  capacidadCarga: number | null;
}

interface IConductorVehiculo {
  idConductor: number;
  nombre: string;
  licencia: string;
  telefono: string;
  estado: string;
  vehiculo: IVehiculoAsignado | null;
}

export function useConductorVehiculo(idConductor?: number | null) {
  const [conductorVehiculo, setConductorVehiculo] =
    useState<IConductorVehiculo | null>(null);

  const [loadingConductorVehiculo, setLoadingConductorVehiculo] =
    useState(false);

  const [errorConductorVehiculo, setErrorConductorVehiculo] =
    useState<string | null>(null);

  useEffect(() => {
    if (!idConductor) return;

    const obtenerConductorVehiculo = async () => {
      setLoadingConductorVehiculo(true);
      setErrorConductorVehiculo(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/Conductor/VehiculoAsignado/${idConductor}`
        );

        if (!response.ok) {
          throw new Error('No se pudo obtener la información del conductor.');
        }

        const data: IConductorVehiculo = await response.json();
        setConductorVehiculo(data);
      } catch (error) {
        console.error('Error al obtener conductor y vehículo:', error);
        setErrorConductorVehiculo('Error al cargar conductor y vehículo.');
      } finally {
        setLoadingConductorVehiculo(false);
      }
    };

    obtenerConductorVehiculo();
  }, [idConductor]);

  return {
    conductorVehiculo,
    loadingConductorVehiculo,
    errorConductorVehiculo
  };
}