import React from 'react';
import { YMaps, Map } from '@pbe/react-yandex-maps';

const MapView = () => {
    return (
        <div className="map-container">
            <YMaps>
                <Map
                    defaultState={{ center: [55.796127, 49.106414], zoom: 12 }}
                    width="100%"
                    height="100%"
                >
                </Map>
            </YMaps>
        </div>
    );
};

export default MapView;