import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Container, Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { PlusCircle, Sliders, Trash } from 'react-bootstrap-icons';
import './Setup.css';

const Setup = () => {
  const navigate = useNavigate();
  const [totalBudget, setTotalBudget] = useState(0);
  const [predefinedCats, setPredefinedCats] = useState([
    { name: 'Alimentación', allocated: 0, predefined: true },
    { name: 'Hospedaje', allocated: 0, predefined: true },
    { name: 'Transporte', allocated: 0, predefined: true },
    { name: 'Colegiatura', allocated: 0, predefined: true },
    { name: 'Materiales', allocated: 0, predefined: true },
    { name: 'Salud', allocated: 0, predefined: true },
    { name: 'Ocio', allocated: 0, predefined: true }
  ]);
  const [customCats, setCustomCats] = useState([]);
  const [newCustomCat, setNewCustomCat] = useState('');
  const [error, setError] = useState('');
  const [remainingBudget, setRemainingBudget] = useState(0);

  useEffect(() => {
    const totalAllocated = [...predefinedCats, ...customCats].reduce(
      (sum, cat) => sum + cat.allocated, 0
    );
    const rem = parseFloat((totalBudget - totalAllocated).toFixed(2));
    setRemainingBudget(rem);
  }, [totalBudget, predefinedCats, customCats]);

  const handleAddCustomCat = () => {
    if (newCustomCat.trim() && !customCats.some(cat => cat.name === newCustomCat)) {
      setCustomCats([
        ...customCats,
        { name: newCustomCat.trim(), allocated: 0, predefined: false }
      ]);
      setNewCustomCat('');
    }
  };

  
  const handleSliderChange = (categoryType, index, e) => {
    const inputValue = parseFloat(e.target.value);
    let currentAllocated;
    if (categoryType === 'predefined') {
      currentAllocated = predefinedCats[index].allocated;
    } else {
      currentAllocated = customCats[index].allocated;
    }
    
    const newValue = Math.min(inputValue, currentAllocated + remainingBudget);

    if (categoryType === 'predefined') {
      const updated = [...predefinedCats];
      updated[index].allocated = newValue;
      setPredefinedCats(updated);
    } else {
      const updated = [...customCats];
      updated[index].allocated = newValue;
      setCustomCats(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (remainingBudget !== 0) {
        throw new Error(
          `Presupuesto no asignado completamente. Restante: $${remainingBudget.toFixed(2)}`
        );
      }

      const response = await api.post('/presupuestos/initial-setup/', {
        total_budget: totalBudget,
        categories: [...predefinedCats, ...customCats].filter(cat => cat.allocated > 0)
      });

      if (response.status === 201) {
        await api.patch('/user/config-status/');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleDeleteCategory = (index) => {
    const updatedCats = customCats.filter((_, i) => i !== index);
    setCustomCats(updatedCats);
  };
  //generar pdf
  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await api.get('/presupuestos/pdf/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', // importante para recibir un archivo
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte_gastos.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setError('Error al generar el PDF.');
    }
  };


  return (
    <Container className="setup-container py-5">
      <div className="grid-wrapper">
        <h1 className="main-title">🏁 Configuración Inicial</h1>
        <Form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Grupo de presupuesto */}
            <div className="budget-group">
              <Form.Group className="mb-4">
                <Form.Label className="h4">💰 Presupuesto Mensual Total</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    value={totalBudget || ''}
                    onChange={(e) => setTotalBudget(parseFloat(e.target.value))}
                    placeholder="Ej: 1500.00"
                  />
                </InputGroup>
              </Form.Group>
            </div>
  
            {/* Categorías predefinidas */}
            <div className="predefined-categories">
              <h4 className="mb-3">📦 Categorías Predefinidas</h4>
              {predefinedCats.map((cat, index) => (
                <div key={cat.name} className="predefined-cat-item">
                  <Form.Label>
                    {cat.name} - ${cat.allocated.toFixed(2)}
                    <span className="text-muted ms-2">
                      ({totalBudget ? ((cat.allocated / totalBudget) * 100).toFixed(1) : 0}%)
                    </span>
                  </Form.Label>
                  <Form.Range
                    className="form-range"
                    value={cat.allocated}
                    min="0"
                    max={totalBudget}
                    step="0.01"
                    onChange={(e) => handleSliderChange('predefined', index, e)}
                    disabled={!totalBudget}
                    style={{
                      '--progress': totalBudget ? `${(cat.allocated / totalBudget) * 100}%` : '0%'
                    }}
                  />
                </div>
              ))}
            </div>
  
            {/* Categorías personalizadas */}
            <div className="custom-categories">
              <h4 className="mb-4">✨ Categorías Personalizadas</h4>
              <div className="mb-4 custom-input-wrapper">
                <Form.Control
                  type="text"
                  value={newCustomCat}
                  onChange={(e) => setNewCustomCat(e.target.value)}
                  placeholder="Nueva categoría (Ej: Gym)"
                  disabled={!totalBudget}
                  className="custom-category-input" 
                />
                <Button
                  className="custom-add-button"
                  onClick={handleAddCustomCat}
                  disabled={!newCustomCat.trim() || !totalBudget}
                >
                  <PlusCircle className="me-2" />
                  Agregar
                </Button>
              </div>
              <div className="category-list">
                {customCats.map((cat, index) => (
                  <div key={cat.name} className="category-item">
                    <div className="category-left">
                      <Form.Label className="category-label">
                        {cat.name} - ${cat.allocated.toFixed(2)}
                        <span className="text-muted ms-2">
                          ({totalBudget ? ((cat.allocated / totalBudget) * 100).toFixed(1) : 0}%)
                        </span>
                      </Form.Label>
                      <Form.Range
                        className="form-range"
                        value={cat.allocated}
                        min="0"
                        max={totalBudget}
                        step="0.01"
                        onChange={(e) => handleSliderChange('custom', index, e)}
                        style={{
                          '--progress': totalBudget ? `${(cat.allocated / totalBudget) * 100}%` : '0%'
                        }}
                      />
                    </div>
                    <button className="delete-button" onClick={() => handleDeleteCategory(index)}>
                      <Trash className="trash-icon" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Resumen de asignación */}
            <div className="summary-card">
              <Row>
                <Col md={6}>
                  <h5 className="mb-3">📊 Resumen de asignación</h5>
                  <div className="summary-item">
                    <span>Total asignado:</span>
                    <strong>${(totalBudget - remainingBudget).toFixed(2)}</strong>
                  </div>
                  <div className="divider"></div>
                  <div className="summary-item">
                    <span>Presupuesto restante:</span>
                    <strong className={remainingBudget !== 0 ? 'text-danger' : 'text-success'}>
                      ${remainingBudget.toFixed(2)}
                    </strong>
                  </div>
                </Col>
                <Col md={6} className="d-flex align-items-center">
                  <Button
                    variant={Math.abs(remainingBudget) < 0.01 ? 'success' : 'secondary'}
                    type="submit"
                    className="w-100 py-3"
                    disabled={Math.abs(remainingBudget) >= 0.01 || !totalBudget}
                  >
                    <Sliders className="me-2" />
                    {remainingBudget === 0 ? '✅ Completar Configuración' : 'Ajusta tu presupuesto'}
                  </Button>
                  <Button
                      variant="info"
                      className="w-100 py-3 mt-3"
                      onClick={handleDownloadPDF}
                  >
                    📄 Generar Reporte en PDF
                  </Button>

                </Col>
              </Row>
            </div>
          </div>
        </Form>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
    </Container>
  );
  };
  
  export default Setup;
  