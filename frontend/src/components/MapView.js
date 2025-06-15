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
    console.log('[MapView DEBUG] Initial/Re-render. selectedVehicleType:', selectedVehicleType, 'filteredVehicles count:', filteredVehicles.length);

    useEffect(() => {
        console.log('[MapView DEBUG] selectedVehicleType EFFECT triggered. New type:', selectedVehicleType);
        // Reset active and selected vehicle when the type filter changes
        setActiveVehicle(null);
        setSelectedVehicle(null);
    }, [selectedVehicleType]);

    useEffect(() => {
        console.log('[MapView DEBUG] MAIN MAP EFFECT triggered. Dependencies:', {
            vehiclesCount: vehicles.length,
            selectedVehicleType,
            activeVehicleLat: activeVehicle?.latitude,
            filteredVehiclesCount: filteredVehicles.length
        });

        if (window.ymaps && mapRef.current) {
            const ymaps = window.ymaps;
            console.log('[MapView DEBUG] YMAPS API found.');
            ymaps.ready(() => {
                console.log('[MapView DEBUG] YMAPS ready callback entered.');
                if (!ymapRef.current) { 
                    console.log('[MapView DEBUG] Initializing map instance.');
                    ymapRef.current = new ymaps.Map(mapRef.current, {
                        center: [55.792139, 49.122135], 
                        zoom: 15, // Начальный зум
                    });
                }
                const mapInstance = ymapRef.current;
                console.log('[MapView DEBUG] Map instance available.');

                // Удаляем старые метки и маршрут с карты
                mapInstance.geoObjects.removeAll();
                // Сбрасываем ссылку на старый маршрут, т.к. он удален с карты
                if (routeRef.current) {
                    console.log('[MapView DEBUG] Removing existing route from map and ref.');
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
                console.log('[MapView DEBUG] User placemark added.');

                // Добавляем новые метки транспорта
                console.log('[MapView DEBUG] Adding vehicle placemarks. Count:', filteredVehicles.length);
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
                        console.log('[MapView DEBUG] Placemark clicked:', vehicle);
                        if (activeVehicle && activeVehicle.latitude === vehicle.latitude && activeVehicle.longitude === vehicle.longitude) {
                            // Second click on the same active placemark: show details
                            console.log('[MapView DEBUG] Second click on active vehicle. Setting selectedVehicle.');
                            setSelectedVehicle(vehicle);
                        } else {
                            // First click, or click on a different placemark: set as active, hide details
                            console.log('[MapView DEBUG] First click or different vehicle. Setting activeVehicle, clearing selectedVehicle.');
                            setActiveVehicle(vehicle);
                            setSelectedVehicle(null);
                        }
                    });
                    mapInstance.geoObjects.add(placemark);
                });

                // Логика построения маршрута
                let routeDestination = null;
                let buildRoute = false;
                console.log('[MapView DEBUG] Initial routeDecision values. buildRoute:', buildRoute, 'routeDestination:', routeDestination, 'activeVehicle:', activeVehicle, 'selectedVehicleType:', selectedVehicleType);

                // Priority 1: Route to active (clicked) vehicle
                if (activeVehicle) {
                    console.log('[MapView DEBUG] Attempting route to activeVehicle:', activeVehicle);
                    const isActiveVehicleInFilteredList = filteredVehicles.some(
                        v => v.latitude === activeVehicle.latitude && v.longitude === activeVehicle.longitude
                    );
                    console.log('[MapView DEBUG] isActiveVehicleInFilteredList:', isActiveVehicleInFilteredList);

                    if (isActiveVehicleInFilteredList) {
                        // If a filter is active, the clicked vehicle must match the filter type
                        if (selectedVehicleType) { 
                            const activeVehicleTypeEnglish = mapVehicleTypeToEnglish(activeVehicle.type);
                            console.log('[MapView DEBUG] Active vehicle type (English):', activeVehicleTypeEnglish, 'Selected filter type:', selectedVehicleType);
                            if (activeVehicleTypeEnglish && activeVehicleTypeEnglish.toLowerCase() === selectedVehicleType.toLowerCase()) {
                                routeDestination = [parseFloat(activeVehicle.latitude), parseFloat(activeVehicle.longitude)];
                                buildRoute = true;
                                console.log('[MapView DEBUG] Route to active (matches filter). buildRoute:', buildRoute, 'Destination:', routeDestination);
                            } else {
                                console.log('[MapView DEBUG] Active vehicle does NOT match filter. No route to active.');
                            }
                        } else { // No filter active, route to any clicked vehicle
                            routeDestination = [parseFloat(activeVehicle.latitude), parseFloat(activeVehicle.longitude)];
                            buildRoute = true;
                            console.log('[MapView DEBUG] Route to active (no filter). buildRoute:', buildRoute, 'Destination:', routeDestination);
                        }
                    } else {
                         console.log('[MapView DEBUG] Active vehicle is not in the current filtered list. No route to active.');
                    }
                }

                // Priority 2: If no active vehicle route, route to nearest of selected type
                if (!buildRoute && selectedVehicleType && filteredVehicles.length > 0) {
                    console.log('[MapView DEBUG] Attempting route to nearest of type:', selectedVehicleType, 'Count:', filteredVehicles.length);
                    let nearestVehicle = null;
                    let minDistanceSq = Infinity;

                    filteredVehicles.forEach(v => { // Changed from 'vehicle' to 'v' to avoid conflict in logs if any
                        const vehicleLat = parseFloat(v.latitude);
                        const vehicleLon = parseFloat(v.longitude);
                        const distSq = Math.pow(vehicleLat - userLocation[0], 2) + Math.pow(vehicleLon - userLocation[1], 2);
                        if (distSq < minDistanceSq) {
                            minDistanceSq = distSq;
                            nearestVehicle = v;
                        }
                    });

                    if (nearestVehicle) {
                        routeDestination = [parseFloat(nearestVehicle.latitude), parseFloat(nearestVehicle.longitude)];
                        buildRoute = true;
                        console.log('[MapView DEBUG] Route to nearest. buildRoute:', buildRoute, 'Destination:', routeDestination, 'Nearest:', nearestVehicle);
                    } else {
                        console.log('[MapView DEBUG] No nearest vehicle found for type:', selectedVehicleType);
                    }
                }

                if (buildRoute && routeDestination) {
                    console.log('[MapView DEBUG] FINAL: Building route from', userLocation, 'to', routeDestination);
                    const multiRoute = new ymaps.multiRouter.MultiRoute({
                        referencePoints: [userLocation, routeDestination],
                        params: {
                            routingMode: 'pedestrian'
                        }
                    }, {
                        boundsAutoApply: true,
                        // Скрываем стандартные конки начальной и конечной точек маршрута
                        wayPointIconLayout: ymaps.templateLayoutFactory.createClass('<div></div>'),
                        viaPointIconLayout: ymaps.templateLayoutFactory.createClass('<div></div>') // Для промежут��чных точек, если будут
                    });

                    mapInstance.geoObjects.add(multiRoute);
                    routeRef.current = multiRoute;
                    console.log('[MapView DEBUG] Route added to map.');
                } else {
                    console.log('[MapView DEBUG] FINAL: No route built. buildRoute:', buildRoute, 'routeDestination:', routeDestination);
                }
            });
        } else {
            console.log('[MapView DEBUG] YMAPS API or mapRef.current not available.');
        }
        // Очистка при размонтировании компонента
        return () => {
            console.log('[MapView DEBUG] MAIN MAP EFFECT cleanup.');
            // Логика очистки, если необходима при полном удалении компонента MapView
            // Например, if (ymapRef.current && ymapRef.current.destroy) ymapRef.current.destroy();
        };
    }, [vehicles, selectedVehicleType, activeVehicle, ymapRef, mapRef, filteredVehicles]); // Добавляем filteredVehicles в зависимости

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

