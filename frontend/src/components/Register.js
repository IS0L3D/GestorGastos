import React, { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import api from '../api';
import { Button, Form, Container, Alert } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
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
        }
        else if (errorData.email) {
          errorMessage = `Email: ${errorData.email[0]}`;
        }
        else if (errorData.password) {
          errorMessage = `Contraseña: ${errorData.password[0]}`;
        }
        else {
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
    <Container className="mt-5" style={{ maxWidth: '400px' }}>
      <h2>Registro de Usuario</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            required
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            required
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            type="password"
            required
            minLength="8"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Form.Text>Mínimo 8 caracteres, 1 mayúscula y 1 número</Form.Text>
        </Form.Group>
        
        <Button variant="primary" type="submit">Registrarse</Button>
      </Form>
    </Container>
  );
};

export default Register;