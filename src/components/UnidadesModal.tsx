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
import type { IUnidades } from "../Interfaces/IUnidades";
import { appsettings } from "../settings/appsettings";

interface UnidadesModalProps {
  isOpen: boolean;
  toggle: () => void;
  unidad?: IUnidades;
  onSuccess: () => void;
}

export function UnidadesModal({
  isOpen,
  toggle,
  unidad,
  onSuccess,
}: UnidadesModalProps) {
  const [formData, setFormData] = useState<IUnidades>({
    idUnidades: unidad?.idUnidades ?? 0,
    tipoUnidad: unidad?.tipoUnidad ?? "",
    placa: unidad?.placa ?? "",
    marca: unidad?.marca ?? "",
    modelo: unidad?.modelo ?? "",
    año: unidad?.año ?? new Date().getFullYear(),
    estado: unidad?.estado ?? "",
    kilometrajeActual: unidad?.kilometrajeActual ?? 0,
  });

  useEffect(() => {
    if (unidad) {
      setFormData({ ...unidad });
    } else {
      setFormData({
        idUnidades: 0,
        tipoUnidad: "",
        placa: "",
        marca: "",
        modelo: "",
        año: new Date().getFullYear(),
        estado: "",
        kilometrajeActual: 0,
      });
    }
  }, [unidad, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const method = unidad ? "PUT" : "POST";
      const url = unidad
        ? `${appsettings.apiUrl}Unidades/Editar`
        : `${appsettings.apiUrl}Unidades/Nueva`;

      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (resp.ok) {
        Swal.fire({
          title: unidad ? "Unidad actualizada" : "Unidad creada",
          icon: "success",
        });
        onSuccess();
        toggle();
      } else {
        const text = await resp.text();
        Swal.fire("Error", text, "error");
      }
    } catch (err) {
      Swal.fire("Error", String(err), "error");
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>
        {unidad ? "Editar Unidad" : "Nueva Unidad"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="tipoUnidad">Tipo de Unidad</Label>
            <Input
              type="text"
              id="tipoUnidad"
              name="tipoUnidad"
              value={formData.tipoUnidad}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="placa">Placa</Label>
            <Input
              type="text"
              id="placa"
              name="placa"
              value={formData.placa}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="marca">Marca</Label>
            <Input
              type="text"
              id="marca"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="modelo">Modelo</Label>
            <Input
              type="text"
              id="modelo"
              name="modelo"
              value={formData.modelo}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="año">Año</Label>
            <Input
              type="number"
              id="año"
              name="año"
              value={formData.año}
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
              <option value="">Seleccione...</option>
              <option value="Disponible">Disponible</option>
              <option value="En Ruta">En Ruta</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="kilometrajeActual">Kilometraje Actual (km)</Label>
            <Input
              type="number"
              id="kilometrajeActual"
              name="kilometrajeActual"
              value={formData.kilometrajeActual}
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
          {unidad ? "Actualizar" : "Crear"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
