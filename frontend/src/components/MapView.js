// MapView.js
import React, { useEffect, useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import ScooterDetails from './ScooterDetails';

const MapView = () => {
    const [vehicles, setVehicles] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);

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

    return (
        <div className="map-container" style={{ width: '100%', height: '500px', position: 'relative' }}>
            <YMaps>
                <Map
                    defaultState={{ center: [55.796127, 49.106414], zoom: 12 }}
                    width="100%"
                    height="100%"
                >
                    {vehicles.map((vehicle, index) => (
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