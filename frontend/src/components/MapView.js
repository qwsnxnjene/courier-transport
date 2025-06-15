// MapView.js
import React, { useEffect, useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import ScooterDetails from './ScooterDetails';
import { useVehicle } from '../context/VehicleContext';

const MapView = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const { selectedVehicleType } = useVehicle();

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
                }
            } catch (error) {
                console.error('Ошибка сети:', error);
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
            }
        };

        fetchVehicles();
    }, []);

    const handlePlacemarkClick = (vehicle) => setSelectedVehicle(vehicle);

    const handleCloseDetails = () => setSelectedVehicle(null);

    const handleBookVehicle = () => {
        console.log(`Транспорт типа ${selectedVehicle.type} забронирован!`);
        setSelectedVehicle(null);
    };

    // Функция для преобразования русских названий типов в английские
    const mapVehicleTypeToEnglish = (russianType) => {
        // Handle cases where russianType might not be a string
        if (typeof russianType !== 'string') {
            return ""; 
        }
        const typeMap = {
            'Электросамокат': 'E-Scooter',
            'Велосипед': 'Bike',
            'Электровелосипед': 'E-Bike'
        };
        return typeMap[russianType] || russianType; // Fallback returns original if not in map
    };
    
    // Функция для сравнения типа транспорта с выбранным типом
    const matchesSelectedType = (vehicleType) => {
        const processedVehicleType = mapVehicleTypeToEnglish(vehicleType);

        // Ensure both processedVehicleType and selectedVehicleType are strings before comparison
        if (typeof processedVehicleType === 'string' && typeof selectedVehicleType === 'string') {
            console.log(`Сравниваем (case-insensitive): '${processedVehicleType.toLowerCase()}' с '${selectedVehicleType.toLowerCase()}'`);
            return processedVehicleType.toLowerCase() === selectedVehicleType.toLowerCase();
        }
        // console.log(`Сравнение не удалось: processed='${processedVehicleType}', selected='${selectedVehicleType}'`);
        return false;
    };

    // Фильтруем транспорт по выбранному типу
    const filteredVehicles = selectedVehicleType 
        ? vehicles.filter(vehicle => vehicle && typeof vehicle.type === 'string' && matchesSelectedType(vehicle.type))
        : vehicles;
        
    console.log("Выбранный тип:", selectedVehicleType);
    console.log("Отфильтрованные транспорты:", filteredVehicles);

    return (
        <div className="map-container" style={{ width: '100%', height: '500px', position: 'relative' }}>
            <YMaps>
                <Map
                    defaultState={{ center: [55.796127, 49.106414], zoom: 12 }}
                    width="100%"
                    height="100%"
                >
                    {filteredVehicles.map((vehicle, index) => (
                        <Placemark
                            key={index}
                            geometry={[parseFloat(vehicle.latitude), parseFloat(vehicle.longitude)]}
                            onClick={() => handlePlacemarkClick(vehicle)}
                        />
                    ))}
                </Map>
            </YMaps>

            <ScooterDetails
                vehicle={selectedVehicle}
                onClose={handleCloseDetails}
                onBook={handleBookVehicle}
            />
        </div>
    );
};

export default MapView;

