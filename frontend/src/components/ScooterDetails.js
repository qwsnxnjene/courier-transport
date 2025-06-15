import React, { useState } from 'react';

const typeTranslations = {
    "E-Scooter": "Электросамокат",
    "Bike": "Велосипед",
    "E-Bike": "Электровелосипед"
};

const ScooterDetails = ({ vehicle, onClose, onBook }) => {
    if (!vehicle) {
        return null;
    }

    // Прямой доступ к данным, который мог приводить к 'undefined' для цены
    const price = vehicle.pricePerMinute; 
    const type = vehicle.type || '';
    const charge = vehicle.batteryLevel; // Упрощенный доступ к заряду

    return (
        <div className="profile-overlay"> 
            <div className="profile-panel scooter-details-panel"> 
                <div className="modal-header">
                    <h2>{typeTranslations[type] || type}</h2>
                    <button className="modal-close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-content">
                    <p><strong>Тип:</strong> {typeTranslations[type] || type}</p>
                    <p><strong>Заряд:</strong> {charge}%</p>
                    {/* Следующая строка могла отображать "undefined ₽/мин" */}
                    <p><strong>Стоимость:</strong> {price} ��/мин</p> 
                    <button onClick={onBook} className="login-button" style={{ width: '100%', marginTop: '20px' }}>
                        Забронировать
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScooterDetails;
