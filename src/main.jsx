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

const reportTabs = [
  { label: 'Rentabilidad', icon: '🪙' },
  { label: 'Ventas', icon: '📈' },
  { label: 'Caja y control', icon: '▤' },
  { label: 'Fiscal y clientes', icon: '🏛' },
  { label: 'Kárdex', icon: '📒' },
  { label: 'Valorización', icon: '📦' },
  { label: 'Empleados', icon: '♟' },
]

const profitabilityCards = [
  { label: 'INGRESOS', value: '$0.00', detail: '0 órdenes' },
  { label: 'COSTO DE VENTAS (CMV)', value: '$0.00' },
  { label: 'UTILIDAD BRUTA', value: '$0.00', detail: '0% margen', featured: true },
  { label: 'VALOR INVENTARIO', value: '$0.00' },
]

function ReportTabs({ activeTab, onChange }) {
  return <div className="report-tabs">
    {reportTabs.map((tab) => <button key={tab.label} className={`report-tab ${activeTab === tab.label ? 'active' : ''}`} onClick={() => onChange(tab.label)}>
      <span>{tab.icon}</span>{tab.label}
    </button>)}
  </div>
}

function DateFilters() {
  return <div className="date-filters">
    <label>Desde<input type="date" defaultValue="2026-09-01" /></label>
    <label>Hasta<input type="date" defaultValue="2026-09-30" /></label>
  </div>
}

function ReportCard({ icon, title, columns = [], message }) {
  return <section className="panel report-card">
    <h2><span className="heading-icon">{icon}</span>{title}</h2>
    {columns.length > 0 && <div className="report-columns">{columns.map((column) => <span key={column}>{column}</span>)}</div>}
    <p className="report-empty">{message}</p>
  </section>
}

function ProfitabilityReport({ activeTab, onChange }) {
  return <div className="reports-page">
    <ReportTabs activeTab={activeTab} onChange={onChange} />
    <div className="report-heading-row">
      <div><h1>Rentabilidad e inventario</h1><p>Margen, costo de ventas y estado del inventario</p></div>
      <DateFilters />
    </div>
    <div className="stats-grid report-stats-grid">{profitabilityCards.map((stat) => <StatCard stat={stat} key={stat.label} />)}</div>
    <div className="report-grid">
      <ReportCard icon="💵" title="Margen por producto" columns={['PRODUCTO', 'PRECIO', 'COSTO', 'MARGEN', '%']} message="" />
      <ReportCard icon="🔥" title="Más vendidos (por cantidad)" columns={['PRODUCTO', 'CANT.', 'INGRESO', 'MARGEN']} message="Sin ventas en el período." />
      <ReportCard icon="📉" title="Consumo de insumos" columns={['INSUMO', 'CONSUMIDO', 'VALOR']} message="Sin consumo en el período." />
      <ReportCard icon="🏷" title="Valorización de inventario · $0.00" columns={['INSUMO', 'EXISTENCIA', 'COSTO U.', 'VALOR']} message="" />
      <ReportCard icon="🐢" title="Menos vendidos" columns={['PRODUCTO', 'CANT.', 'INGRESO']} message="Sin datos." />
      <ReportCard icon="⚠" title="Mermas/ajustes · $0.00" columns={['INSUMO', 'TIPO', 'CANT.', 'VALOR', 'MOTIVO']} message="Sin mermas ni ajustes." />
    </div>
  </div>
}

function SalesReport({ activeTab, onChange }) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return <div className="reports-page">
    <ReportTabs activeTab={activeTab} onChange={onChange} />
    <div className="report-heading-row"><div><h1>Ventas</h1><p>Tendencia, horas pico y desglose</p></div><DateFilters /></div>
    <div className="stats-grid sales-stats-grid">{[
      { label: 'VENTAS TOTALES', value: '$0.00', featured: true }, { label: 'ÓRDENES', value: '0' }, { label: 'TICKET PROMEDIO', value: '$0.00' }, { label: 'PROPINAS', value: '$0.00' },
    ].map((stat) => <StatCard stat={stat} key={stat.label} />)}</div>
    <div className="report-grid sales-grid">
      <ReportCard icon="🗓" title="Tendencia de ventas" message="Sin datos en el período." />
      <ReportCard icon="⏰" title="Horas pico" message="Sin datos en el período." />
      <section className="panel report-card weekday-card"><h2><span className="heading-icon">🗓</span>Por día de la semana</h2>{days.map((day) => <div className="weekday-row" key={day}><span>{day}</span><strong>$0.00</strong><i /></div>)}</section>
      <ReportCard icon="💳" title="Por método de pago" message="Sin datos en el período." />
      <ReportCard icon="🍽" title="Por categoría" message="Sin datos en el período." />
      <ReportCard icon="🛒" title="Por tipo de venta" message="Sin datos en el período." />
    </div>
  </div>
}

function App() {
  const [activeItem, setActiveItem] = useState('Dashboard')
  const [activeReport, setActiveReport] = useState('Rentabilidad')

  const changeReport = (tab) => setActiveReport(tab)
  const renderContent = () => {
    if (activeItem === 'Reportes') {
      return activeReport === 'Ventas' ? <SalesReport activeTab={activeReport} onChange={changeReport} /> : <ProfitabilityReport activeTab={activeReport} onChange={changeReport} />
    }
    return <>
      <header className="page-header"><h1>{activeItem}</h1><p>Resumen de hoy · ayer $0.00 en 0 órdenes</p></header>
      <div className="stats-grid primary-grid">{primaryStats.map((stat) => <StatCard stat={stat} key={stat.label} />)}</div>
      <div className="stats-grid secondary-grid">{secondaryStats.map((stat) => <article className="stat-card secondary-card" key={stat.label}><div className="secondary-heading"><span className="stat-label">{stat.label}</span><span className="card-icon">{stat.icon}</span></div><strong className="stat-value">{stat.value}</strong>{stat.detail && <span className="stat-detail">{stat.detail}</span>}</article>)}</div>
      <TrendChart />
      <div className="bottom-grid"><EmptyPanel icon="💳" title="Métodos de pago (hoy)" /><EmptyPanel icon="🍽" title="Ventas por categoría (hoy)" /><EmptyPanel icon="🔥" title="Top productos (hoy)" message="Sin datos." /><EmptyPanel icon="⏰" title="Ventas por hora (hoy)" message="Sin ventas hoy." /></div>
    </>
  }

  return <div className="app-shell"><Sidebar activeItem={activeItem} onNavigate={setActiveItem} /><main className="main-content">{renderContent()}</main></div>
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
