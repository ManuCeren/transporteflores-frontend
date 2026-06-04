import { useState, useEffect } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
} from "reactstrap";
import Swal from "sweetalert2";
import type { IConductore } from "../Interfaces/IConductor"; 
import { appsettings } from "../settings/appsettings";

interface ConductoreModalProps {
  isOpen: boolean;
  toggle: () => void;
  conductore?: IConductore; 
  onSuccess: () => void;
}

export function ConductoreModal({
  isOpen,
  toggle,
  conductore,
  onSuccess,
}: ConductoreModalProps) {
  const [formData, setFormData] = useState<IConductore>({
    idConductores: conductore?.idConductores ?? 0,
    nombre: conductore?.nombre ?? "",
    licencia: conductore?.licencia ?? "",
    estado: conductore?.estado ?? "",
    telefono: conductore?.telefono ?? "",
    idVehiculo: conductore?.idVehiculo ?? undefined,
    fechaIngreso: conductore?.fechaIngreso ?? "", 
  });

  useEffect(() => {
    if (conductore) {
      setFormData({ ...conductore });
    } else {
      setFormData({
        idConductores: 0,
        nombre: "",
        licencia: "",
        estado: "",
        telefono: "",
        idVehiculo: undefined,
        fechaIngreso: "", 
      });
    }
  }, [conductore, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
  try {
    const method = conductore ? "PUT" : "POST";
    const url = conductore
      ? `${appsettings.apiUrl}Conductor/Editar`
      : `${appsettings.apiUrl}Conductor/Nuevo`;

    const fechaIngresoFormatted = formData.fechaIngreso
      ? formData.fechaIngreso.split('T')[0] 
      : undefined;

    const dataToSubmit = {
      ...formData,
      fechaIngreso: fechaIngresoFormatted, 
    };

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSubmit),
    });

    if (response.ok) {
      Swal.fire({
        title: conductore ? "Conductor actualizado" : "Conductor creado",
        icon: "success",
      });
      onSuccess();
      toggle();
    } else {
      const text = await response.text();
      Swal.fire("Error", text, "error");
    }
  } catch (error) {
    Swal.fire("Error", String(error), "error");
  }
};

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {conductore ? "Editar Conductor" : "Nuevo Conductor"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="nombre">Nombre</Label>
            <Input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="licencia">Licencia</Label>
            <Input
              type="text"
              id="licencia"
              name="licencia"
              value={formData.licencia}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="estado">Estado</Label>
            <Input
              type="select"
              id="estado"
              name="estado"
              value={formData.estado}
              onChange={handleChange}
            >
              <option value="">Selecciona un estado</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="telefono">Teléfono</Label>
            <Input
              type="text"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="idVehiculo">Vehículo Asignado</Label>
            <Input
              type="number"
              id="idVehiculo"
              name="idVehiculo"
              value={formData.idVehiculo || ""}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="fechaIngreso">Fecha de Ingreso</Label>
            <Input
              type="datetime-local"
              id="fechaIngreso"
              name="fechaIngreso"
              value={formData.fechaIngreso}
              onChange={handleChange}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          {conductore ? "Actualizar" : "Crear"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
