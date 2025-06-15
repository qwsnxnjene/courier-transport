// MapView.js
import React, { useEffect, useState, useRef } from 'react';
import ScooterDetails from './ScooterDetails';
import { useVehicle } from '../context/VehicleContext';

const MapView = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const { selectedVehicleType } = useVehicle();
    const mapRef = useRef(null); // Ссылка на DOM-элемент карты
    const ymapRef = useRef(null); // Ссылка на инстанс карты ymaps

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const response = await fetch('http://localhost:3031/api/transport');
                if (response.ok) {
                    const data = await response.json();
                    console.log(data)

                    if (data.length === 0) {
                        console.warn('База данных пуста, используются тестовые данные.');
                        setVehicles([
                            {
                                latitude: '55.796127',
                                longitude: '49.106414',
                                batteryLevel: 80,
                                status: 'free',
                                type: 'Электросамокат',
                                pricePerMinute: 5
                            },
                            {
                                latitude: '55.790000',
                                longitude: '49.120000',
                                batteryLevel: 40,
                                status: 'free',
                                type: 'Велосипед',
                                pricePerMinute: 3
                            },
                            {
                                latitude: '55.805000',
                                longitude: '49.115000',
                                batteryLevel: 95,
                                status: 'free',
                                type: 'Электровелосипед',
                                pricePerMinute: 4
                            },
                        ]);
                    } else {
                        setVehicles(data);
                    }
                } else {
                    console.error('Ошибка загрузки данных.');
                     // Устанавливаем моковые данные в случае ошибки загрузки
                    setVehicles([
                        { latitude: '55.796127', longitude: '49.106414', batteryLevel: 80, status: 'free', type: 'Электросамокат', pricePerMinute: 5 },
                        { latitude: '55.790000', longitude: '49.120000', batteryLevel: 40, status: 'free', type: 'Велосипед', pricePerMinute: 3 },
                        { latitude: '55.805000', longitude: '49.115000', batteryLevel: 95, status: 'free', type: 'Электровелосипед', pricePerMinute: 4 },
                    ]);
                }
            } catch (error) {
                console.error('Ошибка сети:', error);
                 // Устанавливаем моковые данные в случае ошибки сети
                setVehicles([
                    { latitude: '55.796127', longitude: '49.106414', batteryLevel: 80, status: 'free', type: 'Электросамокат', pricePerMinute: 5 },
                    { latitude: '55.790000', longitude: '49.120000', batteryLevel: 40, status: 'free', type: 'Велосипед', pricePerMinute: 3 },
                    { latitude: '55.805000', longitude: '49.115000', batteryLevel: 95, status: 'free', type: 'Электровелосипед', pricePerMinute: 4 },
                ]);
            }
        };
        fetchVehicles();
    }, []);

    // Функция для преобразования русских названий типов в английские
    const mapVehicleTypeToEnglish = (russianType) => {
        if (typeof russianType !== 'string') {
            return ""; 
        }
        const typeMap = {
            'Электросамокат': 'E-Scooter',
            'Велосипед': 'Bike',
            'Электровелосипед': 'E-Bike'
        };
        return typeMap[russianType] || russianType;
    };
    
    const matchesSelectedType = (vehicleType) => {
        const processedVehicleType = mapVehicleTypeToEnglish(vehicleType);
        if (typeof processedVehicleType === 'string' && typeof selectedVehicleType === 'string') {
            return processedVehicleType.toLowerCase() === selectedVehicleType.toLowerCase();
        }
        return false;
    };

    const filteredVehicles = selectedVehicleType 
        ? vehicles.filter(vehicle => vehicle && typeof vehicle.type === 'string' && matchesSelectedType(vehicle.type))
        : vehicles;

    useEffect(() => {
        if (window.ymaps && mapRef.current) {
            window.ymaps.ready(() => {
                if (!ymapRef.current) { 
                    ymapRef.current = new window.ymaps.Map(mapRef.current, {
                        center: [55.792139, 49.122135], 
                        zoom: 15, // Начальный зум
                    });
                }

                // Удаляем старые метки
                ymapRef.current.geoObjects.removeAll();

                // Добавляем метку пользователя
                const userPlacemark = new window.ymaps.Placemark(
                    [55.792139, 49.122135], // Координаты пользователя
                    {
                        hintContent: 'Вы здесь',
                        balloonContent: 'Ваше текущее местоположение'
                    },
                    {
                        preset: 'islands#geolocationIcon', // Стандартная иконка геолокации
                        iconColor: '#007bff' // Цвет иконки (можно изменить)
                    }
                );
                ymapRef.current.geoObjects.add(userPlacemark);

                // Добавляем новые метки транспорта
                filteredVehicles.forEach((vehicle) => {
                    const placemark = new window.ymaps.Placemark(
                        [parseFloat(vehicle.latitude), parseFloat(vehicle.longitude)],
                        {
                            hintContent: vehicle.type,
                            balloonContent: `Тип: ${vehicle.type}<br>Батарея: ${vehicle.batteryLevel}%<br>Цена: ${vehicle.pricePerMinute}₽/мин`,
                        },
                        {
                            // Опции.
                            // Необходимо указать данный тип макета.
                            iconLayout: 'default#image',
                            // Своё изображение иконки метки.
                            // iconImageHref: 'images/myIcon.gif', // Можно добавить свои иконки
                            // Размеры метки.
                            // iconImageSize: [30, 42],
                            // Смещение левого верхнего угла иконки относительно
                            // её "ножки" (точки привязки).
                            // iconImageOffset: [-5, -38]
                        }
                    );
                    placemark.events.add('click', () => {
                        setSelectedVehicle(vehicle);
                    });
                    ymapRef.current.geoObjects.add(placemark);
                });
            });
        }
        // Очистка при размонтировании компонента
        return () => {
            if (ymapRef.current) {
                // ymapRef.current.destroy(); // Уничтожаем карту при размонтировании
                // ymapRef.current = null;
            }
        };
    }, [filteredVehicles]); // Перерисовываем метки при изменении filteredVehicles

    const handleCloseDetails = () => setSelectedVehicle(null);

    const handleBookVehicle = () => {
        console.log(`Транспорт типа ${selectedVehicle.type} забронирован!`);
        setSelectedVehicle(null);
    };

    return (
        <div className="map-container" style={{ width: '100%', height: '500px', position: 'relative' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div> {/* DOM-элемент для карты */}
            <ScooterDetails
                vehicle={selectedVehicle}
                onClose={handleCloseDetails}
                onBook={handleBookVehicle}
            />
        </div>
    );
};

export default MapView;

