import { useEffect, useState } from "react";
import { appsettings } from "../settings/appsettings";
import type { IVistaEnvio } from "../Interfaces/IVistaEnvio";
import type { IEnvios } from "../Interfaces/IEnvios";
import type { ICliente } from "../Interfaces/ICliente";
import type { IRuta } from "../Interfaces/IRuta";
import type { IUsuarioLogin } from "../Interfaces/IUsuarioLogin";
import { EnviosModal } from "./EnviosModal";
import { Button } from "reactstrap";
import Swal from "sweetalert2";
import { DataTable } from "./DataTable";

interface EnviosListaProps {
  handleViewChange: (view: any, idRuta?: number) => void;
  usuario: IUsuarioLogin | null;
}

interface IEstadoEnvio {
  idEstadoEnvio: number;
  nombreEstado: string;
}

interface IVistaEnvioParaTabla extends IVistaEnvio {
  origenCorto: string;
  destinoCorto: string;
  rutaResumen: string;
  conductor?: string;
}

const acortarNombreLugar = (nombreCompleto: string): string => {
  if (!nombreCompleto) return "No especificado";

  const partes = nombreCompleto.split(", ");
  const indexElSalvador = partes.findIndex((parte) =>
    parte.includes("El Salvador")
  );

  if (indexElSalvador >= 2) {
    const ciudad = partes[indexElSalvador - 2];
    const departamento = partes[indexElSalvador - 1].replace(
      "Departamento de ",
      ""
    );
    return `${ciudad}, ${departamento}`;
  }

  if (partes.length >= 2) return `${partes[0]}, ${partes[1]}`;

  return nombreCompleto.length > 25
    ? nombreCompleto.substring(0, 22) + "..."
    : nombreCompleto;
};

