// src/App.js
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VantaBackground from './components/VantaBackground';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  return (
    <BrowserRouter>
      {}
      <VantaBackground />

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
