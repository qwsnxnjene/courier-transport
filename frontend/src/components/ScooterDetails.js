import React, { useState } from 'react';

const typeTranslations = {
    "Bike": "Велосипед",
    "E-Bike": "Электровелосипед",
    "E-Scooter": "Электросамокат"
};

const ScooterDetails = ({ vehicle, onClose, onBook }) => {
    if (!vehicle) {
        return null;
    }

    // Сначала извлекаем тип и другие базовые данные
    const type = vehicle.type || '';
    const charge = vehicle.batteryLevel || 0;
    
    // Затем вычисляем цену на основе уже полученного типа
    const price = vehicle.pricePerMinute !== undefined && vehicle.pricePerMinute !== null 
        ? vehicle.pricePerMinute 
        : (type === 'Велосипед' || type === 'Bike') ? 3 : 5.4;

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
                    {/* Исправлен символ рубля */}
                    <p><strong>Стоимость:</strong> {price} ₽/мин</p> 
                    <button onClick={onBook} className="login-button" style={{ width: '100%', marginTop: '20px' }}>
                        Забронировать
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScooterDetails;
