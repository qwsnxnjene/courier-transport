import React from 'react';

const ScooterDetails = ({ scooter, onClose, onBook }) => {
    if (!scooter) return null;

    return (
        <div
            className="scooter-details-overlay"
            style={{
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000, // Устанавливаем поверх всех элементов
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                className="scooter-details"
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
                <h2>Сведения о самокате</h2>
                <p>
                    <strong>Широта:</strong> {scooter.latitude}
                </p>
                <p>
                    <strong>Долгота:</strong> {scooter.longitude}
                </p>
                <p>
                    <strong>Заряд батареи:</strong> {scooter.batteryLevel}%
                </p>
                <p>
                    <strong>Статус:</strong> {scooter.status === 'free' ? 'Свободен' : 'Недоступен'}
                </p>
                {scooter.status === 'free' && (
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