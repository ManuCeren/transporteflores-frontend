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
import type { IMantenimiento } from "../Interfaces/IMantenimiento";
import { appsettings } from "../settings/appsettings";

interface MantenimientoModalProps {
  isOpen: boolean;
  toggle: () => void;
  mantenimiento?: IMantenimiento;
  onSuccess: () => void;
}

export function MantenimientoModal({
  isOpen,
  toggle,
  mantenimiento,
  onSuccess,
}: MantenimientoModalProps) {
  const [formData, setFormData] = useState<IMantenimiento>({
    idMantenimientos: mantenimiento?.idMantenimientos ?? 0,
    idUnidad: mantenimiento?.idUnidad,
    fechaMantenimiento: mantenimiento?.fechaMantenimiento ?? "",
    fechaSiguienteMantenimiento: mantenimiento?.fechaSiguienteMantenimiento ?? "",
  });

  useEffect(() => {
    if (mantenimiento) {
      setFormData({ ...mantenimiento });
    } else {
      setFormData({
        idMantenimientos: 0,
        idUnidad: undefined,
        fechaMantenimiento: "",
        fechaSiguienteMantenimiento: "",
      });
    }
  }, [mantenimiento, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "idUnidad") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? undefined : Number(value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    try {
      const method = mantenimiento ? "PUT" : "POST";
      const url = mantenimiento
        ? `${appsettings.apiUrl}Mantenimiento/Editar`
        : `${appsettings.apiUrl}Mantenimiento/Nuevo`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          title: mantenimiento ? "Mantenimiento actualizado" : "Mantenimiento creado",
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
        {mantenimiento ? "Editar Mantenimiento" : "Nuevo Mantenimiento"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="idUnidad">ID Unidad</Label>
            <Input
              type="number"
              id="idUnidad"
              name="idUnidad"
              value={formData.idUnidad ?? ""}
              onChange={handleChange}
              placeholder="Ingrese ID de Unidad"
            />
          </FormGroup>
          <FormGroup>
            <Label for="fechaMantenimiento">Fecha de Mantenimiento</Label>
            <Input
              type="date"
              id="fechaMantenimiento"
              name="fechaMantenimiento"
              value={formData.fechaMantenimiento ?? ""}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="fechaSiguienteMantenimiento">Próximo Mantenimiento</Label>
            <Input
              type="date"
              id="fechaSiguienteMantenimiento"
              name="fechaSiguienteMantenimiento"
              value={formData.fechaSiguienteMantenimiento ?? ""}
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
          {mantenimiento ? "Actualizar" : "Crear"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
