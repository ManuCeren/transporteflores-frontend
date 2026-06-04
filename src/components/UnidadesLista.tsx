import { useState, useEffect } from "react";
import { appsettings } from "../settings/appsettings";
import Swal from "sweetalert2";
import type { IUnidades } from "../Interfaces/IUnidades";
import { Button } from "reactstrap";
import { UnidadesModal } from "./UnidadesModal";
import { DataTable } from "./DataTable";

interface UnidadesListaProps {
  handleViewChange: (view: "dashboard") => void;
}

export function UnidadesLista({ handleViewChange }: UnidadesListaProps) {
  const [unidades, setUnidades] = useState<IUnidades[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState<IUnidades | undefined>();

  const obtenerUnidades = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Unidades/Lista`);
      if (response.ok) {
        const data = await response.json();
        setUnidades(data);
      } else {
        throw new Error('No se pudo obtener la lista de unidades');
      }
    } catch (error) {
      console.error("Error al obtener unidades:", error);
      Swal.fire("Error", "Hubo un problema al obtener las unidades", "error");
    }
  };

  const eliminarUnidad = async (id: number | string) => {
    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(`${appsettings.apiUrl}Unidades/Eliminar/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          obtenerUnidades();
          Swal.fire("Eliminado", "La unidad ha sido eliminada exitosamente", "success");
        } else {
          const responseData = await response.json();
          Swal.fire("Error", responseData?.mensaje || "No se pudo eliminar la unidad", "error");
        }
      } catch (error) {
        console.error("Error al eliminar unidad:", error);
        Swal.fire("Error", "Hubo un problema al eliminar la unidad", "error");
      }
    }
  };

  useEffect(() => {
    obtenerUnidades();
  }, []);

  const abrirModal = (unidad?: IUnidades) => {
    setSelectedUnidad(unidad);
    setModalOpen(true);
  };
  
  const cerrarModal = () => {
    setSelectedUnidad(undefined);
    setModalOpen(false);
  };

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <h4 className="m-0">Lista de Unidades</h4>
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
            Nueva Unidad
          </Button>
        </div>
      </div>

      <DataTable<IUnidades>
        data={unidades}
        searchKeys={["placa", "marca", "modelo", "estado", "tipoUnidad"]}
        itemsPerPageOptions={[5, 10, 15]}
        defaultItemsPerPage={5}
        onEditar={(unidad) => abrirModal(unidad)}
        onEliminar={(id) => eliminarUnidad(id)} // Llama a la función eliminarUnidad
        onNuevo={() => abrirModal()}
        columns={[
          { key: "tipoUnidad", label: "Tipo Unidad" },
          { key: "placa", label: "Placa" },
          { key: "marca", label: "Marca" },
          { key: "modelo", label: "Modelo" },
          { key: "año", label: "Año" },
          { key: "estado", label: "Estado" },
          { key: "kilometrajeActual", label: "Kilometraje Actual" },
        ]}
      />

      <UnidadesModal
        isOpen={modalOpen}
        toggle={cerrarModal}
        unidad={selectedUnidad}
        onSuccess={() => {
          cerrarModal();
          obtenerUnidades(); 
        }}
      />
    </div>
  );
}
