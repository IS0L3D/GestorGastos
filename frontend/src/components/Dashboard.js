// src/components/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import api from '../api';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    api.get('/presupuestos/dashboard/')
      .then(response => setDashboardData(response.data))
      .catch(error => console.error('Error al cargar el dashboard:', error));
  }, []);

  if (!dashboardData) {
    return <div className="text-center py-10 text-lg text-gray-600">Cargando datos...</div>;
  }

  const { categorias } = dashboardData;

  const colores = [
    '#4ade80', '#60a5fa', '#f87171', '#facc15', '#a78bfa',
    '#f472b6', '#34d399', '#38bdf8'
  ];

  const doughnutData = {
    labels: categorias.map(c => c.nombre),
    datasets: [{
      label: 'Presupuesto asignado',
      data: categorias.map(c => c.asignado),
      backgroundColor: colores,
      borderColor: '#fff',
      borderWidth: 2,
    }]
  };

  const barData = {
    labels: categorias.map(c => c.nombre),
    datasets: [
      {
        label: 'Asignado',
        data: categorias.map(c => c.asignado),
        backgroundColor: '#60a5fa',
      },
      {
        label: 'Gastado',
        data: categorias.map(c => c.gastado),
        backgroundColor: '#f87171',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: $${context.raw.toFixed(2)}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => `$${value}`
        }
      }
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white shadow-xl rounded-2xl p-4">
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">Distribución de Presupuesto</h2>
        <Doughnut data={doughnutData} />
      </div>
      <div className="bg-white shadow-xl rounded-2xl p-4">
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">Asignado vs Gastado</h2>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
};

export default Dashboard;