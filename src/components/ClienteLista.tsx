import { useEffect, useState } from "react";
import { appsettings } from "../settings/appsettings";
import type { ICliente } from "../Interfaces/ICliente";
import { ClienteModal } from "./ClienteModal";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import { DataTable } from "./DataTable";

interface ClienteListaProps {
  handleViewChange: (view: "dashboard") => void;
}

export function ClienteLista({ handleViewChange }: ClienteListaProps) {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ICliente | undefined>();

  const obtenerClientes = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Cliente/Lista`);
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const eliminarCliente = async (id: number | string) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Esta acción no se puede deshacer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      const response = await fetch(`${appsettings.apiUrl}Cliente/Eliminar/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        obtenerClientes();
      }
    }
  };

  useEffect(() => {
    obtenerClientes();
  }, []);

  const abrirModal = (cliente?: ICliente) => {
    setSelectedCliente(cliente);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setSelectedCliente(undefined);
    setModalOpen(false);
  };

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <h4 className="m-0">Lista de Clientes</h4>
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
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <DataTable<ICliente>
        data={clientes}
        searchKeys={["nombreCliente", "email", "telefono"]}
        itemsPerPageOptions={[5, 10, 15]}
        defaultItemsPerPage={5}
        onEditar={(cliente) => abrirModal(cliente)}
        onEliminar={(id) => eliminarCliente(id)}
        onNuevo={() => abrirModal()}
        columns={[
          { key: "nombreCliente", label: "Nombre" },
          { key: "direccion", label: "Dirección" },
          { key: "telefono", label: "Teléfono" },
          { key: "email", label: "Correo" },
          { key: "tipoCliente", label: "Tipo Cliente" },
        ]}
      />

      {/* Modal Crear/Editar */}
      <ClienteModal
        isOpen={modalOpen}
        toggle={cerrarModal}
        cliente={selectedCliente}
        onSuccess={() => {
          cerrarModal();
          obtenerClientes();
        }}
      />
    </div>
  );
}
