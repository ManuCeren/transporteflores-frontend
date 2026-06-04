import { useEffect, useState } from 'react';

interface IMantenimiento {
  idMantenimiento: number;
  estado?: string;
}

export function useMantenimientoResumen() {
  const [totalMantenimientos, setTotalMantenimientos] = useState(0);
  const [mantenimientosActivos, setMantenimientosActivos] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5226/api/Mantenimiento/Lista')
      .then(res => res.json())
      .then((data: IMantenimiento[]) => {
        setTotalMantenimientos(data.length);

        const activos = data.filter(m =>
          !m.estado?.toLowerCase().includes('finalizado')
        ).length;

        setMantenimientosActivos(activos);
      })
      .catch(err => console.error('Error mantenimiento:', err));
  }, []);

  return { totalMantenimientos, mantenimientosActivos };
}