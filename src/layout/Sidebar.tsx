import { Link } from 'react-router-dom';

export default function Sidebar() {
  return (
    <div className="bg-dark text-white vh-100 p-3" style={{ width: '250px' }}>
      <h3 className="mb-4 text-nowrap overflow-hidden text-truncate">
        🚛 Transporte Flores
      </h3>

      <ul className="nav flex-column">

        {/* Módulo Inicio */}
        <li className="nav-item mb-2">
          <Link to="/" className="nav-link text-white">
            <i className="bi bi-house me-2" />
            Inicio
          </Link>
        </li>

        {/* Módulo Clientes */}
        <li className="nav-item mb-1 fw-bold text-uppercase text-muted mt-3">
          Gestión de Clientes
        </li>
        <li className="nav-item mb-2">
          <Link to="/clientes" className="nav-link text-white">
            <i className="bi bi-people-fill me-2" />
            Clientes
          </Link>
        </li>

        {/* Módulo Conductores */}
        <li className="nav-item mb-1 fw-bold text-uppercase text-muted mt-3">
          Gestión de Conductores
        </li>
        <li className="nav-item mb-2">
          <Link to="/conductores" className="nav-link text-white">
            <i className="bi bi-person-circle me-2" />
            Conductores
          </Link>
        </li>

        {/* Módulo Envíos */}
        <li className="nav-item mb-1 fw-bold text-uppercase text-muted mt-3">
          Gestión de Envíos
        </li>
        <li className="nav-item mb-2">
          <Link to="/envios" className="nav-link text-white">
            <i className="bi bi-truck me-2" />
            Envíos
          </Link>
        </li>

        {/* Módulo Unidades */}
        <li className="nav-item mb-1 fw-bold text-uppercase text-muted mt-3">
          Gestión de Flota
        </li>
        <li className="nav-item mb-2">
          <Link to="/unidades" className="nav-link text-white">
            <i className="bi bi-bus-front me-2" />
            Unidades
          </Link>
        </li>

        {/* Módulo Mantenimientos */}
        <li className="nav-item mb-1 fw-bold text-uppercase text-muted mt-3">
          Gestión de Mantenimientos
        </li>
        <li className="nav-item mb-2">
          <Link to="/mantenimientos" className="nav-link text-white">
            <i className="bi bi-tools me-2" />
            Mantenimientos
          </Link>
        </li>

        {/* Módulo Usuarios */}
        <li className="nav-item mb-1 fw-bold text-uppercase text-muted mt-3">
          Administración
        </li>
        <li className="nav-item mb-2">
          <Link to="/usuarios" className="nav-link text-white">
            <i className="bi bi-person-lines-fill me-2" />
            Usuarios
          </Link>
        </li>
        {/* Módulo Proyecciones (¡NUEVO!) */}
        <li className="nav-item mb-1 fw-bold text-uppercase text-muted mt-3">
          Análisis y Reportes
        </li>
        <li className="nav-item mb-2">
          <Link to="/proyecciones" className="nav-link text-white">
            <i className="bi bi-graph-up me-2" /> {/* Icono de gráfico */}
            Proyecciones
          </Link>
        </li>
      </ul>
    </div>
  );
}
