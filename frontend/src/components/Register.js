"use client"

import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom"
import { Button, Form, Container, Alert, Card, Spinner, ProgressBar } from "react-bootstrap"
import api from "../api"
import VantaBackground from "./VantaBackground"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    variant: "secondary",
  });
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }, []);

  // Check password strength
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength({
        score: 0,
        message: "",
        variant: "secondary",
      });
      return;
    }

    let score = 0;

    // Length check
    if (formData.password.length >= 8) score += 1;

    // Uppercase check
    if (/[A-Z]/.test(formData.password)) score += 1;

    // Number check
    if (/[0-9]/.test(formData.password)) score += 1;

    // Special character check
    if (/[^A-Za-z0-9]/.test(formData.password)) score += 1;

    let message = "";
    let variant = "secondary";

    switch (score) {
      case 0:
      case 1:
        message = "Débil";
        variant = "danger";
        break;
      case 2:
        message = "Regular";
        variant = "warning";
        break;
      case 3:
        message = "Buena";
        variant = "info";
        break;
      case 4:
        message = "Fuerte";
        variant = "success";
        break;
      default:
        message = "";
        variant = "secondary";
    }

    setPasswordStrength({
      score,
      message,
      variant,
    });
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/register/", formData);
      if (response.status === 201) {
        navigate("/login");
      }
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Error de registro";

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
              messages.push(`${key}: ${errorData[key].join(", ")}`);
            } else {
              messages.push(`${key}: ${errorData[key]}`);
            }
          }
          errorMessage = messages.join(" | ");
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="auth-container glass-effect fade-in">
        <Card className="auth-card">
          <Card.Body className="p-3 p-md-4">
            <div className="text-center mb-3">
              <h1 className="form-title">Crear cuenta</h1>
              <p className="form-subtitle">Regístrate para comenzar a administrar tus finanzas</p>
            </div>

            {error && (
              <Alert variant="danger" className="auth-alert">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-circle-fill me-2"></i>
                  <span>{error}</span>
                </div>
              </Alert>
            )}

            <Form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  required
                  className="form-control-lg"
                  placeholder="Tu nombre"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo electrónico</label>
                <input
                  type="email"
                  required
                  className="form-control-lg"
                  placeholder="ejemplo@correo.com"
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  required
                  minLength="8"
                  className="form-control-lg"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />

                {formData.password && (
                  <div className="mt-2">
                    <ProgressBar
                      now={(passwordStrength.score / 4) * 100}
                      variant={passwordStrength.variant}
                      className="password-strength-bar"
                    />
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <small className="text-muted">Seguridad: {passwordStrength.message}</small>
                      <small className="text-muted">{passwordStrength.score}/4</small>
                    </div>
                  </div>
                )}

                <small className="text-muted">Mínimo 8 caracteres, 1 mayúscula y 1 número</small>
              </div>

              <Button 
                className="auth-button" 
                variant="primary" 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner 
                      as="span" 
                      animation="border" 
                      size="sm" 
                      role="status" 
                      aria-hidden="true" 
                      className="me-2" 
                    />
                    Registrando...
                  </>
                ) : (
                  "Crear cuenta"
                )}
              </Button>

              <div className="register-section">
                <p className="register-text">
                  ¿Ya tienes una cuenta?{" "}
                  <button 
                    type="button"
                    className="register-button" 
                    onClick={() => navigate("/login")}
                    disabled={isLoading}
                  >
                    Inicia sesión
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

export default Register;
