import React, { useState, useEffect } from 'react';
import { useVehicle } from '../context/VehicleContext';
import { FaClock, FaMoneyBillWave, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

const RideButton = () => {
    const [isRiding, setIsRiding] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [cost, setCost] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const { selectedVehicleType, activeVehicle } = useVehicle();

    // Таймер для обновления времени и стоимости поездки
    useEffect(() => {
        let timer;
        if (isRiding && startTime) {
            timer = setInterval(() => {
                const currentElapsed = Math.floor((Date.now() - startTime) / 1000);
                setElapsedTime(currentElapsed);
                
                // Рассчитаем стоимость. По умолчанию 5.4р/мин, для велосипеда 3р/мин
                const rate = (activeVehicle && activeVehicle.pricePerMinute) || 
                             ((activeVehicle && (activeVehicle.type === 'Велосипед' || activeVehicle.type === 'Bike')) ? 3 : 5.4);
                setCost(((rate / 60) * currentElapsed).toFixed(2));
            }, 1000);
        }
        
        return () => clearInterval(timer);
    }, [isRiding, startTime, activeVehicle]);

    // Эффект для автоматического скрытия уведомления
    useEffect(() => {
        let notificationTimer;
        if (showNotification) {
            notificationTimer = setTimeout(() => {
                setShowNotification(false);
            }, 3000); // Уведомление будет отображаться 3 секунды
        }
        
        return () => clearTimeout(notificationTimer);
    }, [showNotification]);

    const handleRideButton = () => {
        if (!activeVehicle && !isRiding) {
            // Если транспорт не выбран и поездка не начата, показываем предупреждение
            alert('Пожалуйста, выберите транспорт на карте перед началом поездки');
            return;
        }

        if (!isRiding) {
            // Начинаем поездку
            setIsRiding(true);
            setStartTime(Date.now());
            setElapsedTime(0);
            setCost(0);
            console.log(`Начата поездка на транспорте типа: ${activeVehicle.type}`);
        } else {
            // Завершаем поездку
            setIsRiding(false);
            // Показываем верхнее уведомление о завершении поездки
            setShowNotification(true);
            // Сохраняем поездку в историю
            saveRideToHistory();
        }
    };

    const saveRideToHistory = () => {
        // Получаем существующую историю
        const savedHistory = localStorage.getItem('rideHistory');
        let history = savedHistory ? JSON.parse(savedHistory) : [];
        
        // Создаем новую запись
        const newRide = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('ru-RU'),
            vehicleType: activeVehicle ? activeVehicle.type : selectedVehicleType || 'Транспорт',
            duration: formatTime(elapsedTime),
            distance: calculateDistance(elapsedTime),
            cost: `${cost} ₽`,
            startPoint: 'ул. Ленина, 15', // Можно заменить на реальное определение геолокации
            endPoint: 'пр. Мира, 42'
        };
        
        // Добавляем запись в начало истории
        history.unshift(newRide);
        
        // Сохраняем историю
        localStorage.setItem('rideHistory', JSON.stringify(history));
        
        // Диспатчим событие для обновления компонента истории
        window.dispatchEvent(new Event('update-ride-history'));
    };

    const closeModal = () => {
        setShowModal(false);
    };

    // Форматирует время в формате MM:SS
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes} мин ${seconds} сек`;
    };
    
    // Рассчитывает примерное расстояние (в км) основываясь на времени
    // В реальном приложении здесь будет использоваться GPS
    const calculateDistance = (totalSeconds) => {
        // Средняя скорость примерно 12 км/ч или 0.2 км/мин
        return ((totalSeconds / 60) * 0.2).toFixed(1) + ' км';
    };

    // Получаем русское название типа транспорта
    const getVehicleTypeName = (type) => {
        const typeMap = {
            'Bike': 'Велосипед',
            'E-Bike': 'Электровелосипед', 
            'E-Scooter': 'Электросамокат',
        };
        return typeMap[type] || type;
    };

    return (
        <>
            <div className="ride-action">
                <button 
                    className={`go-ride-button ${isRiding ? 'riding' : ''}`}
                    onClick={handleRideButton}
                >
                    {isRiding ? 'END RIDE' : 'GO RIDE'}
                </button>
            </div>
            
            {/* Слайдер с информацией о поездке */}
            <div className={`ride-info-slider ${isRiding ? 'active' : ''}`}>
                <div className="ride-info-slider-header">
                    <div className="vehicle-type">
                        {activeVehicle && (
                            <span>{getVehicleTypeName(activeVehicle.type)}</span>
                        )}
                    </div>
                </div>
                
                <div className="ride-info-slider-content">
                    <div className="ride-info-item">
                        <FaClock className="info-icon" />
                        <div className="info-content">
                            <div className="info-label">Время поездки</div>
                            <div className="info-value">{formatTime(elapsedTime)}</div>
                        </div>
                    </div>
                    
                    <div className="ride-info-item">
                        <FaMoneyBillWave className="info-icon" />
                        <div className="info-content">
                            <div className="info-label">Текущая стоимость</div>
                            <div className="info-value">{cost} ₽</div>
                        </div>
                    </div>
                    
                    <div className="ride-info-item">
                        <FaMapMarkerAlt className="info-icon" />
                        <div className="info-content">
                            <div className="info-label">Расстояние</div>
                            <div className="info-value">{calculateDistance(elapsedTime)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Уведомление о завершении поездки */}
            {showNotification && (
                <div className="ride-notification">
                    Поездка завершена!
                </div>
            )}
        </>
    );
};

export default RideButton;

