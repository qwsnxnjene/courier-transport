import React, { useState, useEffect } from 'react';
import { FaUser, FaStar, FaMotorcycle, FaClock, FaSignOutAlt } from 'react-icons/fa';

const Profile = ({ onClose }) => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [profileData, setProfileData] = useState(null);

    // Имитация данных профиля
    const mockProfileData = {
        name: 'Иван Петров',
        rating: 4.8,
        totalRides: 256,
        workingHours: 180,
        earnedThisMonth: 58000,
        status: 'active',
        transportPreferences: ['Электросамокат', 'Велосипед'],
        currentVehicle: null,
        documents: {
            passport: 'Подтвержден',
            driverLicense: 'Не требуется',
        }
    };

    useEffect(() => {
        // Проверяем наличие токена в localStorage
        const token = localStorage.getItem('authToken');
        console.log(token)
        if (token) {
            setIsAuthorized(true);
            setProfileData(mockProfileData);
        }
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        // Имитация успешной авторизации
        localStorage.setItem('authToken', 'mock_token');
        setIsAuthorized(true);
        setProfileData(mockProfileData);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthorized(false);
        setProfileData(null);
    };

    if (!isAuthorized) {
        return (
            <div className="profile-overlay">
                <div className="profile-panel">
                    <button className="close-profile" onClick={onClose}>×</button>
                    <h2>Авторизация</h2>
                    <form onSubmit={handleLogin} className="login-form">
                        <div className="form-group">
                            <label>Логин</label>
                            <input type="text" placeholder="Введите логин" required />
                        </div>
                        <div className="form-group">
                            <label>Пароль</label>
                            <input type="password" placeholder="Введите пароль" required />
                        </div>
                        <button type="submit" className="login-button">Войти</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-overlay">
            <div className="profile-panel">
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
                        <FaMotorcycle />
                        <div className="stat-details">
                            <span className="stat-value">{profileData.totalRides}</span>
                            <span className="stat-label">Поездок</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <FaClock />
                        <div className="stat-details">
                            <span className="stat-value">{profileData.workingHours}ч</span>
                            <span className="stat-label">Отработано</span>
                        </div>
                    </div>
                </div>

                <div className="earnings-section">
                    <h3>Заработок за месяц</h3>
                    <span className="earnings-amount">{profileData.earnedThisMonth} ₽</span>
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