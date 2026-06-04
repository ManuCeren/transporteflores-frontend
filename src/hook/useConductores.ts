import { useEffect, useState } from 'react';

interface IConductor {
  idConductores: number;
}

export function useConductores() {
  const [totalConductores, setTotalConductores] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5226/api/Conductor/Lista')
      .then(res => res.json())
      .then((data: IConductor[]) => setTotalConductores(data.length))
      .catch(err => console.error('Error conductores:', err));
  }, []);

  return { totalConductores };
}