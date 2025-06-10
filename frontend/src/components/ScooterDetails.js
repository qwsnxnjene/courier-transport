import React from 'react';

const ScooterDetails = ({ vehicle, onClose, onBook }) => {
    if (!vehicle) return null;

    // Обработка перевода для двух возможных вариантов данных (API/заглушка)
    const typeTranslations = {
        'e-scooter': 'Электросамокат',
        'bike': 'Велосипед',
        'e-bike': 'Электровелосипед',
        'Электросамокат': 'Электросамокат',
        'Велосипед': 'Велосипед',
        'Электровелосипед': 'Электровелосипед'
    };

    // Для поддержки разных полей (API либо мок)
    const type = vehicle.type || '';
    const charge = vehicle.batteryLevel !== undefined ? vehicle.batteryLevel : vehicle.charge;
    const price = vehicle.pricePerMinute || vehicle.price;

    // fallback: кнопка отображается если статус свободен или статус не указан
    const isFree = !vehicle.status || vehicle.status === 'free' || vehicle.status === 'Свободен';

    return (
        <div className="scooter-details-overlay"
             style={{
                 position: 'fixed',
                 top: 0,
                 left: 0,
                 width: '100%',
                 height: '100%',
                 backgroundColor: 'rgba(0,0,0,0.5)',
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
                    aria-label="Закрыть"
                >
                    ✖
                </button>
                <h2>Информация о транспорте</h2>
                <p>
                    <strong>Тип:</strong> {typeTranslations[type] || type}
                </p>
                <p>
                    <strong>Заряд батареи:</strong> {charge}%
                </p>
                <p>
                    <strong>Стоимость:</strong> {price} ₽/мин
                </p>
                {isFree && (
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
                            marginTop: '10px'
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