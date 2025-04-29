import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Button, Form, Container, Alert } from 'react-bootstrap';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login/', credentials);
      if (response.data.access) {
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        
        const configResponse = await api.get('/user/config-status/');
        if (!configResponse.data.has_configured_budget) {
          navigate('/setup');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      let errorMessage = 'Error de conexión';
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = 'Credenciales inválidas';
        } else if (err.response.status >= 500) {
          errorMessage = 'Error del servidor';
        }
      }
      setError(errorMessage);
    }
  };

  return (
    <Container className="login-container">
      <h2 className="login-form-title">Iniciar Sesión</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleLogin} className="login-form">
        <Form.Group className="login-form-group">
          <Form.Label className="login-form-label">Email</Form.Label>
          <Form.Control
            type="email"
            required
            className="login-form-control"
            placeholder="ejemplo@correo.com"
            onChange={(e) =>
              setCredentials({ ...credentials, email: e.target.value })
            }
          />
        </Form.Group>

        <Form.Group className="login-form-group">
          <Form.Label className="login-form-label">Contraseña</Form.Label>
          <div className="login-password-container">
            <Form.Control
              type={showPassword ? "text" : "password"}
              required
              className="login-form-control"
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
            />
            <Button
              variant="link"
              className="login-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "🙈"}
            </Button>
          </div>
        </Form.Group>
        
        <Button className="login-submit-button" variant="primary" type="submit">
          Ingresar
        </Button>
        <Button
          className="login-register-button"
          variant="link"
          onClick={() => navigate('/register')}
        >
          ¿No tienes cuenta? Regístrate
        </Button>
      </Form>
    </Container>
  );
};

export default Login;
