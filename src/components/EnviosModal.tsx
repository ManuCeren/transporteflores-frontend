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
import type { IEnvios } from "../Interfaces/IEnvios";
import type { ICliente } from "../Interfaces/ICliente";
import type { IRuta } from "../Interfaces/IRuta";
import { appsettings } from "../settings/appsettings";

interface EnviosModalProps {
  isOpen: boolean;
  toggle: () => void;
  envio?: IEnvios;
  clientes: ICliente[];
  rutas: IRuta[];
  onSuccess: () => void;
}

interface IEstadoEnvio {
  idEstadoEnvio: number;
  nombreEstado: string;
}

interface IConductorSelect {
  idConductores: number;
  nombre: string;
}

type FormDataState = Omit<
  IEnvios,
  "pesoTotal" | "volumenTotal" | "CostoEnvio"
> & {
  pesoTotal: number | string;
  volumenTotal: number | string;
  CostoEnvio: number | string;
};

export function EnviosModal({
  isOpen,
  toggle,
  envio,
  clientes,
  rutas,
  onSuccess,
}: EnviosModalProps) {
  const obtenerFechaActual = () => {
    const fecha = new Date();
    return fecha.toISOString().split("T")[0];
  };

  const estadoInicial: FormDataState = {
    idCliente: 0,
    idRuta: 0,
    idConductor: 0,
    idEstadoEnvio: 0,
    fechaSolicitud: obtenerFechaActual(),
    fechaEntregaEsperada: obtenerFechaActual(),
    estado: "",
    mercancia: "",
    pesoTotal: 0,
    volumenTotal: 0,
    CostoEnvio: 0,
  };

  const [formData, setFormData] = useState<FormDataState>(estadoInicial);
  const [estados, setEstados] = useState<IEstadoEnvio[]>([]);
  const [conductores, setConductores] = useState<IConductorSelect[]>([]);

  const cargarEstados = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}EstadosEnvios`);
      if (response.ok) {
        const data = await response.json();
        setEstados(data);
      }
    } catch (error) {
      console.error("Error al cargar estados:", error);
    }
  };

  const cargarConductores = async () => {
    const response = await fetch(`${appsettings.apiUrl}Conductor/Lista`);
    if (response.ok) {
      const data = await response.json();
      setConductores(data);
    }
  };

  useEffect(() => {
    if (isOpen) {
      cargarEstados();
      cargarConductores();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (envio) {
      setFormData({
        idEnvios: envio.idEnvios,
        idCliente: envio.idCliente ?? 0,
        idRuta: envio.idRuta ?? 0,
        idConductor: envio.idConductor ?? 0,
        idEstadoEnvio: envio.idEstadoEnvio ?? 0,
        fechaSolicitud: envio.fechaSolicitud,
        fechaEntregaEsperada: envio.fechaEntregaEsperada,
        estado: "",
        mercancia: envio.mercancia ?? "",
        pesoTotal: envio.pesoTotal ?? 0,
        volumenTotal: envio.volumenTotal ?? 0,
        CostoEnvio: envio.CostoEnvio ?? 0,
      });
    } else {
      setFormData({
        ...estadoInicial,
        fechaSolicitud: obtenerFechaActual(),
        fechaEntregaEsperada: obtenerFechaActual(),
      });
    }
  }, [envio, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    const camposNumericos = [
      "idCliente",
      "idRuta",
      "idConductor",
      "idEstadoEnvio",
    ];

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? ""
            : Number(value)
          : camposNumericos.includes(name)
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.idCliente || !formData.idRuta || !formData.idEstadoEnvio) {
      Swal.fire(
        "Error",
        "Debe seleccionar cliente, ruta y estado del envío.",
        "error"
      );
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        idCliente: formData.idCliente === 0 ? null : formData.idCliente,
        idRuta: formData.idRuta === 0 ? null : formData.idRuta,
        idConductor:
          formData.idConductor === 0 ? null : formData.idConductor,
        idEstadoEnvio:
          formData.idEstadoEnvio === 0 ? null : formData.idEstadoEnvio,
        estado: "",
        pesoTotal:
          formData.pesoTotal === "" ? 0 : Number(formData.pesoTotal),
        volumenTotal:
          formData.volumenTotal === "" ? 0 : Number(formData.volumenTotal),
        CostoEnvio:
          formData.CostoEnvio === "" ? 0 : Number(formData.CostoEnvio),
      };

      const method = formData.idEnvios ? "PUT" : "POST";
      const url =
        method === "PUT"
          ? `${appsettings.apiUrl}Envio/Editar`
          : `${appsettings.apiUrl}Envio/Nuevo`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        Swal.fire({
          title: method === "PUT" ? "Envío actualizado" : "Envío creado",
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
        {formData.idEnvios ? "Editar Envío" : "Nuevo Envío"}
      </ModalHeader>

      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="idCliente">Cliente</Label>
            <Input
              type="select"
              id="idCliente"
              name="idCliente"
              value={formData.idCliente}
              onChange={handleChange}
            >
              <option value={0}>Seleccione...</option>
              {clientes.map((c) => (
                <option key={c.idClientes} value={c.idClientes}>
                  {c.nombreCliente}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="idRuta">Ruta</Label>
            <Input
              type="select"
              id="idRuta"
              name="idRuta"
              value={formData.idRuta}
              onChange={handleChange}
            >
              <option value={0}>Seleccione...</option>
              {rutas.map((r) => (
                <option key={r.idRutas} value={r.idRutas}>
                  {r.origen} - {r.destino}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="idConductor">Conductor</Label>
            <Input
              type="select"
              id="idConductor"
              name="idConductor"
              value={formData.idConductor ?? 0}
              onChange={handleChange}
            >
              <option value={0}>Seleccione...</option>
              {conductores.map((c) => (
                <option key={c.idConductores} value={c.idConductores}>
                  {c.nombre}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="fechaSolicitud">Fecha Solicitud</Label>
            <Input
              type="date"
              id="fechaSolicitud"
              name="fechaSolicitud"
              value={formData.fechaSolicitud}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="fechaEntregaEsperada">Fecha Entrega Esperada</Label>
            <Input
              type="date"
              id="fechaEntregaEsperada"
              name="fechaEntregaEsperada"
              value={formData.fechaEntregaEsperada}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="idEstadoEnvio">Estado</Label>
            <Input
              type="select"
              id="idEstadoEnvio"
              name="idEstadoEnvio"
              value={formData.idEstadoEnvio ?? 0}
              onChange={handleChange}
            >
              <option value={0}>Seleccione...</option>
              {estados.map((estado) => (
                <option
                  key={estado.idEstadoEnvio}
                  value={estado.idEstadoEnvio}
                >
                  {estado.nombreEstado}
                </option>
              ))}
            </Input>
          </FormGroup>

          <FormGroup>
            <Label for="mercancia">Mercancía</Label>
            <Input
              type="text"
              id="mercancia"
              name="mercancia"
              value={formData.mercancia}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="pesoTotal">Peso Total (kg)</Label>
            <Input
              type="number"
              step="0.01"
              id="pesoTotal"
              name="pesoTotal"
              value={formData.pesoTotal}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="volumenTotal">Volumen Total (m³)</Label>
            <Input
              type="number"
              step="0.01"
              id="volumenTotal"
              name="volumenTotal"
              value={formData.volumenTotal}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label for="CostoEnvio">Costo Envío</Label>
            <Input
              type="number"
              step="0.01"
              id="CostoEnvio"
              name="CostoEnvio"
              value={formData.CostoEnvio}
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
          {formData.idEnvios ? "Actualizar" : "Crear"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}