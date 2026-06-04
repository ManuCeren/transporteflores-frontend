import { useState } from 'react';
import './AdminLayout.css';
import { ClienteLista } from '../components/ClienteLista';
import { EnviosLista } from '../components/EnviosLista';
import { UnidadesLista } from '../components/UnidadesLista';
import { UsuarioLista } from '../components/UsuarioLista';
import { ConductoreLista } from '../components/ConductoresLista';
import { MantenimientoLista } from '../components/MantenimientoLista';
import { FacturacionLista } from '../components/FacturacionLista';
import Mapa from '../components/Ruta';
import { RutasLista } from '../components/RutasLista';
import Dashboard from '../components/Dashboard';
import { cerrarSesion, obtenerUsuario } from '../service/authService';

type View =
  | 'dashboard'
  | 'clientes'
  | 'unidades'
  | 'envios'
  | 'usuarios'
  | 'conductores'
  | 'mantenimiento'
  | 'facturacion'
  | 'rutas'
  | 'mapaRuta';

export default function AdminLayout({ onLogout }: { onLogout: () => void }) {
  const usuario = obtenerUsuario();
  const rol = usuario?.rol;

  const [view, setView] = useState<View>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [idRutaEditar, setIdRutaEditar] = useState<number | undefined>(undefined);

  const handleViewChange = (newView: View, idRuta?: number) => {
    setView(newView);
    setIdRutaEditar(idRuta);
  };

  const puedeVer = (rolesPermitidos: string[]) => {
    return rol ? rolesPermitidos.includes(rol) : false;
  };

  const handleLogout = () => {
    cerrarSesion();
    onLogout();
  };

  return (
    <div className="admin-layout">
      <aside className={`sidebar bg-dark text-white ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!sidebarCollapsed && (
            <div className="sidebar-brand">
              <img src="/logo-1.png" className="logo" />
              {/*<h6 className="mt-2 mb-0">Transporte Flores</h6>*/}
            </div>
          )}

          <i
            className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'} fs-3 cursor-pointer sidebar-toggle`}
            role="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Colapsar/Expandir"
          ></i>
        </div>

        <nav className="nav flex-column sidebar-nav">
          <button
            className={`nav-link text-white d-flex align-items-center ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleViewChange('dashboard')}
          >
            <i className="bi bi-speedometer2 me-2"></i>
            {!sidebarCollapsed && <span>Dashboard</span>}
          </button>

          {puedeVer(['Administrador', 'Logistica']) && (
            <>
              <button
                className={`nav-link text-white d-flex align-items-center ${view === 'clientes' ? 'active' : ''}`}
                onClick={() => handleViewChange('clientes')}
              >
                <i className="bi bi-people-fill me-2"></i>
                {!sidebarCollapsed && <span>Clientes</span>}
              </button>

              <button
                className={`nav-link text-white d-flex align-items-center ${view === 'unidades' ? 'active' : ''}`}
                onClick={() => handleViewChange('unidades')}
              >
                <i className="bi bi-truck-front-fill me-2"></i>
                {!sidebarCollapsed && <span>Unidades</span>}
              </button>

              <button
                className={`nav-link text-white d-flex align-items-center ${view === 'conductores' ? 'active' : ''}`}
                onClick={() => handleViewChange('conductores')}
              >
                <i className="bi bi-person-check-fill me-2"></i>
                {!sidebarCollapsed && <span>Conductores</span>}
              </button>

              <button
                className={`nav-link text-white d-flex align-items-center ${view === 'rutas' ? 'active' : ''}`}
                onClick={() => handleViewChange('rutas')}
              >
                <i className="bi bi-map me-2"></i>
                {!sidebarCollapsed && <span>Rutas</span>}
              </button>
            </>
          )}

          {puedeVer(['Administrador', 'Logistica', 'Cliente', 'Conductor']) && (
            <button
              className={`nav-link text-white d-flex align-items-center ${view === 'envios' ? 'active' : ''}`}
              onClick={() => handleViewChange('envios')}
            >
              <i className="bi bi-send-check-fill me-2"></i>
              {!sidebarCollapsed && <span>Envíos</span>}
            </button>
          )}

          {puedeVer(['Administrador', 'Logistica']) && (
            <button
              className={`nav-link text-white d-flex align-items-center ${view === 'mantenimiento' ? 'active' : ''}`}
              onClick={() => handleViewChange('mantenimiento')}
            >
              <i className="bi bi-tools me-2"></i>
              {!sidebarCollapsed && <span>Mantenimiento</span>}
            </button>
          )}

          {puedeVer(['Administrador', 'Cliente']) && (
            <button
              className={`nav-link text-white d-flex align-items-center ${view === 'facturacion' ? 'active' : ''}`}
              onClick={() => handleViewChange('facturacion')}
            >
              <i className="bi bi-receipt-cutoff me-2"></i>
              {!sidebarCollapsed && <span>Facturación</span>}
            </button>
          )}

          {puedeVer(['Administrador']) && (
            <button
              className={`nav-link text-white d-flex align-items-center ${view === 'usuarios' ? 'active' : ''}`}
              onClick={() => handleViewChange('usuarios')}
            >
              <i className="bi bi-person-lines-fill me-2"></i>
              {!sidebarCollapsed && <span>Usuarios</span>}
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          {!sidebarCollapsed && usuario && (
            <div className="sidebar-user mb-3">
              <div className="fw-bold">
                <i className="bi bi-person-circle me-2"></i>
                {usuario.nombreUsuario}
              </div>
              <small className="text-white-50">{usuario.rol}</small>
            </div>
          )}

          <button
            className="nav-link text-white d-flex align-items-center logout-button"
            onClick={handleLogout}
            title="Cerrar sesión"
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            {!sidebarCollapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <div className={`content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <header className="bg-light p-4 shadow-sm sticky-top app-header">
          <h5 className="mb-0">
            Panel de Administración
            {usuario && (
              <small className="text-muted ms-2">
                ({usuario.nombreUsuario} - {usuario.rol})
              </small>
            )}
          </h5>
        </header>

        <main className="p-4">
          {view === 'dashboard' && <Dashboard handleViewChange={handleViewChange} usuario={usuario} />}
          {view === 'clientes' && <ClienteLista handleViewChange={handleViewChange} />}
          {view === 'unidades' && <UnidadesLista handleViewChange={handleViewChange} />}
          {view === 'envios' && <EnviosLista handleViewChange={handleViewChange} usuario={usuario} />}
          {view === 'usuarios' && <UsuarioLista handleViewChange={handleViewChange} />}
          {view === 'conductores' && <ConductoreLista handleViewChange={handleViewChange} />}
          {view === 'mantenimiento' && <MantenimientoLista handleViewChange={handleViewChange} />}
          {view === 'facturacion' && <FacturacionLista handleViewChange={handleViewChange} usuario={usuario} />}
          {view === 'rutas' && <RutasLista handleViewChange={handleViewChange} />}
          {view === 'mapaRuta' && <Mapa handleViewChange={handleViewChange} idRuta={idRutaEditar} />}
        </main>
      </div>
    </div>
  );
}