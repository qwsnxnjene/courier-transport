// ScooterDetails.js
import React from 'react';

const ScooterDetails = ({ vehicle, onClose, onBook }) => {
    if (!vehicle) return null;

    return (
        <div className="scooter-details-overlay"
             style={{
                 position: 'fixed',
                 top: '0',
                 left: '0',
                 width: '100%',
                 height: '100%',
                 backgroundColor: 'rgba(0, 0, 0, 0.5)',
                 zIndex: 1000,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
             }}
        >
            <div className="scooter-details"
                 style={{
                     background: 'white',
                     padding: '20px',
                     borderRadius: '12px',
                     maxWidth: '400px',
                     width: '90%',
                     textAlign: 'center',
                     position: 'relative',
                 }}
            >
                <button
                    className="close-details"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                    }}
                >
                    ✖
                </button>
                <h2>Информация о транспорте</h2>
                <p>
                    <strong>Тип:</strong> {vehicle.type}
                </p>
                <p>
                    <strong>Заряд батареи:</strong> {vehicle.batteryLevel}%
                </p>
                <p>
                    <strong>Статус:</strong> {vehicle.status === 'free' ? 'Свободен' : 'Недоступен'}
                </p>
                <p>
                    <strong>Стоимость:</strong> {vehicle.pricePerMinute}₽/мин
                </p>
                {vehicle.status === 'free' && (
                    <button
                        className="book-scooter"
                        onClick={onBook}
                        style={{
                            padding: '10px 20px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                        }}
                    >
                        Забронировать
                    </button>
                )}
            </div>
        </div>
    );
};

export default ScooterDetails;