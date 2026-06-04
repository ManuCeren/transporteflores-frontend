import { useEffect, useState } from 'react';

interface IUnidad {
  idUnidades: number;
}

export function useUnidades() {
  const [totalUnidades, setTotalUnidades] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5226/api/Unidades/Lista')
      .then(res => res.json())
      .then((data: IUnidad[]) => setTotalUnidades(data.length))
      .catch(err => console.error('Error unidades:', err));
  }, []);

  return { totalUnidades };
}