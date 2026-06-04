import { useEffect, useState } from "react";
import { appsettings } from "../settings/appsettings";
import type { IConductore } from "../Interfaces/IConductor";
import { ConductoreModal } from "./ConductorModal";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import { DataTable } from "./DataTable";

interface ConductoreListaProps {
  handleViewChange: (view: "dashboard") => void;
}

export function ConductoreLista({ handleViewChange }: ConductoreListaProps) {
  const [conductores, setConductores] = useState<IConductore[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConductore, setSelectedConductore] = useState<IConductore | undefined>();

  const obtenerConductores = async () => {
    try {
      const apiUrl = appsettings.apiUrl.endsWith("/")
        ? appsettings.apiUrl
        : appsettings.apiUrl + "/";
      const response = await fetch(`${apiUrl}Conductor/Lista`);
      if (response.ok) {
        const data = await response.json();
        setConductores(data);
      } else {
        console.error("Error al obtener conductores:", await response.text());
      }
    } catch (error) {
      console.error("Error al obtener conductores:", error);
    }
  };

  // Cambiar estado de un conductor (Activo/Inactivo)
  const cambiarEstado = async (id: number | string, estadoActual: string) => {
    const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";

    const confirm = await Swal.fire({
      title: `¿Estás seguro de cambiar el estado a ${nuevoEstado}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Sí, cambiar a ${nuevoEstado}`,
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        if (!nuevoEstado) {
          Swal.fire("Error", "El estado es inválido", "error");
          return;
        }

        const idConductor = typeof id === "string" ? parseInt(id, 10) : id;

        const apiUrl = appsettings.apiUrl.endsWith("/")
          ? appsettings.apiUrl
          : appsettings.apiUrl + "/";
        const response = await fetch(`${apiUrl}Conductor/CambiarEstado/${idConductor}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        });

        if (response.ok) {
          obtenerConductores();
        } else {
          const errorText = await response.text();
          console.error("Error al cambiar el estado:", errorText);
          Swal.fire("Error", `No se pudo cambiar el estado: ${errorText}`, "error");
        }
      } catch (error) {
        console.error("Error al cambiar el estado:", error);
        Swal.fire("Error", "Hubo un problema al actualizar el estado", "error");
      }
    }
  };

  const eliminarConductor = async (id: number | string) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar conductor?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      const apiUrl = appsettings.apiUrl.endsWith("/")
        ? appsettings.apiUrl
        : appsettings.apiUrl + "/";

      const response = await fetch(`${apiUrl}Conductor/Eliminar/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        obtenerConductores();
        Swal.fire("Eliminado", "El conductor fue eliminado correctamente.", "success");
      } else {
        Swal.fire("Error", "No se pudo eliminar el conductor.", "error");
      }
    }
  };

  useEffect(() => {
    obtenerConductores();
  }, []);

  const abrirModal = (conductore?: IConductore) => {
    setSelectedConductore(conductore);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setSelectedConductore(undefined);
    setModalOpen(false);
  };

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <h4 className="m-0">Lista de Conductores</h4>
        <div className="d-flex gap-2">
          <Button color="secondary" size="sm" onClick={() => handleViewChange("dashboard")}>
            <i className="bi bi-house-door me-2" />
            Inicio
          </Button>
          <Button color="success" size="sm" onClick={() => abrirModal()}>
            <i className="bi bi-plus-circle me-2" />
            Nuevo Conductor
          </Button>
        </div>
      </div>

      <DataTable<IConductore>
        data={conductores}
        searchKeys={["nombre", "telefono", "licencia"]}
        itemsPerPageOptions={[5, 10, 15]}
        defaultItemsPerPage={5}
        onEditar={(conductore) => abrirModal(conductore)}
        onEliminar={(id) => eliminarConductor(id)}
        onNuevo={() => abrirModal()}
        columns={[
          { key: "nombre", label: "Nombre" },
          { key: "licencia", label: "Licencia" },
          {
            key: "estado",
            label: "Estado",
            render: (conductore: IConductore) => (
              <Button
                color={conductore.estado === "Activo" ? "success" : "danger"}
                size="sm"
                onClick={() => {
                  if (conductore.idConductores !== undefined) {
                    cambiarEstado(conductore.idConductores, conductore.estado);
                  } else {
                    Swal.fire("Error", "El conductor no tiene un ID válido.", "error");
                  }
                }}
              >
                {conductore.estado === "Activo" ? "Desactivar" : "Activar"}
              </Button>
            ),
          },
          { key: "telefono", label: "Teléfono" },
          { key: "idVehiculo", label: "Vehículo" },
        ]}
      />

      <ConductoreModal
        isOpen={modalOpen}
        toggle={cerrarModal}
        conductore={selectedConductore}
        onSuccess={() => {
          cerrarModal();
          obtenerConductores();
        }}
      />
    </div>
  );
}
