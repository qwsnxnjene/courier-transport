import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const getMockHistory = () => ([
    {
        id: '1',
        date: '05.07.2023',
        vehicleType: 'E-Scooter',
        duration: '15 мин',
        distance: '2.3 км',
        cost: '80 ₽',
        startPoint: 'ул. Ленина, 15',
        endPoint: 'пр. Мира, 42'
    },
    {
        id: '2',
        date: '03.07.2023',
        vehicleType: 'Bike',
        duration: '35 мин',
        distance: '4.5 км',
        cost: '105 ₽',
        startPoint: 'ул. Гагарина, 7',
        endPoint: 'ул. Пушкина, 19'
    },
    {
        id: '3',
        date: '28.06.2023',
        vehicleType: 'E-Bike',
        duration: '20 мин',
        distance: '3.1 км',
        cost: '110 ₽',
        startPoint: 'пр. Победы, 54',
        endPoint: 'ул. Советская, 22'
    },
    {
        id: '4',
        date: '25.06.2023',
        vehicleType: 'E-Scooter',
        duration: '12 мин',
        distance: '1.8 км',
        cost: '65 ₽',
        startPoint: 'ул. Строителей, 31',
        endPoint: 'пл. Революции, 2'
    },
    {
        id: '5',
        date: '20.06.2023',
        vehicleType: 'Bike',
        duration: '28 мин',
        distance: '3.7 км',
        cost: '84 ₽',
        startPoint: 'ул. Чехова, 8',
        endPoint: 'ул. Лермонтова, 15'
    }
]);

const RideHistory = ({ onClose }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);



    useEffect(() => {
        setTimeout(() => {
            // Получаем из localStorage, но не подставляем моки!
            const saved = localStorage.getItem("rideHistory");
            let loaded;
            if (saved) {
                loaded = JSON.parse(saved);
            } else {
                loaded = []; // пустой массив!
            }
            setHistory(loaded);
            setIsLoading(false);
        }, 500);
    }, []);


    // Позволяет обновлять историю из других компонентов
    useEffect(() => {
        const updateHistory = () => {
            const saved = localStorage.getItem("rideHistory");
            if (saved) setHistory(JSON.parse(saved));
        };

        window.addEventListener('update-ride-history', updateHistory);
        return () => {
            window.removeEventListener('update-ride-history', updateHistory);
        };
    }, []);

    return (
        <div className="history-overlay">
            <div className="history-panel" style={{ maxWidth: window.innerWidth <= 480 ? '90%' : '500px' }}>
                <div className="modal-header">
                    <h2>История поездок</h2>
                    <button className="modal-close-button" onClick={onClose}>×</button>
                </div>

                <div className="modal-content">
                    {isLoading ? (
                        <div className="history-loading">Загрузка истории...</div>
                    ) : history.length === 0 ? (
                        <div className="history-empty">
                            <p>У вас пока нет совершённых поездок</p>
                        </div>
                    ) : (
                        <div>
                            {history.map(ride => (
                                <div key={ride.id} className="payment-record ride-record">
                                    <div className="payment-record-header">
                                        <div className="ride-date">{ride.date}</div>
                                        <div className="payment-amount">{ride.cost}</div>
                                    </div>
                                    <div className="payment-details ride-details">
                                        <div className="ride-vehicle-type">
                                            {ride.vehicleType}
                                        </div>
                                        <div className="ride-route-info">
                                            <div>Маршрут: {ride.startPoint} → {ride.endPoint}</div>
                                            <div>Расстояние: {ride.distance}</div>
                                            <div>Время: {ride.duration}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RideHistory;