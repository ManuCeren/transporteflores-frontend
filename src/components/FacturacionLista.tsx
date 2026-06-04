import { useEffect, useState } from "react";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import { appsettings } from "../settings/appsettings";
import { DataTable } from "./DataTable";
import { FacturacionModal } from "./FacturacionModal";
import type { IFacturacion } from "../Interfaces/IFacturacion";
import type { ICliente } from "../Interfaces/ICliente";
import type { IUsuarioLogin } from "../Interfaces/IUsuarioLogin";

interface FacturacionListaProps {
  handleViewChange: (view: any) => void;
  usuario: IUsuarioLogin | null;
}

export function FacturacionLista({
  handleViewChange,
  usuario,
}: FacturacionListaProps) {
  const [facturaciones, setFacturaciones] = useState<IFacturacion[]>([]);
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFacturacion, setSelectedFacturacion] =
    useState<IFacturacion | undefined>();

  const puedeGestionar =
    usuario?.rol === "Administrador" || usuario?.rol === "Logistica";

  const obtenerFacturaciones = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Facturacion/Lista`);

      if (!response.ok) throw new Error("Error al obtener facturaciones");

      const rawData = await response.json();

      const data: IFacturacion[] = Array.isArray(rawData)
        ? rawData.map((item: any) => ({
            IdFacturacion: Number(item.idFacturacion) || 0,
            IdCliente: Number(item.idCliente) || 0,
            NombreCliente: String(item.nombreCliente || "Cliente Desconocido"),
            FechaFactura: String(item.fechaFactura || ""),
            MontoTotal: Number(item.montoTotal) || 0,
            EstadoPago: String(item.estadoPago || "Pendiente"),
            IdEnvio: Number(item.idEnvio) || 0,
          }))
        : [];

      const facturasFiltradas =
        usuario?.rol === "Cliente"
          ? data.filter((f) => f.IdCliente === usuario.idCliente)
          : data;

      setFacturaciones(facturasFiltradas);
    } catch (error) {
      console.error("Error al obtener facturaciones:", error);
    }
  };

  const obtenerClientes = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Cliente/Lista`);
      if (response.ok) setClientes(await response.json());
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const abrirModal = (facturacion?: IFacturacion) => {
    if (!puedeGestionar) return;
    setSelectedFacturacion(facturacion);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setSelectedFacturacion(undefined);
    setModalOpen(false);
  };

  const eliminarFacturacion = async (id: number | string) => {
    if (!puedeGestionar) return;

    const confirm = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      const response = await fetch(
        `${appsettings.apiUrl}Facturacion/Eliminar/${id}`,
        { method: "DELETE" }
      );

      if (response.ok) obtenerFacturaciones();
    }
  };

  const verDetalleFactura = async (factura: IFacturacion) => {
    try {
      const response = await fetch(
        `${appsettings.apiUrl}Facturacion/Detalle/${factura.IdFacturacion}`
      );

      if (!response.ok) throw new Error("No se pudo obtener el detalle");

      const detalle = await response.json();

      Swal.fire({
        title: `Factura #${detalle.idFacturacion}`,
        html: `
          <div style="text-align:left">
            <p><b>Cliente:</b> ${detalle.nombreCliente}</p>
            <p><b>Envío:</b> ${detalle.idEnvio}</p>
            <p><b>Fecha:</b> ${new Date(detalle.fechaFactura).toLocaleDateString()}</p>
            <p><b>Mercancía:</b> ${detalle.mercancia || "No especificada"}</p>
            <p><b>Peso:</b> ${detalle.pesoTotal ?? 0} kg</p>
            <p><b>Volumen:</b> ${detalle.volumenTotal ?? 0} m³</p>
            <p><b>Monto Total:</b> $${detalle.montoTotal}</p>
            <p><b>Estado:</b> ${detalle.estadoPago}</p>
          </div>
        `,
        icon: "info",
        confirmButtonText: "Cerrar",
      });
    } catch {
      Swal.fire("Error", "No se pudo cargar el detalle de la factura", "error");
    }
  };

  const descargarFactura = async (factura: IFacturacion) => {
    try {
      const response = await fetch(
        `${appsettings.apiUrl}Facturacion/Detalle/${factura.IdFacturacion}`
      );

      if (!response.ok) throw new Error("No se pudo obtener la factura");

      const detalle = await response.json();
      const ventana = window.open("", "_blank");
      if (!ventana) return;

      const destino = detalle.destino || "destino no especificado";
      const tipoServicio =
        destino.toLowerCase().includes("el salvador")
          ? `Carga general local `
          : `Carga general internacional `;

      ventana.document.write(`
        <html>
          <head>
            <title>Factura #${detalle.idFacturacion}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 35px;
                color: #222;
              }
              .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 3px solid #0b3d2e;
                padding-bottom: 15px;
                margin-bottom: 30px;
              }
              .logo {
                width: 160px;
              }
              .title {
                text-align: right;
                color: #0b3d2e;
              }
              .title h1 {
                margin: 0;
                font-size: 36px;
              }
              .section {
                margin-bottom: 25px;
              }
              .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
              }
              h3 {
                color: #0b3d2e;
                border-bottom: 1px solid #ddd;
                padding-bottom: 8px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
              }
              th {
                background: #0b3d2e;
                color: white;
                padding: 12px;
                text-align: left;
              }
              td {
                border: 1px solid #ddd;
                padding: 12px;
              }
              .estado {
                display: inline-block;
                background: #d8f3dc;
                color: #0b3d2e;
                padding: 5px 14px;
                border-radius: 20px;
                font-weight: bold;
              }
              .total-box {
                float: right;
                margin-top: 30px;
                border: 2px solid #0b3d2e;
                padding: 20px 35px;
                text-align: center;
              }
              .total-box h2 {
                margin: 5px 0 0;
                color: #0b3d2e;
              }
              .footer {
                clear: both;
                margin-top: 120px;
                text-align: center;
                color: #777;
                font-size: 13px;
                border-top: 1px solid #ddd;
                padding-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="/logo-flores.png" class="logo" />
              <div class="title">
                <h1>FACTURA</h1>
                <p>Sistema de Gestión de Envíos</p>
              </div>
            </div>

            <div class="grid section">
              <div>
                <h3>Información de Factura</h3>
                <p><b>Número:</b> #${String(detalle.idFacturacion).padStart(6, "0")}</p>
                <p><b>Fecha:</b> ${new Date(detalle.fechaFactura).toLocaleDateString()}</p>
                <p><b>Estado:</b> <span class="estado">${detalle.estadoPago}</span></p>
              </div>

              <div>
                <h3>Información del Cliente</h3>
                <p><b>Cliente:</b> ${detalle.nombreCliente}</p>
                <p><b>Fecha de emisión:</b> ${new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div class="section">
              <h3>Detalles del Servicio</h3>
              <table>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Peso</th>
                    <th>Volumen</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${tipoServicio}</td>
                    <td>${detalle.origen || "No especificado"}</td>
                    <td>${destino}</td>
                    <td>${detalle.pesoTotal ?? 0} kg</td>
                    <td>${detalle.volumenTotal ?? 0} m³</td>
                    <td>$${Number(detalle.montoTotal).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="total-box">
              <p>TOTAL A PAGAR</p>
              <h2>$${Number(detalle.montoTotal).toFixed(2)}</h2>
            </div>

            <div class="footer">
              <p>Gracias por confiar en Transportes Flores.</p>
              <p>Carga nacional e internacional.</p>
            </div>

            <script>
              window.onload = () => window.print();
            </script>
          </body>
        </html>
      `);

      ventana.document.close();
    } catch {
      Swal.fire("Error", "No se pudo descargar la factura", "error");
    }
  };

  useEffect(() => {
    obtenerFacturaciones();
    obtenerClientes();
  }, [usuario]);

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <h4 className="m-0">
          {usuario?.rol === "Cliente"
            ? "Mis Facturas"
            : "Lista de Facturaciones"}
        </h4>

        <div className="d-flex gap-2">
          <Button
            color="secondary"
            size="sm"
            onClick={() => handleViewChange("dashboard")}
          >
            <i className="bi bi-house-door me-2" />
            Inicio
          </Button>

          {puedeGestionar && (
            <Button color="success" size="sm" onClick={() => abrirModal()}>
              <i className="bi bi-plus-circle me-2" />
              Nueva Facturación
            </Button>
          )}
        </div>
      </div>

      <DataTable<IFacturacion>
        data={facturaciones}
        searchKeys={[
          "NombreCliente",
          "FechaFactura",
          "EstadoPago",
          "MontoTotal",
          "IdEnvio",
        ]}
        itemsPerPageOptions={[5, 10, 15]}
        defaultItemsPerPage={5}
        onEditar={puedeGestionar ? (factura) => abrirModal(factura) : undefined}
        onEliminar={puedeGestionar ? (id) => eliminarFacturacion(id) : undefined}
        columns={[
          { key: "NombreCliente", label: "Cliente" },
          { key: "IdEnvio", label: "Envío" },
          { key: "FechaFactura", label: "Fecha Factura" },
          { key: "MontoTotal", label: "Monto Total" },
          { key: "EstadoPago", label: "Estado Pago" },
          {
            key: "IdFacturacion",
            label: "Detalle / Descargar",
            render: (factura: IFacturacion) => (
              <div className="d-flex gap-2 justify-content-center">
                <Button
                  color="info"
                  size="sm"
                  onClick={() => verDetalleFactura(factura)}
                >
                  <i className="bi bi-eye" />
                </Button>

                <Button
                  color="primary"
                  size="sm"
                  onClick={() => descargarFactura(factura)}
                >
                  <i className="bi bi-file-earmark-pdf" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {puedeGestionar && (
        <FacturacionModal
          isOpen={modalOpen}
          toggle={cerrarModal}
          facturacion={selectedFacturacion}
          clientes={clientes}
          onSuccess={() => {
            cerrarModal();
            obtenerFacturaciones();
          }}
        />
      )}
    </div>
  );
}