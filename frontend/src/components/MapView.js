// MapView.js
import React, { useEffect, useState, useRef } from 'react';
import ScooterDetails from './ScooterDetails';
import { useVehicle } from '../context/VehicleContext';

const MapView = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null); // For ScooterDetails modal
    const [activeVehicle, setActiveVehicle] = useState(null); // For active (red) placemark on map
    const { selectedVehicleType } = useVehicle();
    const mapRef = useRef(null); // Ссылка на DOM-элемент карты
    const ymapRef = useRef(null); // Ссылка на инстанс карты ymaps
    const routeRef = useRef(null); // Ссылка на текущий маршрут

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
        // Reset active and selected vehicle when the type filter changes
        setActiveVehicle(null);
        setSelectedVehicle(null);
    }, [selectedVehicleType]);

    useEffect(() => {
        if (window.ymaps && mapRef.current) {
            const ymaps = window.ymaps; // Alias for convenience
            ymaps.ready(() => {
                if (!ymapRef.current) { 
                    ymapRef.current = new ymaps.Map(mapRef.current, {
                        center: [55.792139, 49.122135], 
                        zoom: 15, // Начальный зум
                    });
                }
                const mapInstance = ymapRef.current;

                // Удаляем старые метки и маршрут с карты
                mapInstance.geoObjects.removeAll();
                // Сбрасываем ссылку на старый маршрут, т.к. он удален с карты
                if (routeRef.current) {
                    routeRef.current = null; 
                }

                const userLocation = [55.792139, 49.122135]; // Координаты пользователя

                // Добавляем метку пользователя
                const userPlacemark = new ymaps.Placemark(
                    userLocation,
                    {
                        hintContent: 'Вы здесь',
                        balloonContent: 'Ваше текущее местоположение'
                    },
                    {
                        preset: 'islands#geolocationIcon',
                        iconColor: '#007bff'
                    }
                );
                mapInstance.geoObjects.add(userPlacemark);

                // Добавляем новые метки транспорта
                filteredVehicles.forEach((vehicle) => {
                    // Determine placemark preset based on whether it's the activeVehicle
                    let placemarkPreset = 'islands#blueCircleDotIcon'; // Default preset
                    if (activeVehicle && activeVehicle.latitude === vehicle.latitude && activeVehicle.longitude === vehicle.longitude) {
                        placemarkPreset = 'islands#redCircleDotIcon'; // Active preset
                    }

                    const placemark = new ymaps.Placemark(
                        [parseFloat(vehicle.latitude), parseFloat(vehicle.longitude)],
                        {
                            hintContent: vehicle.type,
                            balloonContent: `Тип: ${vehicle.type}<br>Батарея: ${vehicle.batteryLevel}%<br>Цена: ${vehicle.pricePerMinute}₽/мин`,
                        },
                        {
                            preset: placemarkPreset,
                        }
                    );

                    placemark.events.add('click', () => {
                        if (activeVehicle && activeVehicle.latitude === vehicle.latitude && activeVehicle.longitude === vehicle.longitude) {
                            // Second click on the same active placemark: show details
                            setSelectedVehicle(vehicle);
                        } else {
                            // First click, or click on a different placemark: set as active, hide details
                            setActiveVehicle(vehicle);
                            setSelectedVehicle(null);
                        }
                    });
                    mapInstance.geoObjects.add(placemark);
                });

                // Логика построения маршрута
                let routeDestination = null;
                let buildRoute = false;

                if (activeVehicle) {
                    const isActiveVehicleInFilteredList = filteredVehicles.some(
                        v => v.latitude === activeVehicle.latitude && v.longitude === activeVehicle.longitude
                    );

                    if (isActiveVehicleInFilteredList) {
                        if (selectedVehicleType) { 
                            const activeVehicleTypeEnglish = mapVehicleTypeToEnglish(activeVehicle.type);
                            if (activeVehicleTypeEnglish && activeVehicleTypeEnglish.toLowerCase() === selectedVehicleType.toLowerCase()) {
                                routeDestination = [parseFloat(activeVehicle.latitude), parseFloat(activeVehicle.longitude)];
                                buildRoute = true;
                            }
                        } else { 
                            routeDestination = [parseFloat(activeVehicle.latitude), parseFloat(activeVehicle.longitude)];
                            buildRoute = true;
                        }
                    }
                }

                // Приоритет 2: Если конкретное ТС не выбрано (или т��п не совпадает), маршрут к ближайшему ТС выбранного типа
                if (!buildRoute && selectedVehicleType && filteredVehicles.length > 0) {
                    let nearestVehicle = null;
                    let minDistanceSq = Infinity;

                    filteredVehicles.forEach(vehicle => {
                        const vehicleLat = parseFloat(vehicle.latitude);
                        const vehicleLon = parseFloat(vehicle.longitude);
                        const distSq = Math.pow(vehicleLat - userLocation[0], 2) + Math.pow(vehicleLon - userLocation[1], 2);
                        if (distSq < minDistanceSq) {
                            minDistanceSq = distSq;
                            nearestVehicle = vehicle;
                        }
                    });

                    if (nearestVehicle) {
                        routeDestination = [parseFloat(nearestVehicle.latitude), parseFloat(nearestVehicle.longitude)];
                        buildRoute = true;
                    }
                }

                if (buildRoute && routeDestination) {
                    const multiRoute = new ymaps.multiRouter.MultiRoute({
                        referencePoints: [userLocation, routeDestination],
                        params: {
                            routingMode: 'pedestrian'
                        }
                    }, {
                        boundsAutoApply: true,
                        // Скрываем стандартные иконки начальной и конечной точек маршрута
                        wayPointIconLayout: ymaps.templateLayoutFactory.createClass('<div></div>'),
                        viaPointIconLayout: ymaps.templateLayoutFactory.createClass('<div></div>') // Для промежуточных точек, если будут
                    });

                    mapInstance.geoObjects.add(multiRoute);
                    routeRef.current = multiRoute;
                }
            });
        }
        // Очистка при размонтировании компонента
        return () => {
            // Логика очистки, если необходима при полном удалении компонента MapView
            // Например, if (ymapRef.current && ymapRef.current.destroy) ymapRef.current.destroy();
        };
    }, [vehicles, selectedVehicleType, activeVehicle, ymapRef, mapRef]); // Добавляем activeVehicle в зависимости

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
    }
export default MapView;

