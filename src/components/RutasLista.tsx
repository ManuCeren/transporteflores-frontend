import { useEffect, useState } from "react";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import { appsettings } from "../settings/appsettings";
import type { IRuta } from "../Interfaces/IRuta";
import { DataTable } from "./DataTable";

interface Props {
  handleViewChange: (view: any, idRuta?: number) => void;
}

export function RutasLista({ handleViewChange }: Props) {
  const [rutas, setRutas] = useState<IRuta[]>([]);

  const cargarRutas = async () => {
    try {
      const res = await fetch(`${appsettings.apiUrl}Ruta/Lista`);
      if (res.ok) {
        const data = await res.json();
        setRutas(data);
      }
    } catch (error) {
      console.error("Error al cargar rutas:", error);
    }
  };

  const eliminarRuta = async (id: number | string) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar esta ruta?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      const res = await fetch(`${appsettings.apiUrl}Ruta/Eliminar/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        cargarRutas();
      }
    }
  };

  useEffect(() => {
    cargarRutas();
  }, []);

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <h4 className="m-0">Rutas registradas</h4>

        <div className="d-flex gap-2">
          <Button
            color="secondary"
            size="sm"
            onClick={() => handleViewChange("dashboard")}
          >
            <i className="bi bi-house-door me-2" />
            Inicio
          </Button>

          <Button
            color="success"
            size="sm"
            onClick={() => handleViewChange("mapaRuta")}
          >
            <i className="bi bi-plus-circle me-2" />
            Nueva Ruta
          </Button>
        </div>
      </div>

      <DataTable<IRuta>
        data={rutas}
        searchKeys={["origen", "destino", "distancia"]}
        itemsPerPageOptions={[5, 10, 15]}
        defaultItemsPerPage={5}
        onEditar={(ruta) => handleViewChange("mapaRuta", ruta.idRutas)}
        onEliminar={(id) => eliminarRuta(id)}
        onNuevo={() => handleViewChange("mapaRuta")}
        columns={[
          { key: "origen", label: "Origen" },
          { key: "destino", label: "Destino" },
          {
            key: "distancia",
            label: "Distancia",
            render: (ruta: IRuta) => `${ruta.distancia} km`,
          },
        ]}
      />
    </div>
  );
}