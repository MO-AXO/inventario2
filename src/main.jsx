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

const restaurants = [
  { name: 'Restaurante Prueba', detail: '4 usuario(s) · 0 mesa(s)' },
  { name: '🏭 kmInl', detail: 'Centro de producción · 0 usuario(s)' },
]

const defaultCategories = ['Entradas', 'Platos fuertes', 'Bebidas', 'Postres']

function ProductsPage() {
  const [categories, setCategories] = useState(defaultCategories)
  const [newCategory, setNewCategory] = useState('')
  const [showProductForm, setShowProductForm] = useState(false)

  const addCategory = () => {
    const category = newCategory.trim()
    if (category && !categories.includes(category)) setCategories([...categories, category])
    setNewCategory('')
  }

  return <div className="products-page">
    <div className="products-header"><h1>Productos</h1><button className="new-location-button" onClick={() => setShowProductForm(true)}>+ Nuevo producto</button></div>
    <section className="categories-panel">
      <h2>Categorías del menú</h2>
      <div className="categories-row">
        {categories.map((category) => <span className="category-chip" key={category}>{category}<button aria-label={`Editar ${category}`}>🖉</button><button aria-label={`Eliminar ${category}`} onClick={() => setCategories(categories.filter((item) => item !== category))}>×</button></span>)}
        <input className="category-input" placeholder="Nueva categoría..." value={newCategory} onChange={(event) => setNewCategory(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addCategory()} />
        <button className="add-category-button" onClick={addCategory}>+ Agregar</button>
      </div>
    </section>
    <section className="products-table"><div className="products-table-header"><span>PRODUCTO</span><span>CATEGORÍA</span><span>ESTACIÓN</span><span>PRECIO</span><span>ESTADO</span></div></section>
    {showProductForm && <ProductForm categories={categories} onClose={() => setShowProductForm(false)} />}
  </div>
}

function ProductForm({ categories, onClose }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="product-form" onSubmit={(event) => { event.preventDefault(); onClose() }}>
      <h2>Nuevo producto</h2>
      <label>Nombre<input autoFocus type="text" /></label>
      <label>Foto<div className="photo-upload-row"><div className="photo-preview">📷</div><div><button type="button" className="upload-button">Subir foto</button><small>Opcional · JPG, PNG o WEBP</small></div></div></label>
      <div className="form-two-columns"><label>Precio<input type="text" /></label><label>Emoji<input type="text" defaultValue="🍔" /></label></div>
      <div className="form-two-columns"><label>Categoría<select defaultValue=""><option value="">Seleccionar...</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><label>Estación (cocina)<select defaultValue="Ninguna"><option>Ninguna</option><option>Cocina</option><option>Barra</option></select></label></div>
      <div className="form-two-columns"><label>Tiempo estimado (min)<input type="number" defaultValue="15" /></label><label className="checkbox-label"><input type="checkbox" defaultChecked />Activo</label></div>
      <label className="checkbox-label store-sale"><input type="checkbox" />Venta tienda</label>
      <div className="form-actions"><button type="button" className="cancel-form-button" onClick={onClose}>Cancelar</button><button type="submit" className="save-form-button">Guardar</button></div>
    </form>
  </div>
}

function InventoryPage() {
  const [filter, setFilter] = useState('Todos')
  const [showForm, setShowForm] = useState(false)
  return <div className="inventory-page">
    <div className="inventory-header"><h1>Inventario</h1><button className="new-location-button" onClick={() => setShowForm(true)}>+ Nuevo insumo</button></div>
    <div className="inventory-toolbar"><div className="inventory-tabs">{['Todos', 'Materia prima', 'Elaborados'].map((tab) => <button key={tab} className={filter === tab ? 'active' : ''} onClick={() => setFilter(tab)}>{tab}</button>)}</div><select className="warehouse-select" defaultValue="Restaurante Prueba"><option>Existencias: Restaurante Prueba</option><option>Existencias: kmInl</option></select></div>
    <section className="inventory-table"><div className="inventory-table-header"><span>INSUMO</span><span>UNIDAD</span><span>DISPONIBLE</span><span>RESERVADO</span><span>MÍNIMO</span><span>COSTO UNIT.</span><span>PRÓX. VENCE</span></div><p>Sin insumos.</p></section>
    {showForm && <InventoryForm onClose={() => setShowForm(false)} />}
  </div>
}

function InventoryForm({ onClose }) {
  const [type, setType] = useState('Elaborado')
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="inventory-form" onSubmit={(event) => { event.preventDefault(); onClose() }}>
      <h2>Nuevo insumo</h2>
      <div className="inventory-type-selector"><button type="button" className={type === 'Materia prima' ? 'active' : ''} onClick={() => setType('Materia prima')}><strong>Materia prima</strong><small>Se compra</small></button><button type="button" className={type === 'Elaborado' ? 'active' : ''} onClick={() => setType('Elaborado')}><strong>Elaborado</strong><small>Se produce con una fórmula</small></button></div>
      <label>Nombre<input autoFocus type="text" /></label>
      <label>Foto<div className="photo-upload-row"><div className="photo-preview">📷</div><div><button type="button" className="upload-button">Subir foto</button><small>Opcional · JPG, PNG o WEBP</small></div></div></label>
      <div className="form-two-columns"><label>Unidad<select defaultValue="UNIDAD"><option>UNIDAD</option><option>KG</option><option>LITRO</option></select></label><label>Stock mínimo<input type="number" defaultValue="0" /></label></div>
      <label className="checkbox-label store-sale"><input type="checkbox" />Perecedero (controla vencimiento)</label>
      <div className="form-actions"><button type="button" className="cancel-form-button" onClick={onClose}>Cancelar</button><button type="submit" className="save-form-button">Guardar</button></div>
    </form>
  </div>
}

const warehouses = [
  { name: '🏬 Bodega Principal', detail: 'Almacén secundario' },
  { name: '🏬 mario', detail: 'Consume el POS', main: true },
]

function WarehousesPage() {
  const [showForm, setShowForm] = useState(false)
  return <div className="warehouses-page">
    <div className="warehouses-header"><h1>Bodegas</h1><button className="new-location-button" onClick={() => setShowForm(true)}>+ Nueva bodega</button></div>
    <div className="warehouses-grid">{warehouses.map((warehouse) => <article className="warehouse-card" key={warehouse.name}><div className="warehouse-card-heading"><div><h2>{warehouse.name}</h2><p>{warehouse.detail}</p></div>{warehouse.main && <span className="main-badge">Principal</span>}</div><div className="warehouse-actions"><button>Editar</button><button>Eliminar</button></div></article>)}</div>
    {showForm && <WarehouseForm onClose={() => setShowForm(false)} />}
  </div>
}

function WarehouseForm({ onClose }) {
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="warehouse-form" onSubmit={(event) => { event.preventDefault(); onClose() }}>
      <h2>Nueva bodega</h2>
      <label>Nombre<input autoFocus type="text" /></label>
      <label className="checkbox-label warehouse-main-check"><input type="checkbox" />Bodega principal (la que descuenta el POS)</label>
      <div className="form-actions"><button type="button" className="cancel-form-button" onClick={onClose}>Cancelar</button><button type="submit" className="save-form-button">Guardar</button></div>
    </form>
  </div>
}

function OrdersPage() {
  const [showForm, setShowForm] = useState(false)
  return <div className="orders-page">
    <div className="orders-header"><div><h1>Pedidos al centro</h1><p>Pide al centro de producción los elaborados e insumos que necesitas. Cuando lleguen, confirma lo recibido y entran a la bodega del restaurante con su costo.</p></div><button className="new-location-button" onClick={() => setShowForm(true)}>+ Nuevo pedido</button></div>
    <section className="orders-empty">Aún no hay pedidos de este restaurante.</section>
    {showForm && <OrderForm onClose={() => setShowForm(false)} />}
  </div>
}

function OrderForm({ onClose }) {
  const [products, setProducts] = useState([0])
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="order-form" onSubmit={(event) => { event.preventDefault(); onClose() }}>
      <h2>Nuevo pedido al centro</h2>
      <div className="form-two-columns order-meta"><label>Lo necesito para (opcional)<input type="date" /></label><label>Nota (opcional)<input placeholder="Ej. fin de semana largo" /></label></div>
      <label>Productos</label>
      {products.map((product, index) => <div className="order-product-row" key={product}><select defaultValue=""><option value="">Elegir...</option><option>Insumo elaborado</option><option>Producto de cocina</option></select><input type="number" defaultValue="1" min="1" /><button type="button" onClick={() => setProducts(products.filter((_, itemIndex) => itemIndex !== index))}>×</button></div>)}
      <button type="button" className="add-product-link" onClick={() => setProducts([...products, products.length])}>+ Agregar producto</button>
      <div className="form-actions"><button type="button" className="cancel-form-button" onClick={onClose}>Cancelar</button><button type="submit" className="save-form-button">Enviar pedido</button></div>
    </form>
  </div>
}

function RestaurantsPage() {
  return <div className="restaurants-page">
    <div className="restaurants-header">
      <div><h1>Restaurantes</h1><p>Cada restaurante tiene sus propias mesas, cocina, bodega y caja. Tus meseros, cajeros y cocina eligen el restaurante al entrar. Si produces en un lugar aparte, crea un <strong>centro de producción</strong>: no vende, solo produce y abastece a tus restaurantes con sus pedidos. (Prueba: hasta 3 · Plan pagado: ilimitados)</p></div>
      <button className="new-location-button">+ Nuevo local</button>
    </div>
    <div className="restaurants-grid">{restaurants.map((restaurant) => <article className="restaurant-card" key={restaurant.name}>
      <div className="restaurant-card-heading"><div><h2>{restaurant.name}</h2><p>{restaurant.detail}</p></div><span className="status-badge">Activo</span></div>
      <div className="restaurant-actions"><button className="rename-button">Renombrar</button><button className="disable-button">Desactivar</button></div>
    </article>)}</div>
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
    if (activeItem === 'Restaurantes') return <RestaurantsPage />
    if (activeItem === 'Productos') return <ProductsPage />
    if (activeItem === 'Inventario') return <InventoryPage />
    if (activeItem === 'Bodegas') return <WarehousesPage />
    if (activeItem === 'Pedidos al centro') return <OrdersPage />
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
