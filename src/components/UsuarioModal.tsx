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
import type { IUsuario } from "../Interfaces/IUsuario";
import { appsettings } from "../settings/appsettings";

interface UsuarioModalProps {
  isOpen: boolean;
  toggle: () => void;
  usuario?: IUsuario;
  onSuccess: () => void;
}

export function UsuarioModal({
  isOpen,
  toggle,
  usuario,
  onSuccess,
}: UsuarioModalProps) {
  const [formData, setFormData] = useState<IUsuario>({
    idUsuarios: usuario?.idUsuarios ?? 0,
    nombreUsuario: usuario?.nombreUsuario ?? "",
    rol: usuario?.rol ?? "",
    contraseña: usuario?.contraseña ?? "",
    email: usuario?.email ?? "",
  });

  useEffect(() => {
    if (usuario) {
      setFormData({ ...usuario });
    } else {
      setFormData({
        idUsuarios: 0,
        nombreUsuario: "",
        rol: "",
        contraseña: "",
        email: "",
      });
    }
  }, [usuario, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const method = usuario ? "PUT" : "POST";
      const url = usuario
        ? `${appsettings.apiUrl}Usuario/Editar`
        : `${appsettings.apiUrl}Usuario/Nuevo`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          title: usuario ? "Usuario actualizado" : "Usuario creado",
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
        {usuario ? "Editar Usuario" : "Nuevo Usuario"}
      </ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="nombreUsuario">Nombre de Usuario</Label>
            <Input
              type="text"
              id="nombreUsuario"
              name="nombreUsuario"
              value={formData.nombreUsuario}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="email">Correo Electrónico</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="contraseña">Contraseña</Label>
            <Input
              type="password"
              id="contraseña"
              name="contraseña"
              value={formData.contraseña}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="rol">Rol</Label>
            <Input
              type="select"
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
            >
              <option value="">Seleccione...</option>
              <option value="Administrador">Administrador</option>
              <option value="Usuario">Usuario</option>
            </Input>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={toggle}>
          Cancelar
        </Button>
        <Button color="primary" onClick={handleSubmit}>
          {usuario ? "Actualizar" : "Crear"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
