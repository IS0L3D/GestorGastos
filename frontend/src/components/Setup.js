import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Container, Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { PlusCircle, Sliders } from 'react-bootstrap-icons';

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
        const totalAllocated = [...predefinedCats, ...customCats].reduce((sum, cat) => sum + cat.allocated, 0);
        const rem = parseFloat((totalBudget - totalAllocated).toFixed(2));
        setRemainingBudget(rem);
    }, [totalBudget, predefinedCats, customCats]);

    const handleAddCustomCat = () => {
        if (newCustomCat.trim() && !customCats.some(cat => cat.name === newCustomCat)) {
            setCustomCats([...customCats, {
                name: newCustomCat.trim(),
                allocated: 0,
                predefined: false
            }]);
            setNewCustomCat('');
        }
    };

    const handleSliderChange = (categoryType, index, value) => {
        const newValue = Math.min(parseFloat(value), remainingBudget + (categoryType === 'predefined' 
            ? predefinedCats[index].allocated 
            : customCats[index].allocated));
        
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
                throw new Error(`Presupuesto no asignado completamente. Restante: $${remainingBudget.toFixed(2)}`);
            }

            const response = await api.post('/presupuestos/initial-setup/', {
                total_budget: totalBudget,
                categories: [...predefinedCats, ...customCats]
                    .filter(cat => cat.allocated > 0)
            });

            if (response.status === 201) {
                await api.patch('/user/config-status/');
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    return (
        <Container className="setup-container py-5">
            <h1 className="mb-4">🏁 Configuración Inicial</h1>
            
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                    <Form.Label className="h4">
                        💰 Presupuesto Mensual Total
                    </Form.Label>
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

                <div className="mb-5">
                    <h4 className="mb-3">📦 Categorías Predefinidas</h4>
                    {predefinedCats.map((cat, index) => (
                        <div key={cat.name} className="mb-3">
                            <Form.Label>
                                {cat.name} - ${cat.allocated.toFixed(2)}
                                <span className="text-muted ms-2">
                                    ({(totalBudget ? (cat.allocated / totalBudget * 100).toFixed(1) : 0)}%)
                                </span>
                            </Form.Label>
                            <Form.Range
                                value={cat.allocated}
                                min="0"
                                max={cat.allocated + remainingBudget}
                                step="0.01"
                                onChange={(e) => handleSliderChange('predefined', index, e.target.value)}
                                disabled={!totalBudget}
                            />
                        </div>
                    ))}
                </div>

                <div className="mb-5">
                    <h4 className="mb-3">✨ Categorías Personalizadas</h4>
                    <div className="mb-3">
                        <InputGroup>
                            <Form.Control
                                type="text"
                                value={newCustomCat}
                                onChange={(e) => setNewCustomCat(e.target.value)}
                                placeholder="Nueva categoría (Ej: Gym)"
                                disabled={!totalBudget}
                            />
                            <Button 
                                variant="outline-primary" 
                                onClick={handleAddCustomCat}
                                disabled={!newCustomCat.trim() || !totalBudget}
                            >
                                <PlusCircle className="me-2" />
                                Agregar
                            </Button>
                        </InputGroup>
                    </div>

                    {customCats.map((cat, index) => (
                        <div key={cat.name} className="mb-3">
                            <Form.Label>
                                {cat.name} - ${cat.allocated.toFixed(2)}
                            </Form.Label>
                            <Form.Range
                                value={cat.allocated}
                                min="0"
                                max={cat.allocated + remainingBudget}
                                step="0.01"
                                onChange={(e) => handleSliderChange('custom', index, e.target.value)}
                            />
                        </div>
                    ))}
                </div>

                <div className="summary-card p-4 mb-4 bg-light rounded">
                    <Row>
                        <Col md={6}>
                            <h5 className="mb-3">📊 Resumen de asignación</h5>
                            <div className="d-flex justify-content-between">
                                <span>Total asignado:</span>
                                <strong>${(totalBudget - remainingBudget).toFixed(2)}</strong>
                            </div>
                            <div className="d-flex justify-content-between">
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
                        </Col>
                    </Row>
                </div>

                {error && <Alert variant="danger">{error}</Alert>}
            </Form>

            <style>{`
                .setup-container {
                    max-width: 800px;
                    background: white;
                    border-radius: 15px;
                    box-shadow: 0 0 15px rgba(0,0,0,0.1);
                }
                
                .form-range::-webkit-slider-thumb {
                    background: #0d6efd;
                }
                
                .summary-card {
                    border: 2px solid #dee2e6;
                }
            `}</style>
        </Container>
    );
};

export default Setup;