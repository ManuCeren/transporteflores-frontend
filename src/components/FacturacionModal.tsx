import React, { useState, useEffect } from "react";
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
  Row,
  Col,
  Alert,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { appsettings } from "../settings/appsettings";
import type { IFacturacion } from "../Interfaces/IFacturacion";
import type { ICliente } from "../Interfaces/ICliente";
import type { IVistaEnvio } from "../Interfaces/IVistaEnvio"; 
import Swal from "sweetalert2";

interface FacturacionModalProps {
  isOpen: boolean;
  toggle: () => void;
  facturacion?: IFacturacion;
  clientes: ICliente[];
  onSuccess: () => void;
}

export function FacturacionModal({
  isOpen,
  toggle,
  facturacion,
  clientes,
  onSuccess,
}: FacturacionModalProps) {
  
  const [idCliente, setIdCliente] = useState<number>(0);
  const [fechaFactura, setFechaFactura] = useState<string>("");
  const [montoTotal, setMontoTotal] = useState<number>(0);
  const [estadoPago, setEstadoPago] = useState<string>("Pendiente");
  const [idEnvio, setIdEnvio] = useState<number>(0);

  const [envios, setEnvios] = useState<IVistaEnvio[]>([]); // ⭐ Usar IVistaEnvio
  const [enviosFiltrados, setEnviosFiltrados] = useState<IVistaEnvio[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ICliente | null>(null);

  const esEdicion: boolean = !!facturacion;

  
  const obtenerEnvios = async (): Promise<void> => {
    try {
      const response = await fetch(`${appsettings.apiUrl}VistaEnvio/Lista`); // ⭐ Mismo endpoint
      if (response.ok) {
        const data = await response.json();
        
        
        const enviosLimpios: IVistaEnvio[] = Array.isArray(data) 
          ? data.map((e: any) => ({
              idEnvios: Number(e.idEnvios) || 0,
              idCliente: Number(e.idCliente) || 0,
              idRuta: Number(e.idRuta) || 0,
              fechaSolicitud: String(e.fechaSolicitud || ""),
              fechaEntregaEsperada: String(e.fechaEntregaEsperada || ""),
              estado: String(e.estado || ""),
              mercancia: String(e.mercancia || ""),
              peso: Number(e.peso) || 0,
              volumen: Number(e.volumen) || 0,
              cliente: String(e.cliente || "Desconocido"),
              origen: String(e.origen || "Desconocido"),
              destino: String(e.destino || "Desconocido"),
              costo: Number(e.costo) || 0, // ⭐ Campo costo como en EnviosLista
            }))
          : [];
        
        setEnvios(enviosLimpios);
      } else {
        setEnvios([]);
      }
    } catch (error) {
      console.error("Error al obtener envíos:", error);
      setEnvios([]);
    }
  };

  
  const filtrarEnviosPorCliente = (clienteId: number): void => {
    if (clienteId <= 0) {
      setEnviosFiltrados([]);
      setIdEnvio(0);
      setMontoTotal(0);
      return;
    }

    const enviosDelCliente: IVistaEnvio[] = envios.filter(
      (envio) => envio.idCliente === clienteId
    );
    setEnviosFiltrados(enviosDelCliente);

    
    if (enviosDelCliente.length === 1) {
      const primerEnvio = enviosDelCliente[0];
      setIdEnvio(primerEnvio.idEnvios);
      setMontoTotal(primerEnvio.costo); // ⭐ Usar campo costo
    } else {
      setIdEnvio(0);
      setMontoTotal(0);
    }
  };

  
  const calcularCostoEnvio = (envioId: number): void => {
    if (envioId <= 0) {
      setMontoTotal(0);
      return;
    }
    
    const envioSeleccionado: IVistaEnvio | undefined = envios.find(
      (e) => e.idEnvios === envioId
    );
    
    if (envioSeleccionado) {
      setMontoTotal(envioSeleccionado.costo); 
    }
  };

  
  const resetForm = (): void => {
    const fechaHoy: string = new Date().toISOString().split('T')[0];
    
    setIdCliente(0);
    setFechaFactura(fechaHoy);
    setMontoTotal(0);
    setEstadoPago("Pendiente");
    setIdEnvio(0);
    setClienteSeleccionado(null);
    setEnviosFiltrados([]);
    setError("");
  };

 
  useEffect(() => {
    if (isOpen) {
      obtenerEnvios();
      
      if (esEdicion && facturacion) {
        setIdCliente(Number(facturacion.IdCliente) || 0);
        setFechaFactura(facturacion.FechaFactura ? facturacion.FechaFactura.split('T')[0] : "");
        setMontoTotal(Number(facturacion.MontoTotal) || 0);
        setEstadoPago(String(facturacion.EstadoPago) || "Pendiente");
        setIdEnvio(Number(facturacion.IdEnvio) || 0);

        const cliente: ICliente | undefined = clientes.find(
          (c) => c.idClientes === facturacion.IdCliente
        );
        setClienteSeleccionado(cliente || null);
      } else {
        resetForm();
      }
    }
  }, [isOpen, esEdicion, facturacion, clientes]);

  
  useEffect(() => {
    if (idCliente > 0) {
      filtrarEnviosPorCliente(idCliente);
    }
  }, [idCliente, envios]);

  
  const handleClienteChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const clienteId: number = Number(e.target.value) || 0;
    setIdCliente(clienteId);
    
    const cliente: ICliente | undefined = clientes.find(
      (c) => c.idClientes === clienteId
    );
    setClienteSeleccionado(cliente || null);
    
    // Reset otros campos
    setIdEnvio(0);
    setMontoTotal(0);
    setError("");
  };

  
  const handleEnvioChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const envioId: number = Number(e.target.value) || 0;
    setIdEnvio(envioId);
    
   
    if (envioId > 0) {
      calcularCostoEnvio(envioId);
    }
    setError("");
  };

 
  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFechaFactura(e.target.value);
    setError("");
  };

  
  const handleEstadoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEstadoPago(e.target.value);
    setError("");
  };

 
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setMontoTotal(Number(e.target.value) || 0);
    setError("");
  };

  
  const validarFormulario = (): boolean => {
    if (idCliente <= 0) {
      setError("Debe seleccionar un cliente");
      return false;
    }
    if (!fechaFactura.trim()) {
      setError("Debe ingresar una fecha de factura");
      return false;
    }
    if (montoTotal <= 0) {
      setError("El monto total debe ser mayor que cero");
      return false;
    }
    if (idEnvio <= 0) {
      setError("Debe seleccionar un envío");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!validarFormulario()) return;

    setLoading(true);
    setError("");

    try {
      const url: string = esEdicion
        ? `${appsettings.apiUrl}Facturacion/Editar`
        : `${appsettings.apiUrl}Facturacion/Nuevo`;

      const body = esEdicion
        ? {
            IdFacturacion: facturacion!.IdFacturacion,
            IdCliente: idCliente,
            FechaFactura: fechaFactura,
            MontoTotal: montoTotal,
            EstadoPago: estadoPago,
            IdEnvio: idEnvio
          }
        : {
            IdCliente: idCliente,
            FechaFactura: fechaFactura,
            MontoTotal: montoTotal,
            EstadoPago: estadoPago,
            IdEnvio: idEnvio
          };

      const response = await fetch(url, {
        method: esEdicion ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await Swal.fire({
          title: "¡Éxito!",
          text: `Facturación ${esEdicion ? "actualizada" : "creada"} correctamente`,
          icon: "success",
        });
        onSuccess();
      } else {
        const errorData: string = await response.text();
        setError(`Error al ${esEdicion ? "actualizar" : "crear"} la facturación: ${errorData}`);
      }
    } catch (error) {
      console.error("Error:", error);
      setError(`Error al ${esEdicion ? "actualizar" : "crear"} la facturación`);
    } finally {
      setLoading(false);
    }
  };

  
  const envioSeleccionado: IVistaEnvio | undefined = envios.find(
    (e) => e.idEnvios === idEnvio
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" backdrop="static">
      <ModalHeader toggle={toggle}>
        <i className="bi bi-receipt me-2" />
        {esEdicion ? "Editar Facturación" : "Nueva Facturación"}
      </ModalHeader>

      <Form onSubmit={handleSubmit}>
        <ModalBody>
          {error && <Alert color="danger">{error}</Alert>}

          <Row>
            
            <Col md={6}>
              <FormGroup>
                <Label for="IdCliente">
                  <i className="bi bi-person me-1" />
                  Cliente *
                </Label>
                <Input
                  type="select"
                  name="IdCliente"
                  id="IdCliente"
                  value={idCliente}
                  onChange={handleClienteChange}
                  required
                >
                  <option value={0}>Seleccione un cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.idClientes} value={cliente.idClientes}>
                      {cliente.nombreCliente}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </Col>

            <Col md={6}>
              <FormGroup>
                <Label for="FechaFactura">
                  <i className="bi bi-calendar me-1" />
                  Fecha de Factura *
                </Label>
                <Input
                  type="date"
                  name="FechaFactura"
                  id="FechaFactura"
                  value={fechaFactura}
                  onChange={handleFechaChange}
                  required
                />
              </FormGroup>
            </Col>
          </Row>

          {clienteSeleccionado && (
            <Alert color="info">
              <strong>Cliente seleccionado:</strong> {clienteSeleccionado.nombreCliente}
              <br />
              <small>Envíos disponibles: {enviosFiltrados.length}</small>
            </Alert>
          )}

          <Row>
           
            <Col md={8}>
              <FormGroup>
                <Label for="IdEnvio">
                  <i className="bi bi-box-seam me-1" />
                  Envío *
                </Label>
                <Input
                  type="select"
                  name="IdEnvio"
                  id="IdEnvio"
                  value={idEnvio}
                  onChange={handleEnvioChange}
                  disabled={idCliente === 0}
                  required
                >
                  <option value={0}>
                    {idCliente === 0 
                      ? "Primero seleccione un cliente..." 
                      : "Seleccione un envío..."
                    }
                  </option>
                  {enviosFiltrados.map((envio) => (
                    <option key={envio.idEnvios} value={envio.idEnvios}>
                      #{envio.idEnvios} - {envio.mercancia} - {envio.origen} → {envio.destino} (${envio.costo.toFixed(2)})
                    </option>
                  ))}
                </Input>
                {idCliente > 0 && enviosFiltrados.length === 0 && (
                  <small className="text-muted">
                    No hay envíos disponibles para este cliente
                  </small>
                )}
              </FormGroup>
            </Col>

            <Col md={4}>
              <FormGroup>
                <Label for="EstadoPago">
                  <i className="bi bi-credit-card me-1" />
                  Estado de Pago *
                </Label>
                <Input
                  type="select"
                  name="EstadoPago"
                  id="EstadoPago"
                  value={estadoPago}
                  onChange={handleEstadoChange}
                  required
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                  <option value="Vencido">Vencido</option>
                  <option value="Cancelado">Cancelado</option>
                </Input>
              </FormGroup>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <FormGroup>
                <Label for="MontoTotal">
                  <i className="bi bi-currency-dollar me-1" />
                  Monto Total *
                </Label>
                <InputGroup>
                  <InputGroupText>$</InputGroupText>
                  <Input
                    type="number"
                    name="MontoTotal"
                    id="MontoTotal"
                    value={montoTotal}
                    onChange={handleMontoChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </InputGroup>
                <small className="text-success">
                  ✅ Se calcula automáticamente del costo del envío seleccionado
                </small>
              </FormGroup>
            </Col>

            {envioSeleccionado && (
              <Col md={6}>
                <Alert color="success">
                  <strong>📦 Envío #{envioSeleccionado.idEnvios}</strong>
                  <br />
                  <small>
                    <strong>Mercancía:</strong> {envioSeleccionado.mercancia}
                    <br />
                    <strong>Ruta:</strong> {envioSeleccionado.origen} → {envioSeleccionado.destino}
                    <br />
                    <strong>Estado:</strong> {envioSeleccionado.estado}
                    <br />
                    <strong>💰 Costo:</strong> <span className="fw-bold">${envioSeleccionado.costo.toFixed(2)}</span>
                  </small>
                </Alert>
              </Col>
            )}
          </Row>
        </ModalBody>

        <ModalFooter>
          <Button type="button" color="secondary" onClick={toggle} disabled={loading}>
            <i className="bi bi-x-circle me-2" />
            Cancelar
          </Button>
          <Button type="submit" color="primary" disabled={loading}>
            <i className={`bi ${loading ? 'bi-hourglass-split' : esEdicion ? 'bi-pencil' : 'bi-plus-circle'} me-2`} />
            {loading ? "Procesando..." : esEdicion ? "Actualizar" : "Crear Facturación"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}