export function EnviosLista({ handleViewChange, usuario }: EnviosListaProps) {
  const [envios, setEnvios] = useState<IVistaEnvio[]>([]);
  const [enviosParaTabla, setEnviosParaTabla] = useState<IVistaEnvioParaTabla[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEnvio, setSelectedEnvio] = useState<IEnvios | undefined>();
  const [clientes, setClientes] = useState<ICliente[]>([]);
  const [rutas, setRutas] = useState<IRuta[]>([]);
  const [estados, setEstados] = useState<IEstadoEnvio[]>([]);

  const puedeGestionar =
    usuario?.rol === "Administrador" || usuario?.rol === "Logistica";

  const puedeCambiarEstado =
    usuario?.rol === "Administrador" ||
    usuario?.rol === "Logistica" ||
    usuario?.rol === "Conductor";

  const obtenerClientes = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Cliente/Lista`);
      if (response.ok) setClientes(await response.json());
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
  };

  const obtenerRutas = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Ruta/Lista`);
      if (response.ok) setRutas(await response.json());
    } catch (error) {
      console.error("Error al obtener rutas:", error);
    }
  };

  const obtenerEstados = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}EstadosEnvios`);
      if (response.ok) setEstados(await response.json());
    } catch (error) {
      console.error("Error al obtener estados:", error);
    }
  };

  const obtenerEnvios = async () => {
    try {
      const response = await fetch(`${appsettings.apiUrl}Envio/VistaDetallada`);

      if (response.ok) {
        const data: IVistaEnvio[] = await response.json();

        let dataFiltrada = data;

        if (usuario?.rol === "Cliente") {
          dataFiltrada = data.filter((e) => e.idCliente === usuario.idCliente);
        }

        if (usuario?.rol === "Conductor") {
          dataFiltrada = data.filter(
            (e) => e.idConductor === usuario.idConductor
          );
        }

        const enviosLimpios = dataFiltrada.map((e: any) => ({
          idEnvios: e.idEnvios,
          idCliente: e.idCliente,
          idRuta: e.idRuta,
          idConductor: e.idConductor,
          idEstadoEnvio: e.idEstadoEnvio,
          fechaSolicitud: e.fechaSolicitud ?? "",
          fechaEntregaEsperada: e.fechaEntregaEsperada ?? "",
          estado: e.estado ?? "",
          mercancia: e.mercancia ?? "",
          peso: e.peso ?? 0,
          volumen: e.volumen ?? 0,
          cliente: e.cliente ?? "Desconocido",
          origen: e.origen ?? "Desconocido",
          destino: e.destino ?? "Desconocido",
          costo: e.costo ?? 0,
          conductor: e.conductor ?? e.nombreConductor ?? "Sin asignar",
        }));

        setEnvios(enviosLimpios);

        const tabla: IVistaEnvioParaTabla[] = enviosLimpios.map((envio: any) => {
          const origenCorto = acortarNombreLugar(envio.origen);
          const destinoCorto = acortarNombreLugar(envio.destino);

          return {
            ...envio,
            origenCorto,
            destinoCorto,
            rutaResumen: `${origenCorto} → ${destinoCorto}`,
          };
        });

        setEnviosParaTabla(tabla);
      }
    } catch (error) {
      console.error("Error al obtener envíos:", error);
    }
  };

  const convertirVistaEnvioAEnvios = (vistaEnvio: IVistaEnvio): IEnvios => {
    const formatearFecha = (fecha: string): string => {
      if (!fecha) return "";
      try {
        return new Date(fecha).toISOString().split("T")[0];
      } catch {
        return fecha;
      }
    };

    return {
      idEnvios: vistaEnvio.idEnvios,
      idCliente: vistaEnvio.idCliente,
      idRuta: vistaEnvio.idRuta,
      idConductor: vistaEnvio.idConductor,
      idEstadoEnvio: vistaEnvio.idEstadoEnvio,
      fechaSolicitud: formatearFecha(vistaEnvio.fechaSolicitud),
      fechaEntregaEsperada: formatearFecha(vistaEnvio.fechaEntregaEsperada),
      estado: "",
      mercancia: vistaEnvio.mercancia,
      pesoTotal: vistaEnvio.peso,
      volumenTotal: vistaEnvio.volumen,
      CostoEnvio: vistaEnvio.costo,
    };
  };

  const verDetalleEnvio = (envio: IVistaEnvioParaTabla) => {
    Swal.fire({
      title: `Detalle del Envío #${envio.idEnvios}`,
      html: `
        <div style="text-align:left">
          <p><b>Cliente:</b> ${envio.cliente}</p>
          <p><b>Conductor:</b> ${envio.conductor ?? "Sin asignar"}</p>
          <p><b>Estado:</b> ${envio.estado}</p>
          <hr/>
          <p><b>Origen:</b> ${envio.origen}</p>
          <p><b>Destino:</b> ${envio.destino}</p>
          <p><b>Fecha solicitud:</b> ${new Date(envio.fechaSolicitud).toLocaleDateString()}</p>
          <p><b>Fecha entrega esperada:</b> ${new Date(envio.fechaEntregaEsperada).toLocaleDateString()}</p>
          <hr/>
          <p><b>Mercancía:</b> ${envio.mercancia}</p>
          <p><b>Peso:</b> ${envio.peso} kg</p>
          <p><b>Volumen:</b> ${envio.volumen} m³</p>
          <p><b>Costo:</b> $${envio.costo}</p>
        </div>
      `,
      icon: "info",
      confirmButtonText: "Cerrar",
      width: 650,
    });
  };

  const cambiarEstado = async (envio: IVistaEnvioParaTabla) => {
    if (!puedeCambiarEstado) return;

    const opciones: Record<string, string> = {};

    estados.forEach((estado) => {
      opciones[String(estado.idEstadoEnvio)] = estado.nombreEstado;
    });

    const result = await Swal.fire({
      title: "Cambiar estado del envío",
      input: "select",
      inputOptions: opciones,
      inputValue: String(envio.idEstadoEnvio ?? ""),
      inputPlaceholder: "Seleccione un estado",
      showCancelButton: true,
      confirmButtonText: "Actualizar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed || !result.value) return;

    const envioActualizado = {
      idEnvios: envio.idEnvios,
      idCliente: envio.idCliente ?? null,
      idRuta: envio.idRuta ?? null,
      idConductor: envio.idConductor ?? null,
      idEstadoEnvio: Number(result.value),
      fechaSolicitud: envio.fechaSolicitud,
      fechaEntregaEsperada: envio.fechaEntregaEsperada,
      estado: "",
      mercancia: envio.mercancia,
      pesoTotal: envio.peso,
      volumenTotal: envio.volumen,
      costoEnvio: envio.costo,
    };

    const response = await fetch(`${appsettings.apiUrl}Envio/Editar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envioActualizado),
    });

    if (response.ok) {
      Swal.fire("Actualizado", "El estado del envío fue actualizado.", "success");
      obtenerEnvios();
    } else {
      const text = await response.text();
      Swal.fire("Error", text, "error");
    }
  };

  const eliminarEnvio = async (id: number | string) => {
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
      const response = await fetch(`${appsettings.apiUrl}Envio/Eliminar/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        obtenerEnvios();
        Swal.fire("Eliminado", "El envío fue eliminado correctamente.", "success");
      } else {
        Swal.fire("Error", "No se pudo eliminar el envío.", "error");
      }
    }
  };

  const abrirModal = (envioTabla?: IVistaEnvioParaTabla) => {
    if (!puedeGestionar) return;

    if (envioTabla) {
      const envioOriginal = envios.find((e) => e.idEnvios === envioTabla.idEnvios);
      if (envioOriginal) {
        setSelectedEnvio(convertirVistaEnvioAEnvios(envioOriginal));
      }
    } else {
      setSelectedEnvio(undefined);
    }

    setModalOpen(true);
  };

  const cerrarModal = () => {
    setSelectedEnvio(undefined);
    setModalOpen(false);
  };

  const renderEstado = (estado: string) => {
    let color = "secondary";

    if (estado === "Pendiente") color = "secondary";
    if (estado === "En Ruta") color = "warning";
    if (estado === "Finalizado") color = "success";
    if (estado === "Cancelado") color = "danger";

    return <span className={`badge bg-${color}`}>{estado}</span>;
  };

  useEffect(() => {
    obtenerEnvios();
    obtenerClientes();
    obtenerRutas();
    obtenerEstados();
  }, [usuario]);

  return (
    <div className="mt-2">
      <div className="d-flex justify-content-between align-items-center mb-3 px-3">
        <h4 className="m-0">
          {usuario?.rol === "Conductor"
            ? "Mis Envíos Asignados"
            : usuario?.rol === "Cliente"
            ? "Mis Envíos"
            : "Lista de Envíos"}
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
              Nuevo Envío
            </Button>
          )}
        </div>
      </div>

      <DataTable<IVistaEnvioParaTabla>
        data={enviosParaTabla}
        searchKeys={[
          "cliente",
          "rutaResumen",
          "conductor",
          "estado",
          "fechaSolicitud",
          "mercancia",
        ]}
        itemsPerPageOptions={[5, 10, 15]}
        defaultItemsPerPage={5}
        onEditar={puedeGestionar ? (envio) => abrirModal(envio) : undefined}
        onEliminar={puedeGestionar ? (id) => eliminarEnvio(id) : undefined}
        columns={[
          { key: "cliente", label: "Cliente" },
          {
            key: "rutaResumen",
            label: "Ruta",
            render: (item: IVistaEnvioParaTabla) => (
              <span title={`${item.origen} → ${item.destino}`}>
                {item.rutaResumen}
              </span>
            ),
          },
          {
            key: "conductor",
            label: "Conductor",
            render: (item: IVistaEnvioParaTabla) =>
              item.conductor || "Sin asignar",
          },
          {
            key: "estado",
            label: "Estado",
            render: (item: IVistaEnvioParaTabla) => renderEstado(item.estado),
          },
          { key: "fechaSolicitud", label: "Fecha Solicitud" },
          {
            key: "costo",
            label: "Costo",
            render: (item: IVistaEnvioParaTabla) => `$${item.costo}`,
          },
          {
            key: "idEnvios",
            label: "Detalle",
            render: (item: IVistaEnvioParaTabla) => (
              <div className="d-flex gap-2 justify-content-center">
                <Button
                  color="info"
                  size="sm"
                  title="Ver detalle"
                  onClick={() => verDetalleEnvio(item)}
                >
                  <i className="bi bi-eye" />
                </Button>

                {puedeCambiarEstado && (
                  <Button
                    color="warning"
                    size="sm"
                    title="Cambiar estado"
                    onClick={() => cambiarEstado(item)}
                  >
                    <i className="bi bi-arrow-repeat" />
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      {puedeGestionar && (
        <EnviosModal
          isOpen={modalOpen}
          toggle={cerrarModal}
          envio={selectedEnvio}
          clientes={clientes}
          rutas={rutas}
          onSuccess={() => {
            cerrarModal();
            obtenerEnvios();
          }}
        />
      )}
    </div>
  );
}