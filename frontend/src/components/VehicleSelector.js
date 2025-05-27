import React from 'react';
import bikeIcon from '../assets/images/Bike.png';
import eBikeIcon from '../assets/images/E-Bike.png';
import scooterIcon from '../assets/images/E-Scooter.png';

const vehicles = [
    { type: 'Bike', price: 'от 3₽/мин', icon: bikeIcon },
    { type: 'E-Bike', price: 'от 5.4₽/мин', icon: eBikeIcon },
    { type: 'E-Scooter', price: 'от 5.4₽/мин', icon: scooterIcon },
];

const VehicleSelector = () => {
    return (
        <div className="vehicle-selector">
            {vehicles.map((vehicle, index) => (
                <div key={index} className="vehicle-card">
                    <div
                        className="vehicle-icon"
                        style={{
                            backgroundImage: `url(${vehicle.icon})`,
                            backgroundPosition: 'center',
                            backgroundSize: 'contain',
                            backgroundRepeat: 'no-repeat',
                            width: '100%',
                            height: '70%',
                        }}
                    ></div>
                    <div className="vehicle-info">
                        <span>{vehicle.type}</span>
                        <span className="price">{vehicle.price}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VehicleSelector;
