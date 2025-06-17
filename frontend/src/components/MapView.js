// MapView.js
import React, { useEffect, useState, useRef } from 'react';
// import ScooterDetails from './ScooterDetails'; // Removed, slider handles details
import { useVehicle } from '../context/VehicleContext';

// Note: The `vehicles` prop is now passed from App.js
// The `setSliderVehicle` prop is also passed from App.js to directly set the vehicle for the slider
const MapView = ({ vehicles, setSliderVehicle }) => {
    // const [vehicles, setVehicles] = useState([]); // Vehicles state is now managed by App.js
    // const [selectedVehicle, setSelectedVehicle] = useState(null); // Replaced by slider logic
    const [activeVehicle, setActiveVehicle] = useState(null); // For active (red) placemark on map
    const { selectedVehicleType } = useVehicle();
    const mapRef = useRef(null);
    const ymapRef = useRef(null);
    const routeRef = useRef(null);

    const [mapApiReady, setMapApiReady] = useState(false);
    const [mapInstanceReady, setMapInstanceReady] = useState(false);

    // useEffect for fetching vehicles is removed, as vehicles are passed as a prop from App.js

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
        : vehicles; // Use vehicles prop
    console.log('[MapView DEBUG] Initial/Re-render. selectedVehicleType:', selectedVehicleType, 'filteredVehicles count:', filteredVehicles.length);

    useEffect(() => {
        console.log('[MapView DEBUG] selectedVehicleType EFFECT triggered. New type:', selectedVehicleType);
        setActiveVehicle(null);
        // setSelectedVehicle(null); // Slider handles this
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
                    const placemark = new ymaps.Placemark(
                        [parseFloat(vehicle.latitude), parseFloat(vehicle.longitude)],
                        { hintContent: vehicle.type, balloonContent: `Тип: ${vehicle.type}<br>Батарея: ${vehicle.batteryLevel}%<br>Цена: ${vehicle.pricePerMinute}₽/мин` },
                        { preset: placemarkPreset }
                    );
                    placemark.events.add('click', () => {
                        console.log('[MapView DEBUG] Placemark clicked:', vehicle);
                        setActiveVehicle(vehicle); // Highlight placemark
                        setSliderVehicle(vehicle); // Call prop function to show vehicle in slider (App.js handles this)
                        // setSelectedVehicle(null); // No longer needed
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
    }, [mapApiReady, mapInstanceReady, vehicles, selectedVehicleType, activeVehicle, filteredVehicles, mapRef, setSliderVehicle]); // Added setSliderVehicle to dependencies

    // handleCloseDetails and handleBookVehicle are removed as ScooterDetails modal is removed

    return (
        <div className="map-container" style={{ width: '100%', height: '500px', position: 'relative' }}>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>
            {/* ScooterDetails component removed, slider will display details */}
        </div>
    );
}
export default MapView;

