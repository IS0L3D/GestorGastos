// src/App.js
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VantaBackground from './components/VantaBackground';
import Login from './components/Login';
import Register from './components/Register';
import Setup from './components/Setup';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <VantaBackground />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
