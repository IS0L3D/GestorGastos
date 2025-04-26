import React, { useState } from 'react';
import { useNavigate } from "react-router-dom"
import { Button, Form, Container, Alert, Card, Spinner } from "react-bootstrap"
import api from "../api"
import VantaBackground from "./VantaBackground"

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
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
    } finally {
        setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="auth-container glass-effect fade-in">
        <Card className="auth-card">
          <Card.Body className="p-3 p-md-4">
            <div className="text-center mb-3">
              <h1 className="form-title">Bienvenido</h1>
              <p className="form-subtitle">Inicia sesión para administrar tus finanzas</p>
            </div>

            {error && (
              <Alert variant="danger" className="auth-alert">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-circle-fill me-2"></i>
                  <span>{error}</span>
                </div>
              </Alert>
            )}

            <Form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  required
                  className="form-control-lg"
                  placeholder="ejemplo@correo.com"
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  required
                  className="form-control-lg"
                  placeholder="••••••••"
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="d-flex justify-content-end mb-3">
                <a href="#" className="password-reset-link">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <Button 
                className="auth-button" 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>

              <div className="register-section">
                <p className="register-text">
                  ¿No tienes cuenta?{" "}
                  <button 
                    type="button"
                    className="register-button" 
                    onClick={() => navigate("/register")}
                    disabled={loading}
                  >
                    Regístrate
                  </button>
                </p>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Login;