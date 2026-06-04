import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface MapaProps {
  handleViewChange: (view: any, idRuta?: number) => void;
  idRuta?: number;
}

const Mapa: React.FC<MapaProps> = ({ handleViewChange, idRuta }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const directions = useRef<MapboxDirections | null>(null);

  const [rutaGuardada, setRutaGuardada] = useState('');
  const [ultimaRuta, setUltimaRuta] = useState<any | null>(null);
  const [guardando, setGuardando] = useState(false);


  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-89.8275, 13.5928],
      zoom: 7,
    });

    directions.current = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: 'metric',
      profile: 'mapbox/driving',
      language: 'es',
      placeholderOrigin: 'Punto de salida',
      placeholderDestination: 'Punto de llegada',
      controls: {
        inputs: true,
        instructions: true,
        profileSwitcher: false,
      },
    });

    map.current.addControl(directions.current, 'top-left');

    directions.current.on('route', (e: any) => {
      if (e?.route?.[0]) {
        setUltimaRuta(e.route[0]);
        setRutaGuardada('');
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const cargarRuta = async () => {
      if (!idRuta || !directions.current) return;

      try {
        const response = await fetch(`http://localhost:5226/api/Ruta/Obtener/${idRuta}`);

        const ruta = await response.json();

        if (ruta.origenLong && ruta.origenLat) {
          directions.current.setOrigin([ruta.origenLong, ruta.origenLat]);
        } else {
          directions.current.setOrigin(ruta.origen);
        }

        if (ruta.destinoLong && ruta.destinoLat) {
          directions.current.setDestination([ruta.destinoLong, ruta.destinoLat]);
        } else {
          directions.current.setDestination(ruta.destino);
        }
      } catch (error) {
        console.error('Error cargando ruta:', error);
      }
    };

    setTimeout(cargarRuta, 1000);
  }, [idRuta]);

  const saveRoute = async () => {
    if (!ultimaRuta || !directions.current) {
      alert('Primero calcula una ruta.');
      return;
    }

    setGuardando(true);

    try {
      const leg = ultimaRuta.legs[0];
      const distanciaKm = leg.distance / 1000;

      const originObj = directions.current.getOrigin();
      const destinationObj = directions.current.getDestination();

      const inputs = document.querySelectorAll<HTMLInputElement>(
        '.mapboxgl-ctrl-directions input'
      );

      const origenNombre = inputs[0]?.value.trim() || '';
      const destinoNombre = inputs[1]?.value.trim() || '';

      console.log('Origen input:', origenNombre);
      console.log('Destino input:', destinoNombre);

      let origenCoords: [number, number] | null = null;
      let destinoCoords: [number, number] | null = null;

      if (originObj?.geometry?.coordinates) {
        origenCoords = [
          originObj.geometry.coordinates[0],
          originObj.geometry.coordinates[1],
        ];
      }

      if (destinationObj?.geometry?.coordinates) {
        destinoCoords = [
          destinationObj.geometry.coordinates[0],
          destinationObj.geometry.coordinates[1],
        ];
      }

      if (!origenCoords || !destinoCoords) {
        throw new Error('No se pudieron obtener las coordenadas.');
      }

      if (!origenNombre || !destinoNombre) {
        throw new Error('Origen y destino no pueden estar vacíos.');
      }

      const nuevaRuta = {
        IdRutas: idRuta ?? 0,
        Origen: origenNombre.substring(0, 190),
        Destino: destinoNombre.substring(0, 190),
        Distancia: Math.round(distanciaKm * 100) / 100,
        OrigenLong: origenCoords[0],
        OrigenLat: origenCoords[1],
        DestinoLong: destinoCoords[0],
        DestinoLat: destinoCoords[1],
      };

      const url = idRuta
        ? 'http://localhost:5226/api/Ruta/Editar'
        : 'http://localhost:5226/api/Ruta/Nuevo';

      const response = await fetch(url, {
        method: idRuta ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(nuevaRuta),
      });

      const responseText = await response.text();
      const data = responseText ? JSON.parse(responseText) : null;

      if (!response.ok) {
        throw new Error(data?.mensaje || 'Error al guardar la ruta.');
      }

      setRutaGuardada(
        `✅ Ruta ${idRuta ? 'actualizada' : 'guardada'} correctamente`
      );

      setTimeout(() => handleViewChange('rutas'), 1500);
    } catch (error) {
      console.error('ERROR:', error);
      alert(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setGuardando(false);
    }
  };

  const limpiarRuta = () => {
    directions.current?.removeRoutes();
    setUltimaRuta(null);
    setRutaGuardada('');
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          position: 'relative',
          zIndex: 20,
          backgroundColor: '#f8f9fa',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid #ddd',
        }}
      >
        <button
          onClick={saveRoute}
          disabled={!ultimaRuta || guardando}
          className="btn btn-success"
        >
          {guardando ? 'Guardando...' : idRuta ? 'Actualizar ruta' : 'Guardar ruta'}
        </button>

        <button onClick={limpiarRuta} className="btn btn-warning">
          Limpiar
        </button>

        <button onClick={() => handleViewChange('rutas')} className="btn btn-primary">
          Volver a rutas
        </button>

        {ultimaRuta && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '15px' }}>
            <span>📏 {(ultimaRuta.legs[0].distance / 1000).toFixed(2)} km</span>
            <span>⏱️ {Math.round(ultimaRuta.legs[0].duration / 60)} min</span>
          </div>
        )}
      </div>

      <div ref={mapContainer} style={{ width: '100%', height: '600px' }} />

      {rutaGuardada && (
        <div
          style={{
            position: 'absolute',
            top: 80,
            right: 10,
            zIndex: 30,
            backgroundColor: '#d4edda',
            color: '#155724',
            padding: 15,
            borderRadius: 8,
            width: 400,
          }}
        >
          {rutaGuardada}
        </div>
      )}
    </div>
  );
};

export default Mapa;