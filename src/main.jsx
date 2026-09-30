import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const navigation = [
  { label: 'Dashboard', icon: '▦' },
  { label: 'Reportes', icon: '▥' },
  { label: 'Auditoría', icon: '◷' },
  { label: 'Restaurantes', icon: '♜' },
  { label: 'Productos', icon: '▤' },
  { label: 'Inventario', icon: '▣' },
  { label: 'Bodegas', icon: '⌂' },
  { label: 'Pedidos al centro', icon: '▱' },
  { label: 'Gift cards', icon: '▧' },
  { label: 'Usuarios', icon: '♙' },
  { label: 'Empleados', icon: '♟' },
  { label: 'WeOne', icon: '◉' },
  { label: 'Mesas', icon: '▦' },
]

const primaryStats = [
  { label: 'VENTAS DE HOY', value: '$0.00', featured: true },
  { label: 'ÓRDENES', value: '0' },
  { label: 'TICKET PROMEDIO', value: '$0.00' },
  { label: 'UTILIDAD HOY', value: '$0.00', detail: '0% margen' },
  { label: 'PROPINAS', value: '$0.00' },
]

const secondaryStats = [
  { label: 'PENDIENTES DE COBRO', value: '0', detail: '$0.00', icon: '▤' },
  { label: 'TURNOS ABIERTOS', value: '0', icon: '🔓' },
  { label: 'MESAS OCUPADAS', value: '0/0', icon: '🍽' },
  { label: 'ALERTAS INVENTARIO', value: '0', detail: '0 bajo · 0 x vencer', icon: '⚠' },
]

function Sidebar({ activeItem, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand"><strong>we<span>POS</span></strong><small>Admin</small></div>
      <nav className="navigation" aria-label="Navegación principal">
        {navigation.map((item) => (
          <button
            className={`nav-item ${activeItem === item.label ? 'active' : ''}`}
            key={item.label}
            onClick={() => onNavigate(item.label)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="user-name">Administrador Prueba</span>
        <div className="footer-actions">
          <button className="tutorial-button">Tutorial</button>
          <button className="logout-button">Salir</button>
        </div>
      </div>
    </aside>
  )
}

function StatCard({ stat }) {
  return (
    <article className={`stat-card ${stat.featured ? 'featured' : ''}`}>
      <span className="stat-label">{stat.label}</span>
      <strong className="stat-value">{stat.value}</strong>
      {stat.detail && <span className="stat-detail">{stat.detail}</span>}
    </article>
  )
}

function TrendChart() {
  const points = Array.from({ length: 14 }, (_, index) => 38 + (index % 3 === 0 ? 0 : 0))
  return (
    <section className="panel trend-panel">
      <h2><span className="heading-icon">📈</span>Tendencia de ventas (14 días)</h2>
      <div className="chart" aria-label="Tendencia de ventas sin datos">
        <svg viewBox="0 0 1000 90" preserveAspectRatio="none" role="img">
          <line x1="8" y1="48" x2="992" y2="48" className="trend-line" />
          {points.map((_, index) => (
            <circle key={index} cx={8 + index * (984 / 13)} cy="48" r="3.5" className="trend-point" />
          ))}
        </svg>
        <div className="chart-labels"><span>09-17</span><span>09-24</span><span>09-30</span></div>
      </div>
    </section>
  )
}

function EmptyPanel({ icon, title, message = 'Sin datos hoy.' }) {
  return (
    <section className="panel empty-panel">
      <h2><span className="heading-icon">{icon}</span>{title}</h2>
      <p>{message}</p>
    </section>
  )
}

function App() {
  const [activeItem, setActiveItem] = useState('Dashboard')

  return (
    <div className="app-shell">
      <Sidebar activeItem={activeItem} onNavigate={setActiveItem} />
      <main className="main-content">
        <header className="page-header">
          <h1>{activeItem}</h1>
          <p>Resumen de hoy · ayer $0.00 en 0 órdenes</p>
        </header>
        <div className="stats-grid primary-grid">
          {primaryStats.map((stat) => <StatCard stat={stat} key={stat.label} />)}
        </div>
        <div className="stats-grid secondary-grid">
          {secondaryStats.map((stat) => (
            <article className="stat-card secondary-card" key={stat.label}>
              <div className="secondary-heading"><span className="stat-label">{stat.label}</span><span className="card-icon">{stat.icon}</span></div>
              <strong className="stat-value">{stat.value}</strong>
              {stat.detail && <span className="stat-detail">{stat.detail}</span>}
            </article>
          ))}
        </div>
        <TrendChart />
        <div className="bottom-grid">
          <EmptyPanel icon="💳" title="Métodos de pago (hoy)" />
          <EmptyPanel icon="🍽" title="Ventas por categoría (hoy)" />
          <EmptyPanel icon="🔥" title="Top productos (hoy)" message="Sin datos." />
          <EmptyPanel icon="⏰" title="Ventas por hora (hoy)" message="Sin ventas hoy." />
        </div>
      </main>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
