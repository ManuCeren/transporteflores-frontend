import { useEffect, useState } from 'react';

interface IFactura {
  idFacturacion: number;
  montoTotal: number;
}

export function useFacturacionResumen() {
  const [totalFacturas, setTotalFacturas] = useState(0);
  const [totalFacturado, setTotalFacturado] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5226/api/Facturacion/Lista')
      .then(res => res.json())
      .then((data: IFactura[]) => {
        setTotalFacturas(data.length);

        const total = data.reduce(
          (sum, factura) => sum + Number(factura.montoTotal || 0),
          0
        );

        setTotalFacturado(total);
      })
      .catch(err => console.error('Error facturación:', err));
  }, []);

  return { totalFacturas, totalFacturado };
}