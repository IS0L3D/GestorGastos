import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Button, Form, Container, Alert } from 'react-bootstrap';
import './Register.css'; // Importamos los estilos

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('http://localhost:8000/api/register/', formData);
      if (response.status === 201) {
        navigate('/login');
      }
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = 'Error de registro';
      
      if (errorData) {
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        } else if (errorData.password) {
          errorMessage = `Contraseña: ${errorData.password[0]}`;
        } else {
          const messages = [];
          for (const key in errorData) {
            if (Array.isArray(errorData[key])) {
              messages.push(`${key}: ${errorData[key].join(', ')}`);
            } else {
              messages.push(`${key}: ${errorData[key]}`);
            }
          }
          errorMessage = messages.join(' | ');
        }
      }
      
      setError(errorMessage);
    }
  };

  return (
    <Container className="register-container">
      <h2 className="register-title">Registro de Usuario</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit} className="register-form">
        <Form.Group className="form-group">
          <Form.Label className="form-label">Nombre</Form.Label>
          <Form.Control
            type="text"
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Form.Group>
        
        <Form.Group className="form-group">
          <Form.Label className="form-label">Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Form.Group>
        
        <Form.Group className="form-group password-group">
          <Form.Label className="form-label">Contraseña</Form.Label>
          <div className="password-container">
            <Form.Control
              type={showPassword ? "text" : "password"}
              required
              minLength="8"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="password-input"
            />
            <Button variant="link" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "👁️" : "🙈"} {/* Ícono dentro del campo */}
            </Button>
          </div>
          <span className="password-hint">Mínimo 8 caracteres, 1 mayúscula y 1 número</span>
        </Form.Group>   
        
        <Button className="register-button" variant="primary" type="submit">
          Registrarse
        </Button>

        {/* Botón para iniciar sesión con diseño similar en azul */}
        <Button 
          className="login-button" 
          variant="primary" 
          onClick={() => navigate('/login')}
        >
          Iniciar Sesión
        </Button>
      </Form>
    </Container>
  );
};

export default Register;
