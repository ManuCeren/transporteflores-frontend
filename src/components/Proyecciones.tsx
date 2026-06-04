// src/components/Proyecciones.tsx

import { Row, Col, Card } from 'reactstrap';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useState, useEffect, useMemo } from 'react';

import type { ProjectionResult } from '../Interfaces/IProyecciones';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type ProyeccionesProps = {
  handleViewChange: (newView: 'dashboard' | 'clientes' | 'unidades' | 'envios' | 'usuarios' | 'conductores' | 'mantenimiento' | 'facturacion' | 'rutas' | 'proyecciones') => void;
};

export default function Proyecciones({ }: ProyeccionesProps) {
  const [enviosData, setEnviosData] = useState<ProjectionResult | null>(null);
  const [ingresosData, setIngresosData] = useState<ProjectionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = 'http://localhost:5226/api/Proyeccion';

  useEffect(() => {
    const fetchProjectionData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch de Proyección de Envíos (Viajes)
        // Asegúrate de que 'mesesProyeccion' sea 1 para obtener solo el próximo mes
        const enviosResponse = await fetch(`${API_BASE_URL}/Viajes?mesesHistorial=5&mesesProyeccion=1`);
        if (!enviosResponse.ok) {
          throw new Error(`HTTP error! status: ${enviosResponse.status}`);
        }
        const enviosResult: ProjectionResult = await enviosResponse.json();
        setEnviosData(enviosResult);

        // Fetch de Proyección de Ingresos
        const ingresosResponse = await fetch(`${API_BASE_URL}/Ingresos?mesesHistorial=6&mesesProyeccion=1`);
        if (!ingresosResponse.ok) {
          throw new Error(`HTTP error! status: ${ingresosResponse.status}`);
        }
        const ingresosResult: ProjectionResult = await ingresosResponse.json();
        setIngresosData(ingresosResult);

      } catch (e: any) {
        setError(`Error al cargar los datos: ${e.message}`);
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectionData();
  }, []);

  // Función auxiliar para obtener el nombre del mes proyectado
  const getProjectedMonthName = (data: ProjectionResult | null): string => {
    if (data && data.projectedData && data.projectedData.length > 0) {
      const projectedDate = new Date(data.projectedData[0].date);
      return projectedDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    }
    return '';
  };

  // Función auxiliar para obtener el valor proyectado
  const getProjectedValue = (data: ProjectionResult | null): number | null => {
    if (data && data.projectedData && data.projectedData.length > 0) {
      return data.projectedData[0].value;
    }
    return null;
  };

  // --- Funciones para preparar los datos de CADA GRÁFICO ---
  const getEnviosChartData = useMemo(() => {
    if (!enviosData) return { labels: [], datasets: [] };
    const allEnvios = [...enviosData.historicalData, ...enviosData.projectedData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const allDates = Array.from(new Set(
      allEnvios.map(d => new Date(d.date).toLocaleString('es-ES', { month: 'short', year: 'numeric' }))
    )).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const enviosValues = allDates.map(dateLabel => {
      const matchingData = allEnvios.find(d => new Date(d.date).toLocaleString('es-ES', { month: 'short', year: 'numeric' }) === dateLabel);
      return matchingData ? matchingData.value : null;
    });
    return {
      labels: allDates,
      datasets: [
        {
          label: 'Envíos',
          data: enviosValues,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          fill: false,
        },
      ],
    };
  }, [enviosData]);

  const getIngresosChartData = useMemo(() => {
    if (!ingresosData) return { labels: [], datasets: [] };
    const allIngresos = [...ingresosData.historicalData, ...ingresosData.projectedData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const allDates = Array.from(new Set(
      allIngresos.map(d => new Date(d.date).toLocaleString('es-ES', { month: 'short', year: 'numeric' }))
    )).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const ingresosValues = allDates.map(dateLabel => {
      const matchingData = allIngresos.find(d => new Date(d.date).toLocaleString('es-ES', { month: 'short', year: 'numeric' }) === dateLabel);
      return matchingData ? matchingData.value : null;
    });
    return {
      labels: allDates,
      datasets: [
        {
          label: 'Ingresos',
          data: ingresosValues,
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          tension: 0.3,
          fill: false,
        },
      ],
    };
  }, [ingresosData]);


  // --- Opciones para CADA GRÁFICO ---
  const baseChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.label === 'Envíos') {
              label += Math.round(context.raw);
            } else {
              label += new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(context.raw);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad / Monto'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Mes'
        }
      }
    },
  };

  const enviosChartOptions = useMemo(() => {
    const projectedMonth = getProjectedMonthName(enviosData);
    return {
      ...baseChartOptions,
      plugins: {
        ...baseChartOptions.plugins,
        title: {
          display: true,
          text: `Proyección de Viajes para el mes de ${projectedMonth}`,
          font: {
            size: 18,
          },
        },
      },
      scales: {
        y: {
          ...baseChartOptions.scales.y,
          title: {
            display: true,
            text: 'Cantidad de Viajes'
          }
        }
      }
    };
  }, [enviosData]);

  const ingresosChartOptions = useMemo(() => {
    const projectedMonth = getProjectedMonthName(ingresosData);
    return {
      ...baseChartOptions,
      plugins: {
        ...baseChartOptions.plugins,
        title: {
          display: true,
          text: `Proyección de Ingresos para el mes de ${projectedMonth}`,
          font: {
            size: 18,
          },
        },
      },
       scales: {
        y: {
          ...baseChartOptions.scales.y,
          title: {
            display: true,
            text: 'Monto de Ingresos (USD)'
          }
        }
      }
    };
  }, [ingresosData]);

  const projectedEnviosMonth = getProjectedMonthName(enviosData);
  const projectedEnviosValue = getProjectedValue(enviosData);

  const projectedIngresosMonth = getProjectedMonthName(ingresosData);
  const projectedIngresosValue = getProjectedValue(ingresosData);

  return (
    <>
      <h2 className="fw-bold mb-4">Proyecciones del Negocio</h2>
      <Row className="g-4">
        {/* Gráfico de Proyección de Envíos */}
        <Col lg="6">
          <Card body className="shadow-sm border-0 h-100">
            {loading ? (
              <p>Cargando proyección de envíos...</p>
            ) : error ? (
              <p className="text-danger">Error: {error}</p>
            ) : (
              <div>
                <Line data={getEnviosChartData} options={enviosChartOptions} />
                {/* Texto de la proyección de Envíos */}
                {projectedEnviosValue !== null && (
                  <p className="text-center mt-3 fs-5">
                    La proyección de viajes para el mes de <span className="fw-bold">{projectedEnviosMonth}</span> es: <span className="fw-bold text-primary">{Math.round(projectedEnviosValue)}</span>
                  </p>
                )}
              </div>
            )}
          </Card>
        </Col>

        {/* Gráfico de Proyección de Ingresos */}
        <Col lg="6">
          <Card body className="shadow-sm border-0 h-100">
            {loading ? (
              <p>Cargando proyección de ingresos...</p>
            ) : error ? (
              <p className="text-danger">Error: {error}</p>
            ) : (
              <div>
                <Line data={getIngresosChartData} options={ingresosChartOptions} />
                {/* Texto de la proyección de Ingresos */}
                {projectedIngresosValue !== null && (
                  <p className="text-center mt-3 fs-5">
                    La proyección de ingresos para el mes de <span className="fw-bold">{projectedIngresosMonth}</span> es: <span className="fw-bold text-success">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(projectedIngresosValue)}</span>
                  </p>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </>
  );
}