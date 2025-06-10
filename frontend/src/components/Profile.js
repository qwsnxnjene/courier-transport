import React, { useEffect, useState } from 'react';
import { FaUser, FaStar, FaSignOutAlt } from 'react-icons/fa';
import Login from './Login';

const transformProfile = (data) => ({
    name: data.Name,
    rating: data.Rating,
    status: data.Status,
    transportPreferences: JSON.parse(data.Transport),
    currentVehicle: null,
    documents: {
        passport: data.Passport,
        driverLicense: data.DriverLicense,
    },
    rentalStats: {
        totalRentals: data.TotalRentals,
        currentBalance: data.CurrentBalance,
        vehicleStats: {
            'e-scooter': data.EScooters,
            'bike': data.Bikes,
            'e-bike': data.EBikes,
        }
    }
});

const Profile = ({ onClose }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [error, setError] = useState(null);

    const fetchProfile = async () => {
        const token = localStorage.getItem('authToken');
        setError(null);
        try {
            const response = await fetch('http://localhost:3031/api/profile', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            const data = await response.json();
            if (!response.ok) {
                setError(data.error || "Ошибка загрузки профиля");
                setProfileData(null);
                return;
            }
            setProfileData(transformProfile(data));
        } catch (e) {
            setError("Ошибка сети");
            setProfileData(null);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthorized(true);
            fetchProfile();
        }
    }, []);

    const handleLoginSuccess = () => {
        setIsAuthorized(true);
        fetchProfile();
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthorized(false);
        setProfileData(null);
    };

    if (!isAuthorized) {
        return <Login onLoginSuccess={handleLoginSuccess} onClose={onClose} />;
    }

    // Ошибка загрузки профиля
    if (error) {
        return (
            <div className="profile-overlay">
                <div className="profile-panel" style={{ maxWidth: window.innerWidth <= 480 ? '90%' : '500px' }}>
                    <div className="modal-header">
                        <h2>Профиль</h2>
                        <button className="modal-close-button" onClick={onClose}>×</button>
                    </div>
                    <div className="modal-content">
                        <p style={{ color: "red", marginTop: 20 }}>{error}</p>
                        <button className="logout-button" onClick={handleLogout} style={{ marginTop: 16 }}>
                            <FaSignOutAlt /> Выйти
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Загрузка профиля
    if (!profileData) {
        return (
            <div className="profile-overlay">
                <div className="profile-panel" style={{ maxWidth: window.innerWidth <= 480 ? '90%' : '500px' }}>
                    <div className="modal-header">
                        <h2>Профиль</h2>
                        <button className="modal-close-button" onClick={onClose}>×</button>
                    </div>
                    <div className="modal-content">
                        <p style={{ marginTop: 20 }}>Загрузка профиля...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Профиль успешно загружен
    return (
        <div className="profile-overlay">
            <div className="profile-panel" style={{ maxWidth: window.innerWidth <= 480 ? '90%' : '500px' }}>
                <div className="modal-header">
                    <h2>Профиль</h2>
                    <button className="modal-close-button" onClick={onClose}>×</button>
                </div>
                <div className="modal-content">

                    <div className="profile-header">
                        <FaUser className="profile-avatar" />
                        <div className="profile-main-info">
                            <h2>{profileData.name}</h2>
                            <div className="rating">
                                <FaStar /> {profileData.rating}
                            </div>
                            <div className="status-label">{profileData.status}</div>
                        </div>
                    </div>

                    <div className="profile-stats">
                        <div className="stat-item">
                            <div className="stat-details">
                                <span className="stat-value">{profileData.rentalStats.totalRentals}</span>
                                <span className="stat-label">Аренды</span>
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
                            {(profileData.transportPreferences || []).map((transport, index) => (
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
        </div>
    );
};

export default Profile;