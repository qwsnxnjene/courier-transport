import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const RideHistory = ({ onClose, login }) => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!login) {
            setHistory([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        fetch(`http://localhost:3031/api/ride-info?login=${encodeURIComponent(login)}`)
            .then(res => res.json())
            .then(data => {
                // Если пришла ошибка
                if (data.error) {
                    setHistory([]);
                } else {
                    // Подготовим данные к рендеру, если нужно форматирование
                    setHistory(data.map((item, idx) => ({
                        id: idx + 1,     // Можно добавить id, так как бек его не возвращает
                        date: new Date(item.start).toLocaleDateString('ru-RU'), // приводим к формату
                        vehicleType: item.type,
                        duration: item.start && item.end
                            ? getDuration(item.start, item.end)
                            : '',
                        distance: '', // Если появится поле - добавить
                        cost: item.total + ' ₽',
                        startPoint: '', // можно вывести детальнее, если появится поле
                        endPoint: ''    // можно вывести детальнее, если появится поле
                    })));
                }
                setIsLoading(false);
            })
            .catch(() => {
                setHistory([]);
                setIsLoading(false);
            });
    }, [login]);

    // Функция для подсчёта продолжительности поездки
    function getDuration(start, end) {
        try {
            const s = new Date(start);
            const e = new Date(end);
            const diff = Math.round((e - s) / 60000); // в минутах
            return diff > 0 ? `${diff} мин` : '';
        } catch {
            return '';
        }
    }

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
                                            {/* Маршрут, если появится startPoint/endPoint/дистанция */}
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