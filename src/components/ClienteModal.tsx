// ClienteModal.tsx
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
import type { ICliente } from "../Interfaces/ICliente";
import { appsettings } from "../settings/appsettings";

interface ClienteModalProps {
  isOpen: boolean;
  toggle: () => void;
  cliente?: ICliente;
  onSuccess: () => void;
}

export function ClienteModal({
  isOpen,
  toggle,
  cliente,
  onSuccess,
}: ClienteModalProps) {
  const [formData, setFormData] = useState<ICliente>({
    idClientes: cliente?.idClientes ?? 0,
    nombreCliente: cliente?.nombreCliente ?? "",
    direccion: cliente?.direccion ?? "",
    telefono: cliente?.telefono ?? "",
    email: cliente?.email ?? "",
    tipoCliente: cliente?.tipoCliente ?? "",
  });

  useEffect(() => {
    if (cliente) {
      setFormData({ ...cliente });
    } else {
      setFormData({
        idClientes: 0,
        nombreCliente: "",
        direccion: "",
        telefono: "",
        email: "",
        tipoCliente: "",
      });
    }
  }, [cliente, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const method = cliente ? "PUT" : "POST";
      const url = cliente
        ? `${appsettings.apiUrl}Cliente/Editar`
        : `${appsettings.apiUrl}Cliente/Nuevo`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          title: cliente ? "Cliente actualizado" : "Cliente creado",
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
        {cliente ? "Editar Cliente" : "Nuevo Cliente"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="nombreCliente">Nombre</Label>
            <Input
              type="text"
              id="nombreCliente"
              name="nombreCliente"
              value={formData.nombreCliente}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="direccion">Dirección</Label>
            <Input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
            />
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
            <Label for="email">Correo</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="tipoCliente">Tipo de Cliente</Label>
            <Input
              type="select"
              id="tipoCliente"
              name="tipoCliente"
              value={formData.tipoCliente}
              onChange={handleChange}
            >
              <option value="">Seleccione...</option>
              <option value="Regular">Regular</option>
              <option value="Premium">Premium</option>
              <option value="VIP">VIP</option>
            </Input>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          {cliente ? "Actualizar" : "Crear"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
