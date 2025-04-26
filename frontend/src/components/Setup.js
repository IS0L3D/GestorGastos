import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Container, Form, Button, Alert, Row, Col, InputGroup } from 'react-bootstrap';
import { PlusCircle, Sliders, Wallet, Tag, Plus } from 'react-bootstrap-icons';

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
        <Container className="d-flex align-items-center justify-content-center min-vh-100">
            <div className="auth-container glass-effect fade-in">
                <h1 className="setup-title">🏁 Configuración Inicial</h1>
                <p className="setup-subtitle">Configura tu presupuesto mensual y categorías de gastos</p>
                
                {error && (
                    <Alert variant="danger" className="auth-alert">
                        <div className="d-flex align-items-center">
                            <i className="bi bi-exclamation-circle-fill me-2"></i>
                            <span>{error}</span>
                        </div>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                    <div className="setup-section">
                        <h2 className="setup-section-title">
                            <Wallet className="me-2" />
                            Presupuesto Mensual Total
                        </h2>
                        <div className="setup-input-group">
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
                                    className="form-control-lg"
                                />
                            </InputGroup>
                        </div>
                    </div>

                    <div className="setup-section">
                        <h2 className="setup-section-title">
                            <Tag className="me-2" />
                            Categorías Predefinidas
                        </h2>
                        {predefinedCats.map((cat, index) => (
                            <div key={cat.name} className="setup-slider-container">
                                <div className="setup-slider-label">
                                    <span>{cat.name}</span>
                                    <div>
                                        <span className="amount">${cat.allocated.toFixed(2)}</span>
                                        <span className="percentage ms-2">
                                            ({(totalBudget ? (cat.allocated / totalBudget * 100).toFixed(1) : 0)}%)
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    className="setup-slider"
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

                    <div className="setup-section">
                        <h2 className="setup-section-title">
                            <Plus className="me-2" />
                            Categorías Personalizadas
                        </h2>
                        <div className="setup-custom-category">
                            <Form.Control
                                type="text"
                                value={newCustomCat}
                                onChange={(e) => setNewCustomCat(e.target.value)}
                                placeholder="Nueva categoría (Ej: Gym)"
                                disabled={!totalBudget}
                                className="form-control-lg"
                            />
                            <Button 
                                variant="outline-primary" 
                                onClick={handleAddCustomCat}
                                disabled={!newCustomCat.trim() || !totalBudget}
                                className="d-flex align-items-center"
                            >
                                <PlusCircle className="me-2" />
                                Agregar
                            </Button>
                        </div>

                        {customCats.map((cat, index) => (
                            <div key={cat.name} className="setup-slider-container">
                                <div className="setup-slider-label">
                                    <span>{cat.name}</span>
                                    <div>
                                        <span className="amount">${cat.allocated.toFixed(2)}</span>
                                        <span className="percentage ms-2">
                                            ({(totalBudget ? (cat.allocated / totalBudget * 100).toFixed(1) : 0)}%)
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    className="setup-slider"
                                    value={cat.allocated}
                                    min="0"
                                    max={cat.allocated + remainingBudget}
                                    step="0.01"
                                    onChange={(e) => handleSliderChange('custom', index, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="setup-summary">
                        <h3 className="setup-summary-title">
                            <Sliders className="me-2" />
                            Resumen de asignación
                        </h3>
                        <div className="setup-summary-item">
                            <span className="label">Total asignado:</span>
                            <span className="value">${(totalBudget - remainingBudget).toFixed(2)}</span>
                        </div>
                        <div className="setup-summary-item">
                            <span className="label">Presupuesto restante:</span>
                            <span className="value">{remainingBudget !== 0 ? '⚠️ ' : '✅ '}${remainingBudget.toFixed(2)}</span>
                        </div>
                        <Button 
                            type="submit"
                            className="setup-submit-button"
                            disabled={Math.abs(remainingBudget) >= 0.01 || !totalBudget}
                        >
                            {remainingBudget === 0 ? '✅ Completar Configuración' : 'Ajusta tu presupuesto'}
                        </Button>
                    </div>
                </Form>
            </div>
        </Container>
    );
};

export default Setup;