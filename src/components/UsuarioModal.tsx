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

interface ICliente {
  idClientes: number;
  nombreCliente: string;
}

interface IConductor {
  idConductores: number;
  nombre: string;
}

export function UsuarioModal({
  isOpen,
  toggle,
  usuario,
  onSuccess,
}: UsuarioModalProps) {
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [conductores, setConductores] = useState<IConductor[]>([]);

  const [formData, setFormData] = useState<IUsuario>({
    idUsuarios: usuario?.idUsuarios ?? 0,
    nombreUsuario: usuario?.nombreUsuario ?? "",
    rol: usuario?.rol ?? "",
    contrasena: usuario?.contrasena ?? "",
    email: usuario?.email ?? "",
    idCliente: usuario?.idCliente ?? null,
    idConductor: usuario?.idConductor ?? null,
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [clientesRes, conductoresRes] = await Promise.all([
          fetch(`${appsettings.apiUrl}Cliente/Lista`),
          fetch(`${appsettings.apiUrl}Conductor/Lista`),
        ]);

        if (clientesRes.ok) {
          const clientesData = await clientesRes.json();
          setClientes(clientesData);
        }

        if (conductoresRes.ok) {
          const conductoresData = await conductoresRes.json();
          setConductores(conductoresData);
        }
      } catch (error) {
        console.error("Error cargando clientes/conductores:", error);
      }
    };

    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  useEffect(() => {
    if (usuario) {
      setFormData({
        ...usuario,
        contrasena: "",
        idCliente: usuario.idCliente ?? null,
        idConductor: usuario.idConductor ?? null,
      });
    } else {
      setFormData({
        idUsuarios: 0,
        nombreUsuario: "",
        rol: "",
        contrasena: "",
        email: "",
        idCliente: null,
        idConductor: null,
      });
    }
  }, [usuario, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "rol") {
      setFormData((prev) => ({
        ...prev,
        rol: value,
        idCliente: value === "Cliente" ? prev.idCliente : null,
        idConductor: value === "Conductor" ? prev.idConductor : null,
      }));
      return;
    }

    if (name === "idCliente" || name === "idConductor") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? null : Number(value),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validarFormulario = () => {
    if (!formData.nombreUsuario.trim()) {
      Swal.fire("Validación", "Ingrese el nombre de usuario.", "warning");
      return false;
    }

    if (!formData.email.trim()) {
      Swal.fire("Validación", "Ingrese el correo electrónico.", "warning");
      return false;
    }

    if (!usuario && !formData.contrasena.trim()) {
      Swal.fire("Validación", "Ingrese la contraseña.", "warning");
      return false;
    }

    if (!formData.rol) {
      Swal.fire("Validación", "Seleccione un rol.", "warning");
      return false;
    }

    if (formData.rol === "Cliente" && !formData.idCliente) {
      Swal.fire("Validación", "Seleccione el cliente asociado.", "warning");
      return false;
    }

    if (formData.rol === "Conductor" && !formData.idConductor) {
      Swal.fire("Validación", "Seleccione el conductor asociado.", "warning");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    try {
      const method = usuario ? "PUT" : "POST";
      const url = usuario
        ? `${appsettings.apiUrl}Usuario/Editar`
        : `${appsettings.apiUrl}Usuario/Nuevo`;

      const dataEnviar = {
        ...formData,
        idCliente: formData.rol === "Cliente" ? formData.idCliente : null,
        idConductor: formData.rol === "Conductor" ? formData.idConductor : null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataEnviar),
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
            <Label for="contrasena">
              Contraseña {usuario && "(dejar vacío si no desea cambiarla)"}
            </Label>
            <Input
              type="password"
              id="contrasena"
              name="contrasena"
              value={formData.contrasena}
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
              <option value="Logistica">Logistica</option>
              <option value="Conductor">Conductor</option>
              <option value="Cliente">Cliente</option>
            </Input>
          </FormGroup>

          {formData.rol === "Cliente" && (
            <FormGroup>
              <Label for="idCliente">Cliente asociado</Label>
              <Input
                type="select"
                id="idCliente"
                name="idCliente"
                value={formData.idCliente ?? ""}
                onChange={handleChange}
              >
                <option value="">Seleccione un cliente...</option>
                {clientes.map((cliente) => (
                  <option key={cliente.idClientes} value={cliente.idClientes}>
                    {cliente.nombreCliente}
                  </option>
                ))}
              </Input>
            </FormGroup>
          )}

          {formData.rol === "Conductor" && (
            <FormGroup>
              <Label for="idConductor">Conductor asociado</Label>
              <Input
                type="select"
                id="idConductor"
                name="idConductor"
                value={formData.idConductor ?? ""}
                onChange={handleChange}
              >
                <option value="">Seleccione un conductor...</option>
                {conductores.map((conductor) => (
                  <option
                    key={conductor.idConductores}
                    value={conductor.idConductores}
                  >
                    {conductor.nombre}
                  </option>
                ))}
              </Input>
            </FormGroup>
          )}
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