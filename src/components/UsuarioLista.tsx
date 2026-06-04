import { useEffect, useState } from "react";
import { appsettings } from "../settings/appsettings";
import type { IUsuario } from "../Interfaces/IUsuario";
import { UsuarioModal } from "./UsuarioModal";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import { DataTable } from "./DataTable";

interface UsuarioListaProps {
  handleViewChange: (view: "dashboard") => void;
}

export function UsuarioLista({ handleViewChange }: UsuarioListaProps) {
  const [usuarios, setUsuarios] = useState<IUsuario[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<IUsuario | undefined>();

  const obtenerUsuarios = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Usuario/Lista`);
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    }
  };

  const eliminarUsuario = async (id: number | string) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡Esta acción no se puede deshacer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      const response = await fetch(`${appsettings.apiUrl}Usuario/Eliminar/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        obtenerUsuarios();
      }
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const abrirModal = (usuario?: IUsuario) => {
    setSelectedUsuario(usuario);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setSelectedUsuario(undefined);
    setModalOpen(false);
  };

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <h4 className="m-0">Lista de Usuarios</h4>
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
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <DataTable<IUsuario>
        data={usuarios}
        searchKeys={["nombreUsuario", "email", "rol"]}
        itemsPerPageOptions={[5, 10, 15]}
        defaultItemsPerPage={5}
        onEditar={(usuario) => abrirModal(usuario)}
        onEliminar={(id) => eliminarUsuario(id)}
        onNuevo={() => abrirModal()}
        columns={[
          { key: "nombreUsuario", label: "Nombre Usuario" },
          { key: "email", label: "Correo" },
          { key: "rol", label: "Rol" },
        ]}
      />

      <UsuarioModal
        isOpen={modalOpen}
        toggle={cerrarModal}
        usuario={selectedUsuario}
        onSuccess={() => {
          cerrarModal();
          obtenerUsuarios();
        }}
      />
    </div>
  );
}
