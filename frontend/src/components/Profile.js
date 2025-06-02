import React, { useState, useEffect } from 'react';
import { FaUser, FaStar, FaMotorcycle, FaClock, FaSignOutAlt } from 'react-icons/fa';
import Login from './Login';

const Profile = ({ onClose }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [profileData, setProfileData] = useState(null);

    const mockProfileData = {
        name: 'Иван Петров',
        rating: 4.8,
        status: 'active',
        transportPreferences: ['Электросамокат', 'Велосипед'],
        currentVehicle: null,
        documents: {
            passport: 'Подтвержден',
            driverLicense: 'Не требуется',
        },
        rentalStats: {
            totalRentals: 45,
            currentBalance: 2500,
            vehicleStats: {
                'e-scooter': 25,    // электросамокаты
                'bike': 12,         // велосипеды
                'e-bike': 8         // электровелосипеды
            }
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthorized(true);
            setProfileData(mockProfileData);
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthorized(true);
        setProfileData(mockProfileData);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthorized(false);
        setProfileData(null);
    };

    if (!isAuthorized) {
        return <Login onLoginSuccess={handleLoginSuccess} onClose={onClose} />;
    }

    return (
        <div className="profile-overlay">
            <div className="profile-panel" style={{ maxWidth: window.innerWidth <= 480 ? '90%' : '500px' }}>
                <button className="close-profile" onClick={onClose}>×</button>
                <div className="profile-header">
                    <FaUser className="profile-avatar" />
                    <div className="profile-main-info">
                        <h2>{profileData.name}</h2>
                        <div className="rating">
                            <FaStar /> {profileData.rating}
                        </div>
                    </div>
                </div>

                <div className="profile-stats">
                    <div className="stat-item">
                        <div className="stat-details">
                            <span className="stat-value">{profileData.rentalStats.totalRentals}</span>
                            <span className="stat-label">Аренд транспорта</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-details">
                            <span className="stat-value">{profileData.rentalStats.currentBalance} ₽</span>
                            <span className="stat-label">Баланс</span>
                        </div>
                    </div>
                </div>

                <div className="rental-info-section">
                    <h3>Информация об аренде</h3>
                    <div className="rental-stats">
                        <div className="rental-stat-item">
                            <span>Электросамокаты:</span>
                            <span>{profileData.rentalStats.vehicleStats['e-scooter']} поездок</span>
                        </div>
                        <div className="rental-stat-item">
                            <span>Велосипеды:</span>
                            <span>{profileData.rentalStats.vehicleStats['bike']} поездок</span>
                        </div>
                        <div className="rental-stat-item">
                            <span>Электровелосипеды:</span>
                            <span>{profileData.rentalStats.vehicleStats['e-bike']} поездок</span>
                        </div>
                        {profileData.currentVehicle && (
                            <div className="rental-stat-item current-rental">
                                <span>Текущая аренда:</span>
                                <span>{profileData.currentVehicle}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="preferences-section">
                    <h3>Предпочитаемый транспорт</h3>
                    <div className="preferences-list">
                        {profileData.transportPreferences.map((transport, index) => (
                            <span key={index} className="preference-tag">{transport}</span>
                        ))}
                    </div>
                </div>

                <div className="documents-section">
                    <h3>Документы</h3>
                    <div className="documents-list">
                        <div className="document-item">
                            <span className="document-name">Паспорт:</span>
                            <span className="document-status">{profileData.documents.passport}</span>
                        </div>
                        <div className="document-item">
                            <span className="document-name">Водительские права:</span>
                            <span className="document-status">{profileData.documents.driverLicense}</span>
                        </div>
                    </div>
                </div>

                <button className="logout-button" onClick={handleLogout}>
                    <FaSignOutAlt /> Выйти
                </button>
            </div>
        </div>
    );
};

export default Profile;
