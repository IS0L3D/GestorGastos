import React, { useEffect, useState, useRef } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api';
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPieChart,
  FiBarChart2,
  FiPlusCircle,
  FiMinusCircle,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import '../styles/Dashboard.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Dashboard = () => {
  const [data, setData] = useState({ categorias: [] });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const doughnutChartRef = useRef(null);
  const barChartRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('no-scroll', sidebarOpen);
  }, [sidebarOpen]);

  useEffect(() => {
    api.get('/presupuestos/dashboard/')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const {
    total_presupuesto,
    total_gastado,
    total_ingresos,
    total_restante,
    categorias
  } = data;

  const colores = ['#4ade80', '#60a5fa', '#f87171', '#facc15', '#a78bfa', '#f472b6', '#34d399', '#38bdf8'];

  const doughnutData = {
    labels: categorias.map(c => c.nombre),
    datasets: [{
      data: categorias.map(c => c.asignado),
      backgroundColor: colores,
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  const barData = {
    labels: categorias.map(c => c.nombre),
    datasets: [
      { label: 'Asignado', data: categorias.map(c => c.asignado), borderRadius: 6 },
      { label: 'Gastado',  data: categorias.map(c => c.gastado),  borderRadius: 6 }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 12 } },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: $${ctx.raw.toFixed(2)}` } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: v => `$${v}` } },
      x: { grid: { display: false } }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleGenerateReport = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    doc.setFontSize(18);
    doc.text('Reporte Financiero', 14, 22);
    doc.setFontSize(12);
    doc.text(`Total Presupuesto: $${total_presupuesto.toFixed(2)}`, 14, 32);
    doc.text(`Total Gastado: $${total_gastado.toFixed(2)}`, 14, 40);
    doc.text(`Total Ingresos: $${total_ingresos.toFixed(2)}`, 14, 48);
    doc.text(`Total Restante: $${total_restante.toFixed(2)}`, 14, 56);

    const dCanvas = doughnutChartRef.current?.canvas;
    if (dCanvas) {
      doc.addImage(dCanvas.toDataURL('image/png'), 'PNG', 15, 65, 80, 80);
    }
    const bCanvas = barChartRef.current?.canvas;
    if (bCanvas) {
      doc.addImage(bCanvas.toDataURL('image/png'), 'PNG', 105, 65, 80, 80);
    }

    const cols = [['Categoría', 'Asignado', 'Gastado', 'Ingresado', 'Restante']];
    const rows = categorias.map(cat => [
      cat.nombre,
      `$${cat.asignado.toFixed(2)}`,
      `$${cat.gastado.toFixed(2)}`,
      `$${cat.ingresado.toFixed(2)}`,
      `$${cat.restante.toFixed(2)}`
    ]);
    autoTable(doc, { head: cols, body: rows, startY: 150, theme: 'striped', margin: { left: 14, right: 14 }, headStyles: { fillColor: [41, 128, 185] }, styles: { fontSize: 10 } });

    doc.save('reporte_financiero.pdf');
  };

  const handleExpenseSubmit = (expenseData) => {
    const payload = { categoria: expenseData.categoriaId, monto: parseFloat(expenseData.monto), descripcion: expenseData.descripcion, fecha: expenseData.fecha, tipo: 'Gasto' };
    api.post('/transacciones/', payload)
      .then(() => api.get('/presupuestos/dashboard/'))
      .then(res => setData(res.data))
      .finally(() => setShowExpenseModal(false))
      .catch(err => console.error(err));
  };

  const handleIncomeSubmit = (incomeData) => {
    const payload = { categoria: incomeData.categoriaId, monto: parseFloat(incomeData.monto), descripcion: incomeData.descripcion, fecha: incomeData.fecha, tipo: 'Ingreso' };
    api.post('/transacciones/', payload)
      .then(() => api.get('/presupuestos/dashboard/'))
      .then(res => setData(res.data))
      .finally(() => setShowIncomeModal(false))
      .catch(err => console.error(err));
  };

  return (
    <div className="dashboard-wrapper">
      <aside className={`sidebar glass-effect ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}><FiX/></button>
        <h2 className="sidebar-title">Acciones</h2>
        <button className="sidebar-button" onClick={() => setShowExpenseModal(true)}><FiMinusCircle/> Agregar Gasto</button>
        <button className="sidebar-button" onClick={() => setShowIncomeModal(true)}><FiPlusCircle/> Agregar Ingreso</button>
        <button className="sidebar-button" onClick={handleGenerateReport}><FiFileText/> Generar Reporte</button>
        <button className="sidebar-button logout" onClick={handleLogout}><FiLogOut/> Cerrar Sesión</button>
      </aside>

      <main className="main-content">
        <header className="dashboard-header-mobile glass-effect">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(true)}><FiMenu/></button>
          <h1>Dashboard Financiero</h1>
        </header>

        <div className="dashboard-container glass-effect fade-in">
          <div className="dashboard-header">
            <h1 className="no-mobile">Dashboard Financiero</h1>
            <div className="dashboard-summary-cards">
              <div className="summary-card">
                <div className="summary-icon"><FiDollarSign/></div>
                <div className="summary-content"><h3>Total Presupuesto</h3><p>${total_presupuesto?.toFixed(2)}</p></div>
              </div>
              <div className="summary-card">
                <div className="summary-icon"><FiTrendingDown/></div>
                <div className="summary-content"><h3>Total Gastado</h3><p>${total_gastado?.toFixed(2)}</p></div>
              </div>
              <div className="summary-card">
                <div className="summary-icon"><FiPlusCircle/></div>
                <div className="summary-content"><h3>Total Ingresos</h3><p>${total_ingresos?.toFixed(2)}</p></div>
              </div>
              <div className="summary-card">
                <div className="summary-icon"><FiTrendingUp/></div>
                <div className="summary-content"><h3>Total Restante</h3><p className={total_restante>=0?'positive':'negative'}>${total_restante?.toFixed(2)}</p></div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card chart-card glass-effect">
              <div className="card-header"><FiPieChart className="card-icon"/><h2>Distribución</h2></div>
              <div className="dashboard-chart-container"><Doughnut ref={doughnutChartRef} data={doughnutData}/></div>
            </div>
            <div className="dashboard-card chart-card glass-effect">
              <div className="card-header"><FiBarChart2 className="card-icon"/><h2>Asignado vs Gastado</h2></div>
              <div className="dashboard-chart-container"><Bar ref={barChartRef} data={barData} options={barOptions}/></div>
            </div>
          </div>
        </div>
      </main>

      {showExpenseModal && <ExpenseModal categories={categorias} onClose={() => setShowExpenseModal(false)} onSubmit={handleExpenseSubmit}/>}      {showIncomeModal && <IncomeModal categories={categorias} onClose={() => setShowIncomeModal(false)} onSubmit={handleIncomeSubmit}/>}    </div>
  );
};

export default Dashboard;

/* ---------------------------------------------------
   Modal para Agregar Gasto
--------------------------------------------------- */
const ExpenseModal = ({ categories = [], onClose, onSubmit }) => {
  const [categoriaId, setCategoriaId] = useState(categories[0]?.id || '');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  // Inicializamos la fecha con la fecha actual en formato "YYYY-MM-DD"
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Incluimos el campo 'fecha' en el objeto que se envía
    const expenseData = {
      categoriaId,
      monto: parseFloat(monto),
      descripcion,
      fecha
    };
    onSubmit(expenseData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agregar Gasto</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Categoría:
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </label>
          <label>
            Monto:
            <input 
              type="number" 
              step="0.01" 
              value={monto} 
              onChange={(e) => setMonto(e.target.value)} 
              required
            />
          </label>
          <label>
            Descripción:
            <input 
              type="text" 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
            />
          </label>
          <label>
            Fecha:
            <input 
              type="date" 
              value={fecha} 
              onChange={(e) => setFecha(e.target.value)} 
              required
            />
          </label>
          <div className="modal-actions">
            <button type="submit">Registrar Gasto</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------------------------------------------------
   Modal para Agregar Ingreso
--------------------------------------------------- */
const IncomeModal = ({ categories = [], onClose, onSubmit }) => {
  const [categoriaId, setCategoriaId] = useState(categories[0]?.id || '');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const incomeData = {
      categoriaId,
      monto: parseFloat(monto),
      descripcion,
      fecha
    };
    onSubmit(incomeData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Agregar Ingreso</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Categoría:
            <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nombre}</option>
              ))}
            </select>
          </label>
          <label>
            Monto:
            <input
              type="number"
              step="0.01"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              required
            />
          </label>
          <label>
            Descripción:
            <input
              type="text"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />
          </label>
          <label>
            Fecha:
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              required
            />
          </label>
          <div className="modal-actions">
            <button type="submit">Registrar Ingreso</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};