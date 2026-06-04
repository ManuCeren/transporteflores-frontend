import { useEffect, useState } from "react";
import { appsettings } from "../settings/appsettings";
import type { IMantenimiento } from "../Interfaces/IMantenimiento";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import { DataTable } from "./DataTable";
import { MantenimientoModal } from "./MantenimientoModal";

interface MantenimientoListaProps {
  handleViewChange: (view: "dashboard") => void;
}

export function MantenimientoLista({ handleViewChange }: MantenimientoListaProps) {
  const [mantenimientos, setMantenimientos] = useState<IMantenimiento[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<IMantenimiento | undefined>();

  const obtenerMantenimientos = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Mantenimiento/Lista`);
      if (response.ok) {
        const data = await response.json();
        setMantenimientos(data);
      }
    } catch (error) {
      console.error("Error al obtener mantenimientos:", error);
    }
  };

  const eliminarMantenimiento = async (id: number | string) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Esta acción no se puede deshacer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      const response = await fetch(`${appsettings.apiUrl}Mantenimiento/Eliminar/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        obtenerMantenimientos();
      }
    }
  };

  useEffect(() => {
    obtenerMantenimientos();
  }, []);

  const abrirModal = (mantenimiento?: IMantenimiento) => {
    setSelectedMantenimiento(mantenimiento);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setSelectedMantenimiento(undefined);
    setModalOpen(false);
  };

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <h4 className="m-0">Lista de Mantenimientos</h4>
        <div className="d-flex gap-2">
          <Button
            color="secondary"
            size="sm"
            onClick={() => handleViewChange("dashboard")}
          >
            <i className="bi bi-house-door me-2" />
            Inicio
          </Button>
          <Button color="success" size="sm" onClick={() => abrirModal()}>
            <i className="bi bi-plus-circle me-2" />
            Nuevo Mantenimiento
          </Button>
        </div>
      </div>

      <DataTable<IMantenimiento>
        data={mantenimientos}
        searchKeys={["idUnidad", "fechaMantenimiento", "fechaSiguienteMantenimiento"]}
        itemsPerPageOptions={[5, 10, 15]}
        defaultItemsPerPage={5}
        onEditar={(mantenimiento) => abrirModal(mantenimiento)}
        onEliminar={(id) => eliminarMantenimiento(id)}
        onNuevo={() => abrirModal()}
        columns={[
          { key: "idMantenimientos", label: "ID" },
          { key: "idUnidad", label: "ID Unidad" },
          { key: "fechaMantenimiento", label: "Fecha Mantenimiento" },
          { key: "fechaSiguienteMantenimiento", label: "Próximo Mantenimiento" },
        ]}
      />

      <MantenimientoModal
        isOpen={modalOpen}
        toggle={cerrarModal}
        mantenimiento={selectedMantenimiento}
        onSuccess={() => {
          cerrarModal();
          obtenerMantenimientos();
        }}
      />
    </div>
  );
}
