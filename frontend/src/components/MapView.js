// MapView.js
import React, { useEffect, useState, useRef } from 'react';
import ScooterDetails from './ScooterDetails';
import { useVehicle } from '../context/VehicleContext';

const MapView = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null); // For ScooterDetails modal
    const { selectedVehicleType, activeVehicle, setActiveVehicle } = useVehicle();
    const mapRef = useRef(null); // Ссылка на DOM-элемент карты
    const ymapRef = useRef(null); // Ссылка на инстанс карты ymaps
    const routeRef = useRef(null); // Ссылка на текущий маршрут

    const [mapApiReady, setMapApiReady] = useState(false);
    const [mapInstanceReady, setMapInstanceReady] = useState(false);

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
        // Не сбрасываем активный транспорт при изменении типа, чтобы метка могла остаться красной
        setSelectedVehicle(null);
    }, [selectedVehicleType]);

    useEffect(() => {
        // Effect for Yandex Maps API loading
        if (window.ymaps) {
            console.log('[MapView DEBUG] YMAPS API script detected. Waiting for ready...');
            window.ymaps.ready(() => {
                console.log('[MapView DEBUG] YMAPS API is ready (from API ready effect).');
                setMapApiReady(true);
            });
        } else {
            console.log('[MapView DEBUG] YMAPS API script not detected yet.');
            // Optionally, handle script loading here if not handled by index.html
        }
    }, []); // Runs once on mount

    useEffect(() => {
        console.log('[MapView DEBUG] MAIN MAP EFFECT triggered. Dependencies:', {
            mapApiReady,
            mapInstanceReady,
            vehiclesCount: vehicles.length,
            selectedVehicleType,
            activeVehicleLat: activeVehicle?.latitude,
            filteredVehiclesCount: filteredVehicles.length
        });

        if (mapApiReady && mapRef.current) {
            const ymaps = window.ymaps;
            // Initialize map instance if API is ready and instance doesn't exist
            if (!ymapRef.current) {
                console.log('[MapView DEBUG] Initializing map instance (ymapRef.current is null).');
                ymapRef.current = new ymaps.Map(mapRef.current, {
                    center: [55.792139, 49.122135],
                    zoom: 15,
                });
                setMapInstanceReady(true); // Signal that map instance is created
                console.log('[MapView DEBUG] Map instance CREATED and mapInstanceReady set to true.');
            }

            // Proceed with map operations only if map instance is ready
            if (ymapRef.current && mapInstanceReady) { // Check mapInstanceReady here
                console.log('[MapView DEBUG] Map instance IS ready. Proceeding with map operations.');
                const mapInstance = ymapRef.current;

                mapInstance.geoObjects.removeAll();
                if (routeRef.current) {
                    console.log('[MapView DEBUG] Removing existing route from map and ref.');
                    routeRef.current = null;
                }

                const userLocation = [55.792139, 49.122135];
                const userPlacemark = new ymaps.Placemark(
                    userLocation,
                    { hintContent: 'Вы здесь', balloonContent: 'Ваше текущее местоположение' },
                    { preset: 'islands#geolocationIcon', iconColor: '#007bff' }
                );
                mapInstance.geoObjects.add(userPlacemark);
                console.log('[MapView DEBUG] User placemark added.');

                console.log('[MapView DEBUG] Adding vehicle placemarks. Count:', filteredVehicles.length);
                filteredVehicles.forEach((vehicle) => {
                    let placemarkPreset = 'islands#blueCircleDotIcon';
                    if (activeVehicle && activeVehicle.latitude === vehicle.latitude && activeVehicle.longitude === vehicle.longitude) {
                        placemarkPreset = 'islands#redCircleDotIcon';
                    }
                    
                    // Создаем HTML-содержимое для балуна метки с кнопкой "Подробнее"
                    const balloonContentLayout = ymaps.templateLayoutFactory.createClass(
                        `<div class="balloon-content">
                            <p><strong>Тип:</strong> ${vehicle.type}</p>
                            <p><strong>Заряд:</strong> ${vehicle.batteryLevel}%</p>
                            <p><strong>Цена:</strong> ${vehicle.pricePerMinute}₽/мин</p>
                            <button id="details-btn" class="details-button" 
                                style="background-color: #007bff; color: #fff; border: none; padding: 5px 10px; 
                                border-radius: 5px; cursor: pointer; margin-top: 10px;">Подробнее</button>
                        </div>`,
                        {
                            build: function() {
                                balloonContentLayout.superclass.build.call(this);
                                // Находим кнопку и добавляем обработчик
                                document.getElementById('details-btn').addEventListener('click', () => {
                                    handleShowDetails(vehicle);
                                });
                            },
                            clear: function() {
                                // Удаляем обработчик перед удалением макета из DOM
                                if (document.getElementById('details-btn')) {
                                    document.getElementById('details-btn').removeEventListener('click', () => {
                                        handleShowDetails(vehicle);
                                    });
                                }
                                balloonContentLayout.superclass.clear.call(this);
                            }
                        }
                    );

                    const placemark = new ymaps.Placemark(
                        [parseFloat(vehicle.latitude), parseFloat(vehicle.longitude)],
                        { 
                            hintContent: vehicle.type
                        },
                        { 
                            preset: placemarkPreset,
                            balloonContentLayout: balloonContentLayout,
                            balloonPanelMaxMapArea: 0 // Это заставит балун всегда открываться в панели
                        }
                    );
                    
                    placemark.events.add('click', () => {
                        console.log('[MapView DEBUG] Placemark clicked:', vehicle);
                        handlePlacemarkClick(vehicle);
                    });
                    
                    mapInstance.geoObjects.add(placemark);
                });

                let routeDestination = null;
                let buildRoute = false;
                console.log('[MapView DEBUG] Initial routeDecision values. buildRoute:', buildRoute, 'routeDestination:', routeDestination, 'activeVehicle:', activeVehicle, 'selectedVehicleType:', selectedVehicleType);

                if (activeVehicle) {
                    console.log('[MapView DEBUG] Attempting route to activeVehicle:', activeVehicle);
                    const isActiveVehicleInFilteredList = filteredVehicles.some(v => v.latitude === activeVehicle.latitude && v.longitude === activeVehicle.longitude);
                    console.log('[MapView DEBUG] isActiveVehicleInFilteredList:', isActiveVehicleInFilteredList);
                    if (isActiveVehicleInFilteredList) {
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
                        } else {
                            routeDestination = [parseFloat(activeVehicle.latitude), parseFloat(activeVehicle.longitude)];
                            buildRoute = true;
                            console.log('[MapView DEBUG] Route to active (no filter). buildRoute:', buildRoute, 'Destination:', routeDestination);
                        }
                    } else {
                        console.log('[MapView DEBUG] Active vehicle is not in the current filtered list. No route to active.');
                    }
                }

                if (!buildRoute && selectedVehicleType && filteredVehicles.length > 0) {
                    console.log('[MapView DEBUG] Attempting route to nearest of type:', selectedVehicleType, 'Count:', filteredVehicles.length);
                    let nearestVehicle = null;
                    let minDistanceSq = Infinity;
                    filteredVehicles.forEach(v => {
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
                        // Устанавливаем ближайший транспорт как активный, чтобы его метка стала красной
                        setActiveVehicle(nearestVehicle);
                        console.log('[MapView DEBUG] Route to nearest. buildRoute:', buildRoute, 'Destination:', routeDestination, 'Nearest:', nearestVehicle);
                    } else {
                        console.log('[MapView DEBUG] No nearest vehicle found for type:', selectedVehicleType);
                    }
                }

                if (buildRoute && routeDestination) {
                    console.log('[MapView DEBUG] FINAL: Building route from', userLocation, 'to', routeDestination);
                    const multiRoute = new ymaps.multiRouter.MultiRoute(
                        { referencePoints: [userLocation, routeDestination], params: { routingMode: 'pedestrian' } },
                        { boundsAutoApply: true, wayPointIconLayout: ymaps.templateLayoutFactory.createClass('<div></div>'), viaPointIconLayout: ymaps.templateLayoutFactory.createClass('<div></div>') }
                    );
                    mapInstance.geoObjects.add(multiRoute);
                    routeRef.current = multiRoute;
                    console.log('[MapView DEBUG] Route added to map.');
                } else {
                    console.log('[MapView DEBUG] FINAL: No route built. buildRoute:', buildRoute, 'routeDestination:', routeDestination);
                }
            } else {
                console.log('[MapView DEBUG] Map instance NOT YET ready (mapInstanceReady is false or ymapRef.current is null), skipping map operations.');
            }
        } else {
            console.log('[MapView DEBUG] YMAPS API not ready OR mapRef.current not available. mapApiReady:', mapApiReady);
        }

        return () => {
            console.log('[MapView DEBUG] MAIN MAP EFFECT cleanup.');
        };
    }, [mapApiReady, mapInstanceReady, vehicles, selectedVehicleType, activeVehicle, filteredVehicles, mapRef]); // Added mapApiReady, mapInstanceReady, removed ymapRef

    // Функция для обработки клика на метку - только активирует транспорт
    const handlePlacemarkClick = (vehicle) => {
        // Если кликнули на текущий активный транспорт
        if (activeVehicle && activeVehicle.latitude === vehicle.latitude && activeVehicle.longitude === vehicle.longitude) {
            // При втором клике на активную метку - снимаем выделение
            console.log('[MapView DEBUG] Second click on active vehicle. Deactivating vehicle.');
            setActiveVehicle(null);
            setSelectedVehicle(null);
        } else {
            // Первый клик на новый транспорт - активируем его
            console.log('[MapView DEBUG] First click or different vehicle. Setting activeVehicle.');
            setActiveVehicle(vehicle);
            setSelectedVehicle(null); // Закрываем модальное окно, если оно открыто
        }
    };

    // Функция для отображения модального окна с деталями транспорта
    const handleShowDetails = (vehicle) => {
        console.log('[MapView DEBUG] Showing details for vehicle:', vehicle);
        setSelectedVehicle(vehicle);
    };

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

