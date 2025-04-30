// src/components/Dashboard.js

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

// Registra módulos de ChartJS
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({ categorias: [] });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);

  // Referencias a los charts
  const doughnutChartRef = useRef(null);
  const barChartRef = useRef(null);

  // Bloquea/desbloquea el scroll de fondo al abrir/cerrar la sidebar
  useEffect(() => {
    document.body.classList.toggle('no-scroll', sidebarOpen);
  }, [sidebarOpen]);

  // Carga la data del dashboard
  useEffect(() => {
    api.get('/presupuestos/dashboard/')
      .then(res => {
        console.log('API Response:', res.data); // Verifica que categorías existe
        if (res.data?.categorias) {
          setDashboardData(res.data);
        }
      })
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = '/login';
  };

  const handleGenerateReport = () => {
    const doc = new jsPDF('p', 'mm', 'a4');
  
    // Título del reporte
    doc.setFontSize(18);
    doc.text("Reporte Financiero", 14, 22);
  
    // Información resumida del dashboard
    doc.setFontSize(12);
    doc.text(`Total Asignado: $${totalAs.toFixed(2)}`, 14, 32);
    doc.text(`Total Gastado: $${totalGs.toFixed(2)}`, 14, 40);
    doc.text(`Balance: $${balance.toFixed(2)}`, 14, 48);
  
    // Extraer imagen de la gráfica Doughnut
    const doughnutCanvas = doughnutChartRef.current?.canvas;
    if (doughnutCanvas) {
      const doughnutImage = doughnutCanvas.toDataURL("image/png", 1.0);
      doc.addImage(doughnutImage, 'PNG', 15, 55, 80, 80);
    }
  
    // Extraer imagen de la gráfica de barras
    const barCanvas = barChartRef.current?.canvas;
    if (barCanvas) {
      const barImage = barCanvas.toDataURL("image/png", 1.0);
      doc.addImage(barImage, 'PNG', 105, 55, 80, 80);
    }
  
    // Crear la tabla con detalle de cada categoría
    const tableColumns = [["Categoría", "Asignado", "Gastado", "Balance"]];
    const tableData = categorias.map(cat => {
      const catBalance = cat.asignado - cat.gastado;
      return [
        cat.nombre,
        `$${cat.asignado.toFixed(2)}`,
        `$${cat.gastado.toFixed(2)}`,
        `$${catBalance.toFixed(2)}`
      ];
    });
  
    // Usar autoTable pasándole la instancia del documento y las opciones
    autoTable(doc, {
      head: tableColumns,
      body: tableData,
      startY: 145,
      theme: 'striped',
      margin: { left: 14, right: 14 },
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 }
    });
  
    doc.save("reporte_financiero.pdf");
  };
  

  const handleExpenseSubmit = (expenseData) => {
    // Ajustamos el payload para que coincida con lo que el backend espera:
    // Se usa 'categoria' en lugar de 'categoriaId'.
    const expensePayload = { 
      categoria: expenseData.categoriaId,
      monto: parseFloat(expenseData.monto),
      descripcion: expenseData.descripcion,
      fecha: expenseData.fecha,
      tipo: 'Gasto'
    };
  
    api.post('/transacciones/', expensePayload)
      .then(postRes => {
        console.log('Respuesta después del POST:', postRes.data);
        // Luego de registrar el gasto, actualizamos el dashboard haciendo una nueva llamada GET.
        return api.get('/presupuestos/dashboard/');
      })
      .then(getRes => {
        const updatedData = getRes.data;
        // Verificamos que 'categorias' sea un arreglo, sino usamos un array vacío.
        const categorias = Array.isArray(updatedData.categorias) ? updatedData.categorias : [];
        setDashboardData({ ...updatedData, categorias });
        
        // Buscamos la categoría asociada
        const categoria = categorias.find(c => c.id === expenseData.categoriaId);
        if (categoria && categoria.gastado > categoria.asignado) {
          alert(`Alerta: El gasto en ${categoria.nombre} ha excedido el presupuesto asignado.`);
        }
        setShowExpenseModal(false);
      })
      .catch(err => console.error(err));
  };
  
  
  
  

  const handleIncomeSubmit = (incomeData) => {
    api.post('/presupuestos/ingreso/', incomeData)
      .then(res => {
        setDashboardData(res.data);
        setShowIncomeModal(false);
      })
      .catch(err => console.error(err));
  };

  return (
    <div className="dashboard-wrapper">
      <aside className={`sidebar glass-effect ${sidebarOpen ? 'open' : ''}`}>
        <button 
          className="sidebar-close-btn" 
          onClick={() => setSidebarOpen(false)}
        >
          <FiX/>
        </button>
        <h2 className="sidebar-title">Acciones</h2>
        <button 
          className="sidebar-button" 
          onClick={() => setShowExpenseModal(true)}
        >
          <FiMinusCircle/> Agregar Gasto
        </button>
        <button 
          className="sidebar-button" 
          onClick={() => setShowIncomeModal(true)}
        >
          <FiPlusCircle/> Agregar Ingreso
        </button>
        <button 
          className="sidebar-button" 
          onClick={handleGenerateReport}
        >
          <FiFileText/> Generar Reporte
        </button>
        <button 
          className="sidebar-button logout" 
          onClick={handleLogout}
        >
          <FiLogOut/> Cerrar Sesión
        </button>
      </aside>

      <main className="main-content">
        <header className="dashboard-header-mobile glass-effect">
          <button 
            className="sidebar-toggle" 
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu/>
          </button>
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
            <div className="dashboard-card chart-card">
              <div className="card-header">
                <FiPieChart className="card-icon"/>
                <h2>Distribución</h2>
              </div>
              <div className="dashboard-chart-container">
                {/* Asignamos una ref para obtener el canvas */}
                <Doughnut ref={doughnutChartRef} data={doughnutData}/>
              </div>
            </div>
            <div className="dashboard-card chart-card">
              <div className="card-header">
                <FiBarChart2 className="card-icon"/>
                <h2>Asignado vs Gastado</h2>
              </div>
              <div className="dashboard-chart-container">
                <Bar ref={barChartRef} data={barData} options={barOptions}/>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal para agregar gasto */}
      {showExpenseModal && (
        <ExpenseModal 
          categories={categorias} 
          onClose={() => setShowExpenseModal(false)} 
          onSubmit={handleExpenseSubmit} 
        />
      )}

      {/* Modal para agregar ingreso */}
      {showIncomeModal && (
        <IncomeModal 
          categories={categorias} 
          onClose={() => setShowIncomeModal(false)} 
          onSubmit={handleIncomeSubmit} 
        />
      )}
    </div>
  );
};



export default Dashboard;
