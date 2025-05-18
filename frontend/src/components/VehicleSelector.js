import React, { useState } from 'react';
import bikeIcon from '../assets/images/Bike.png';
import eBikeIcon from '../assets/images/E-Bike.png';
import scooterIcon from '../assets/images/E-Scooter.png';

const vehicles = [
    { type: 'Bike', price: 'от 3₽/мин', icon: bikeIcon },
    { type: 'E-Bike', price: 'от 5.4₽/мин', icon: eBikeIcon },
    { type: 'E-Scooter', price: 'от 5.4₽/мин', icon: scooterIcon },
];

const VehicleSelector = () => {
    const [isExpanded, setIsExpanded] = useState(true); // Состояние для панели

    const toggleSelector = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div
            className={`vehicle-selector-container ${isExpanded ? 'expanded' : 'collapsed'}`}
            style={{
                position: 'relative',
                transition: 'max-height 0.3s ease-in-out',
                overflow: 'hidden',
                maxHeight: isExpanded ? '300px' : '60px', // Максимальная высота для разных состояний
            }}
        >
            <button
                className="toggle-selector"
                onClick={toggleSelector}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: isExpanded ? '#007BFF' : '#444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    zIndex: 10,
                }}
            >
                {isExpanded ? '⯆' : '⯈'}
            </button>

            <div className="vehicle-selector">
                {vehicles.map((vehicle, index) => (
                    <div
                        key={index}
                        className="vehicle-card"
                        style={{
                            backgroundImage: `url(${vehicle.icon})`,
                            backgroundPosition: 'center -10px',
                            marginBottom: '10px',
                        }}
                    >
                        <div className="vehicle-info" style={{ marginTop: '100%' }}>
                            <span>{vehicle.type}</span>
                            <span className="price">{vehicle.price}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VehicleSelector;