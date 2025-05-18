import React, { useEffect, useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import ScooterDetails from './ScooterDetails';

const MapView = () => {
    const [scooters, setScooters] = useState([]);
    const [selectedScooter, setSelectedScooter] = useState(null);

    useEffect(() => {
        const fetchScooters = async () => {
            try {
                const response = await fetch('/api/transport');
                if (response.ok) {
                    const data = await response.json();

                    if (data.length === 0) {
                        console.warn('База данных пуста, используются тестовые данные.');
                        setScooters([
                            { latitude: '55.796127', longitude: '49.106414', batteryLevel: 80, status: 'free' },
                            { latitude: '55.790000', longitude: '49.120000', batteryLevel: 40, status: 'free' },
                            { latitude: '55.805000', longitude: '49.115000', batteryLevel: 95, status: 'free' },
                        ]);
                    } else {
                        setScooters(data);
                    }
                } else {
                    console.error('Ошибка загрузки данных.');
                }
            } catch (error) {
                console.error('Ошибка сети:', error);
                setScooters([
                    { latitude: '55.796127', longitude: '49.106414', batteryLevel: 80, status: 'free' },
                    { latitude: '55.790000', longitude: '49.120000', batteryLevel: 40, status: 'free' },
                    { latitude: '55.805000', longitude: '49.115000', batteryLevel: 95, status: 'free' },
                ]);
            }
        };

        fetchScooters();
    }, []);

    const handlePlacemarkClick = (scooter) => setSelectedScooter(scooter);

    const handleCloseDetails = () => setSelectedScooter(null);

    const handleBookScooter = () => {
        console.log(`Самокат с координатами [${selectedScooter.latitude}, ${selectedScooter.longitude}] забронирован!`);
        setSelectedScooter(null);
    };

    return (
        <div className="map-container" style={{ width: '100%', height: '500px', position: 'relative' }}>
            <YMaps>
                <Map
                    defaultState={{ center: [55.796127, 49.106414], zoom: 12 }}
                    width="100%"
                    height="100%"
                >
                    {scooters.map((scooter, index) => (
                        <Placemark
                            key={index}
                            geometry={[parseFloat(scooter.latitude), parseFloat(scooter.longitude)]}
                            onClick={() => handlePlacemarkClick(scooter)}
                        />
                    ))}
                </Map>
            </YMaps>

            {/* Отображение деталей самоката поверх карты */}
            <ScooterDetails
                scooter={selectedScooter}
                onClose={handleCloseDetails}
                onBook={handleBookScooter}
            />
        </div>
    );
};

export default MapView;