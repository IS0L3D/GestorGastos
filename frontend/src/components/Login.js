import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Button, Form, Container, Alert } from 'react-bootstrap';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('http://localhost:8000/api/login/', credentials);
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <Container className="auth-container">
    <h2 className="form-title">Iniciar Sesión</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleLogin}>
        <Form.Group className="mb-3">
        <Form.Label className="fw-bold">Email</Form.Label>
        <Form.Control
            type="email"
            required
            className="form-control-lg"
            placeholder="ejemplo@correo.com"
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
        />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            required
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
        </Form.Group>
        
        <Button className="auth-button" variant="primary" type="submit">Ingresar</Button>
        <Button variant="link" onClick={() => navigate('/register')}>
          ¿No tienes cuenta? Regístrate
        </Button>
      </Form>
    </Container>
  );
};

export default Login;