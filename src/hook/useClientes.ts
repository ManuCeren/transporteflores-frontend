import { useState, useEffect } from 'react';
import type { ICliente } from '../Interfaces/ICliente'; 

interface UseClientesResult {
  clientes: ICliente[];
  totalClientes: number;
  ultimosClientes: ICliente[];
  loading: boolean;
  error: string | null;
}

export const useClientes = (): UseClientesResult => {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:5226/api'; 

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/Cliente/Lista`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: ICliente[] = await response.json();
        setClientes(data);
      } catch (err: any) {
        console.error("Error fetching clients:", err);
        setError(`Failed to load clients: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  const totalClientes = clientes.length;
  // Ordena por idClientes de forma descendente (asumiendo que IDs mayores son más recientes)
  const ultimosClientes = [...clientes]
    .sort((a, b) => (b.idClientes || 0) - (a.idClientes || 0))
    .slice(0, 5); // Obtén los 5 últimos

  return { clientes, totalClientes, ultimosClientes, loading, error };
};