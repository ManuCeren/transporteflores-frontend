import { useState, useEffect } from 'react';
import type { IVistaEnvio } from '../Interfaces/IVistaEnvio';
import type { IUsuarioLogin } from '../Interfaces/IUsuarioLogin';

interface UseEnviosResult {
  envios: IVistaEnvio[];
  totalEnvios: number;
  ultimosEnvios: IVistaEnvio[];
  loading: boolean;
  error: string | null;
}

export const useEnvios = (usuario?: IUsuarioLogin | null): UseEnviosResult => {
  const [envios, setEnvios] = useState<IVistaEnvio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:5226/api';
  const ENVIO_API_ENDPOINT = `${API_BASE_URL}/Envio/VistaDetallada`;

  useEffect(() => {
    const fetchEnvios = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(ENVIO_API_ENDPOINT);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: IVistaEnvio[] = await response.json();

        let enviosFiltrados = data;

        if (usuario?.rol === 'Cliente') {
          enviosFiltrados = data.filter(
            (envio) => envio.idCliente === usuario.idCliente
          );
        }

        if (usuario?.rol === 'Conductor') {
          enviosFiltrados = data.filter(
            (envio) => envio.idConductor === usuario.idConductor
          );
        }

        setEnvios(enviosFiltrados);
      } catch (err: any) {
        console.error('Error fetching shipments:', err);
        setError(`No se pudieron cargar los envíos: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEnvios();
  }, [usuario]);

  const totalEnvios = envios.length;

  const ultimosEnvios = [...envios]
    .sort(
      (a, b) =>
        new Date(b.fechaSolicitud).getTime() -
        new Date(a.fechaSolicitud).getTime()
    )
    .slice(0, 5);

  return { envios, totalEnvios, ultimosEnvios, loading, error };
};