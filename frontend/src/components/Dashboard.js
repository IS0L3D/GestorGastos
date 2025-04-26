// src/components/Dashboard.js

import React, { useEffect, useState } from 'react';
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
  const [dashboardData, setDashboardData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bloquear/desbloquear scroll de fondo al abrir/cerrar sidebar
  useEffect(() => {
    document.body.classList.toggle('no-scroll', sidebarOpen);
  }, [sidebarOpen]);

  useEffect(() => {
    api.get('/presupuestos/dashboard/')
      .then(res => setDashboardData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!dashboardData) {
    return (
      <div className="dashboard-loading">
        <div className="skeleton-card" />
        <div className="skeleton-card" />
      </div>
    );
  }

  const { categorias } = dashboardData;
  const colores = ['#4ade80','#60a5fa','#f87171','#facc15','#a78bfa','#f472b6','#34d399','#38bdf8'];

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
      legend: {
        position: 'top',
        labels: { usePointStyle: true, padding: 12 }
      },
      tooltip: {
        callbacks: {
          label: ctx => `${ctx.dataset.label}: $${ctx.raw.toFixed(2)}`
        }
      }
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: v => `$${v}` } },
      x: { grid: { display: false } }
    }
  };

  const totalAs = categorias.reduce((s, c) => s + c.asignado, 0);
  const totalGs = categorias.reduce((s, c) => s + c.gastado, 0);
  const balance = totalAs - totalGs;

  return (
    <div className="dashboard-wrapper">
      <aside className={`sidebar glass-effect ${sidebarOpen ? 'open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}><FiX/></button>
        <h2 className="sidebar-title">Acciones</h2>
        <button className="sidebar-button"><FiMinusCircle/> Agregar Gasto</button>
        <button className="sidebar-button"><FiPlusCircle/> Agregar Ingreso</button>
        <button className="sidebar-button"><FiFileText/> Generar Reporte</button>
        <button className="sidebar-button logout"><FiLogOut/> Cerrar Sesión</button>
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
                <div className="summary-content">
                  <h3>Total Asignado</h3>
                  <p>${totalAs.toFixed(2)}</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon"><FiTrendingDown/></div>
                <div className="summary-content">
                  <h3>Total Gastado</h3>
                  <p>${totalGs.toFixed(2)}</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon"><FiTrendingUp/></div>
                <div className="summary-content">
                  <h3>Balance</h3>
                  <p className={balance >= 0 ? 'positive' : 'negative'}>${balance.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card chart-card glass-effect">
              <div className="card-header">
                <FiPieChart className="card-icon"/>
                <h2>Distribución</h2>
              </div>
              <div className="dashboard-chart-container">
                <Doughnut data={doughnutData}/>
              </div>
            </div>
            <div className="dashboard-card chart-card glass-effect">
              <div className="card-header">
                <FiBarChart2 className="card-icon"/>
                <h2>Asignado vs Gastado</h2>
              </div>
              <div className="dashboard-chart-container">
                <Bar data={barData} options={barOptions}/>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
