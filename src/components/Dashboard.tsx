import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  //ListGroup,
  //ListGroupItem,
  Button,
  Spinner,
  Table,
  Badge,
  //Progress
} from 'reactstrap';

import { useClientes } from '../hook/useClientes';
import { useEnvios } from '../hook/useEnvios';
import type { IUsuarioLogin } from '../Interfaces/IUsuarioLogin';
import { useConductorVehiculo } from '../hook/useConductorVehiculo';
import { useConductores } from '../hook/useConductores';
import { useUnidades } from '../hook/useUnidades';
import { useFacturacionResumen } from '../hook/useFacturacionResumen';
import { useMantenimientoResumen } from '../hook/useMantenimientoResumen';

import { Doughnut } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardProps {
  handleViewChange: (newView: any) => void;
  usuario: IUsuarioLogin | null;
}

export default function Dashboard({ handleViewChange, usuario }: DashboardProps) {
  const rol = usuario?.rol;

  const {
    totalClientes,
    //ultimosClientes,
    loading: loadingClientes,
    error: errorClientes
  } = useClientes();

  const {
    envios,
    totalEnvios,
    ultimosEnvios,
    loading: loadingEnvios,
    error: errorEnvios
  } = useEnvios(usuario);

  const {
    conductorVehiculo,
    loadingConductorVehiculo,
    errorConductorVehiculo
  } = useConductorVehiculo(usuario?.idConductor);

  const { totalConductores } = useConductores();
  const { totalUnidades } = useUnidades();
  const { totalFacturas, totalFacturado } = useFacturacionResumen();
  const { totalMantenimientos, mantenimientosActivos } = useMantenimientoResumen();

  const loading = loadingClientes || loadingEnvios;
  const error = errorClientes || errorEnvios;

  const esAdminOLogistica = rol === 'Administrador' || rol === 'Logistica';
  const esCliente = rol === 'Cliente';
  const esConductor = rol === 'Conductor';

  const enviosPendientes = envios.filter(e =>
    e.idEstadoEnvio === 1 ||
    e.estado?.toLowerCase().includes('en proceso') ||
    e.estado?.toLowerCase().includes('pendiente') ||
    e.estado?.toLowerCase().includes('asignado')
  ).length;

  const enviosTransito = envios.filter(e =>
    e.estado?.toLowerCase().includes('tránsito') ||
    e.estado?.toLowerCase().includes('en ruta')
  ).length;

  const enviosCompletados = envios.filter(e =>
    e.estado?.toLowerCase().includes('completado') ||
    e.estado?.toLowerCase().includes('finalizado')
  ).length;

  const enviosCancelados = envios.filter(e =>
    e.idEstadoEnvio === 4 ||
    e.estado?.toLowerCase().includes('cancelado')
  ).length;

  const envioActual = envios.find(e =>
    !e.estado?.toLowerCase().includes('completado') &&
    !e.estado?.toLowerCase().includes('finalizado') &&
    !e.estado?.toLowerCase().includes('cancelado')
  );

  const porcentajeFinalizados =
    totalEnvios > 0 ? Math.round((enviosCompletados / totalEnvios) * 100) : 0;

  const moneda = new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD'
  });

  const dataGraficoEstados = {
    labels: ['Pendientes', 'En Ruta', 'Finalizados', 'Cancelados'],
    datasets: [
      {
        data: [
          enviosPendientes,
          enviosTransito,
          enviosCompletados,
          enviosCancelados
        ],
        backgroundColor: ['#6c757d', '#ffc107', '#198754', '#dc3545'],
        borderWidth: 1
      }
    ]
  };

  const opcionesGraficoEstados = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const
      }
    }
  };

  const colorEstado = (estado: string) => {
    const estadoLower = estado?.toLowerCase() || '';

    if (estadoLower.includes('completado') || estadoLower.includes('finalizado')) {
      return 'success';
    }

    if (estadoLower.includes('tránsito') || estadoLower.includes('en ruta')) {
      return 'warning';
    }

    if (estadoLower.includes('cancelado')) {
      return 'danger';
    }

    return 'secondary';
  };

  if (loading) {
    return (
      <>
        <h2 className="fw-bold mb-4">Dashboard</h2>
        <p>Cargando datos del dashboard...</p>
        <Spinner color="primary" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <h2 className="fw-bold mb-4">Dashboard</h2>
        <p className="text-danger">Error: {error}</p>
      </>
    );
  }

  return (
    <>
      <h2 className="fw-bold mb-1">
        {esConductor
          ? 'Dashboard del Conductor'
          : esCliente
            ? 'Dashboard del Cliente'
            : 'Dashboard'}
      </h2>

      <p className="text-muted mb-4">
        Bienvenido, <strong>{usuario?.nombreUsuario}</strong>.{' '}
        {esAdminOLogistica &&
          'Aquí puedes consultar el estado general de envíos, facturación, mantenimiento y recursos operativos.'}

        {esCliente &&
          'Aquí puedes consultar el estado de tus envíos y facturas.'}

        {esConductor &&
          'Aquí puedes consultar tus envíos asignados y la información de tu unidad.'}
      </p>

      {esConductor && (
        <>
          <Row className="g-4 mb-4">
            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-send-check-fill fs-2 text-warning"></i>
                  <CardTitle tag="h6" className="mt-2">Envíos Asignados</CardTitle>
                  <CardText className="display-6 fw-bold text-warning">
                    {totalEnvios}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-clock-history fs-2 text-secondary"></i>
                  <CardTitle tag="h6" className="mt-2">Pendientes</CardTitle>
                  <CardText className="display-6 fw-bold">
                    {enviosPendientes}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-truck fs-2 text-primary"></i>
                  <CardTitle tag="h6" className="mt-2">En Tránsito</CardTitle>
                  <CardText className="display-6 fw-bold text-primary">
                    {enviosTransito}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-check-circle-fill fs-2 text-success"></i>
                  <CardTitle tag="h6" className="mt-2">Completados</CardTitle>
                  <CardText className="display-6 fw-bold text-success">
                    {enviosCompletados}
                  </CardText>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg="5">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <CardTitle tag="h5" className="fw-bold mb-3">
                    <i className="bi bi-person-badge me-2 text-warning"></i>
                    Mi Información
                  </CardTitle>

                  {loadingConductorVehiculo ? (
                    <Spinner size="sm" />
                  ) : conductorVehiculo ? (
                    <>
                      <p className="mb-2">
                        <strong>Nombre:</strong> {conductorVehiculo.nombre}
                      </p>

                      <p className="mb-2">
                        <strong>Licencia:</strong> {conductorVehiculo.licencia}
                      </p>

                      <p className="mb-2">
                        <strong>Teléfono:</strong> {conductorVehiculo.telefono}
                      </p>

                      <p className="mb-0">
                        <strong>Estado:</strong>{' '}
                        <Badge
                          color={
                            conductorVehiculo.estado?.toLowerCase() === 'activo'
                              ? 'success'
                              : 'danger'
                          }
                        >
                          {conductorVehiculo.estado}
                        </Badge>
                      </p>
                    </>
                  ) : (
                    <p className="text-danger">
                      {errorConductorVehiculo || 'No se encontró información del conductor'}
                    </p>
                  )}
                </CardBody>
              </Card>
            </Col>

            <Col lg="7">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <CardTitle tag="h5" className="fw-bold mb-3">
                    <i className="bi bi-truck-front me-2 text-warning"></i>
                    Mi Vehículo Asignado
                  </CardTitle>

                  {loadingConductorVehiculo ? (
                    <Spinner size="sm" />
                  ) : conductorVehiculo?.vehiculo ? (
                    <Row>
                      <Col md="6">
                        <p className="mb-2">
                          <strong>Tipo:</strong>{' '}
                          {conductorVehiculo.vehiculo.tipoUnidad}
                        </p>

                        <p className="mb-2">
                          <strong>Placa:</strong>{' '}
                          {conductorVehiculo.vehiculo.placa}
                        </p>

                        <p className="mb-2">
                          <strong>Marca:</strong>{' '}
                          {conductorVehiculo.vehiculo.marca}
                        </p>
                      </Col>

                      <Col md="6">
                        <p className="mb-2">
                          <strong>Modelo:</strong>{' '}
                          {conductorVehiculo.vehiculo.modelo}
                        </p>

                        <p className="mb-2">
                          <strong>Capacidad:</strong>{' '}
                          {conductorVehiculo.vehiculo.capacidadCarga ?? 0} Toneladas
                        </p>
                      </Col>
                    </Row>
                  ) : (
                    <p className="text-danger">
                      No hay vehículo asignado.
                    </p>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg="12">
              <Card className="shadow-sm border-0">
                <CardBody>
                  <CardTitle tag="h5" className="fw-bold mb-3">
                    <i className="bi bi-box-seam me-2 text-warning"></i>
                    Envío Actual
                  </CardTitle>

                  {envioActual ? (
                    <>
                      <Row>
                        <Col md="6">
                          <p><strong>Cliente:</strong> {envioActual.cliente}</p>
                          <p><strong>Origen:</strong> {envioActual.origen}</p>
                          <p><strong>Destino:</strong> {envioActual.destino}</p>
                        </Col>
                        <Col md="6">
                          <p><strong>Mercancía:</strong> {envioActual.mercancia}</p>
                          <p>
                            <strong>Fecha entrega:</strong>{' '}
                            {new Date(envioActual.fechaEntregaEsperada).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Estado:</strong>{' '}
                            <Badge color={colorEstado(envioActual.estado)}>
                              {envioActual.estado}
                            </Badge>
                          </p>
                        </Col>
                      </Row>

                      <Button
                        color="warning"
                        onClick={() => handleViewChange('envios')}
                      >
                        Actualizar Estado
                      </Button>
                    </>
                  ) : (
                    <p className="text-muted mb-0">
                      No tienes un envío activo actualmente.
                    </p>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Card className="shadow-sm border-0">
            <CardBody>
              <CardTitle tag="h5" className="fw-bold mb-3">
                Últimos envíos asignados
              </CardTitle>

              {ultimosEnvios.length > 0 ? (
                <Table responsive hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Origen</th>
                      <th>Destino</th>
                      <th>Fecha Entrega</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosEnvios.map((envio) => (
                      <tr key={envio.idEnvios}>
                        <td>{envio.cliente}</td>
                        <td>{envio.origen}</td>
                        <td>{envio.destino}</td>
                        <td>
                          {new Date(envio.fechaEntregaEsperada).toLocaleDateString()}
                        </td>
                        <td>
                          <Badge color={colorEstado(envio.estado)}>
                            {envio.estado}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>No hay envíos asignados.</p>
              )}

              <Button color="warning" onClick={() => handleViewChange('envios')}>
                Ver Envíos Asignados
              </Button>
            </CardBody>
          </Card>
        </>
      )}

      {esCliente && (
        <>
          <Row className="g-4 mb-4">
            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-send-check-fill fs-2 text-warning"></i>
                  <CardTitle tag="h6" className="mt-2">
                    Mis Envíos
                  </CardTitle>
                  <CardText className="display-6 fw-bold text-warning">
                    {totalEnvios}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-clock-history fs-2 text-secondary"></i>
                  <CardTitle tag="h6" className="mt-2">
                    Pendientes
                  </CardTitle>
                  <CardText className="display-6 fw-bold">
                    {enviosPendientes}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-truck fs-2 text-primary"></i>
                  <CardTitle tag="h6" className="mt-2">
                    En Ruta
                  </CardTitle>
                  <CardText className="display-6 fw-bold text-primary">
                    {enviosTransito}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-check-circle-fill fs-2 text-success"></i>
                  <CardTitle tag="h6" className="mt-2">
                    Finalizados
                  </CardTitle>
                  <CardText className="display-6 fw-bold text-success">
                    {enviosCompletados}
                  </CardText>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg="12">
              <Card className="shadow-sm border-0">
                <CardBody>
                  <CardTitle tag="h5" className="fw-bold mb-3">
                    <i className="bi bi-box-seam me-2 text-warning"></i>
                    Último Envío
                  </CardTitle>

                  {ultimosEnvios.length > 0 ? (
                    <>
                      <Row>
                        <Col md="6">
                          <p>
                            <strong>Cliente:</strong>{' '}
                            {ultimosEnvios[0].cliente}
                          </p>

                          <p>
                            <strong>Origen:</strong>{' '}
                            {ultimosEnvios[0].origen}
                          </p>

                          <p>
                            <strong>Destino:</strong>{' '}
                            {ultimosEnvios[0].destino}
                          </p>
                        </Col>

                        <Col md="6">
                          <p>
                            <strong>Mercancía:</strong>{' '}
                            {ultimosEnvios[0].mercancia}
                          </p>

                          <p>
                            <strong>Fecha Entrega:</strong>{' '}
                            {new Date(
                              ultimosEnvios[0].fechaEntregaEsperada
                            ).toLocaleDateString()}
                          </p>

                          <p>
                            <strong>Estado:</strong>{' '}
                            <Badge
                              color={colorEstado(
                                ultimosEnvios[0].estado
                              )}
                            >
                              {ultimosEnvios[0].estado}
                            </Badge>
                          </p>
                        </Col>
                      </Row>
                    </>
                  ) : (
                    <p>No tienes envíos registrados.</p>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Card className="shadow-sm border-0">
            <CardBody>
              <CardTitle tag="h5" className="fw-bold mb-3">
                Historial de Envíos
              </CardTitle>

              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Fecha</th>
                    <th>Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {ultimosEnvios.map((envio) => (
                    <tr key={envio.idEnvios}>
                      <td>{envio.origen}</td>
                      <td>{envio.destino}</td>
                      <td>
                        {new Date(
                          envio.fechaSolicitud
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        <Badge color={colorEstado(envio.estado)}>
                          {envio.estado}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <Button
                color="warning"
                onClick={() => handleViewChange('envios')}
              >
                Ver Mis Envíos
              </Button>

              <Button
                color="success"
                className="ms-2"
                onClick={() => handleViewChange('facturacion')}
              >
                Ver Mis Facturas
              </Button>
            </CardBody>
          </Card>
        </>
      )}

      {esAdminOLogistica && (
        <>
          <Row className="g-4 mb-4">
            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-people-fill fs-2 text-primary"></i>
                  <CardTitle tag="h6" className="mt-2">Clientes</CardTitle>
                  <CardText className="display-6 fw-bold text-primary">
                    {totalClientes}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-send-check-fill fs-2 text-warning"></i>
                  <CardTitle tag="h6" className="mt-2">Envíos</CardTitle>
                  <CardText className="display-6 fw-bold text-warning">
                    {totalEnvios}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-person-badge fs-2 text-success"></i>
                  <CardTitle tag="h6" className="mt-2">Conductores</CardTitle>
                  <CardText className="display-6 fw-bold text-success">
                    {totalConductores}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-truck-front fs-2 text-danger"></i>
                  <CardTitle tag="h6" className="mt-2">Unidades</CardTitle>
                  <CardText className="display-6 fw-bold text-danger">
                    {totalUnidades}
                  </CardText>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-clock-history fs-2 text-secondary"></i>
                  <CardTitle tag="h6" className="mt-2">Pendientes</CardTitle>
                  <CardText className="display-6 fw-bold text-secondary">
                    {enviosPendientes}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-truck fs-2 text-primary"></i>
                  <CardTitle tag="h6" className="mt-2">En Ruta</CardTitle>
                  <CardText className="display-6 fw-bold text-primary">
                    {enviosTransito}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-check-circle-fill fs-2 text-success"></i>
                  <CardTitle tag="h6" className="mt-2">Finalizados</CardTitle>
                  <CardText className="display-6 fw-bold text-success">
                    {enviosCompletados}
                  </CardText>
                </CardBody>
              </Card>
            </Col>

            <Col md="6" xl="3">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <i className="bi bi-x-circle-fill fs-2 text-danger"></i>
                  <CardTitle tag="h6" className="mt-2">Cancelados</CardTitle>
                  <CardText className="display-6 fw-bold text-danger">
                    {enviosCancelados}
                  </CardText>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg="6">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <CardTitle tag="h5" className="fw-bold mb-3">
                    <i className="bi bi-pie-chart-fill me-2 text-success"></i>
                    Estado General de Envíos
                  </CardTitle>

                  <div style={{ maxWidth: '320px', margin: '0 auto' }}>
                    <Doughnut
                      data={dataGraficoEstados}
                      options={opcionesGraficoEstados}
                    />
                  </div>

                  <div className="text-center mt-3">
                    <h4 className="fw-bold text-success mb-1">
                      {porcentajeFinalizados}%
                    </h4>
                    <small className="text-muted">
                      Envíos finalizados del total registrado
                    </small>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg="6">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <CardTitle tag="h5" className="fw-bold mb-3">
                    <i className="bi bi-cash-coin me-2 text-success"></i>
                    Facturación
                  </CardTitle>

                  <h3 className="fw-bold text-success">
                    {moneda.format(totalFacturado)}
                  </h3>

                  <p className="mb-2">
                    <strong>Facturas emitidas:</strong> {totalFacturas}
                  </p>

                  <p className="text-muted mb-3">
                    Resumen económico de los envíos facturados.
                  </p>

                  <Button
                    color="success"
                    onClick={() => handleViewChange('facturacion')}
                  >
                    Ver Facturación
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="g-4 mb-4">
            <Col lg="12">
              <Card className="shadow-sm border-0">
                <CardBody>
                  <CardTitle tag="h5" className="fw-bold mb-3">
                    <i className="bi bi-table me-2 text-warning"></i>
                    Últimos Envíos Realizados
                  </CardTitle>

                  {ultimosEnvios.length > 0 ? (
                    <Table responsive hover className="align-middle">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Origen</th>
                          <th>Destino</th>
                          <th>Fecha</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ultimosEnvios.map((envio) => (
                          <tr key={envio.idEnvios}>
                            <td>{envio.cliente}</td>
                            <td>{envio.origen}</td>
                            <td>{envio.destino}</td>
                            <td>{new Date(envio.fechaSolicitud).toLocaleDateString()}</td>
                            <td>
                              <Badge color={colorEstado(envio.estado)}>
                                {envio.estado}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p>No hay envíos recientes.</p>
                  )}

                  <Button
                    color="warning"
                    onClick={() => handleViewChange('envios')}
                  >
                    Ver Todos los Envíos
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Row className="g-4">
            <Col lg="6">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <CardTitle tag="h5" className="fw-bold mb-3">
                    <i className="bi bi-calendar-event me-2 text-primary"></i>
                    Próximas Entregas
                  </CardTitle>

                  {envios.filter(e => e.idEstadoEnvio !== 3 && e.idEstadoEnvio !== 4).length > 0 ? (
                    <Table responsive hover className="align-middle">
                      <thead>
                        <tr>
                          <th>Destino</th>
                          <th>Entrega</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {envios
                          .filter(e => e.idEstadoEnvio !== 3 && e.idEstadoEnvio !== 4)
                          .sort(
                            (a, b) =>
                              new Date(a.fechaEntregaEsperada).getTime() -
                              new Date(b.fechaEntregaEsperada).getTime()
                          )
                          .slice(0, 5)
                          .map((envio) => (
                            <tr key={envio.idEnvios}>
                              <td>{envio.destino}</td>
                              <td>{new Date(envio.fechaEntregaEsperada).toLocaleDateString()}</td>
                              <td>
                                <Badge color={colorEstado(envio.estado)}>
                                  {envio.estado}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  ) : (
                    <p>No hay entregas próximas.</p>
                  )}
                </CardBody>
              </Card>
            </Col>

            <Col lg="6">
              <Card className="shadow-sm border-0 h-100">
                <CardBody>
                  <CardTitle tag="h5" className="fw-bold mb-3">
                    <i className="bi bi-tools me-2 text-danger"></i>
                    Mantenimiento
                  </CardTitle>

                  <h3 className="fw-bold text-danger">
                    {mantenimientosActivos}
                  </h3>

                  <p className="mb-2">
                    <strong>Mantenimientos activos</strong>
                  </p>

                  <p className="mb-2">
                    Total de registros: {totalMantenimientos}
                  </p>

                  <p className="text-muted mb-3">
                    Control de mantenimientos registrados para las unidades.
                  </p>

                  <Button
                    color="danger"
                    onClick={() => handleViewChange('mantenimiento')}
                  >
                    Ver Mantenimientos
                  </Button>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
}