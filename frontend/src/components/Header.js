import React, { useState, useEffect } from 'react';
import { FaUser, FaCreditCard, FaHistory, FaLifeRing, FaCog } from 'react-icons/fa';
import Profile from './Profile';
import Payment from './Payment';
import RideHistory from './RideHistory';

const Header = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false); // New state for history modal
    const [notifications, setNotifications] = useState('enabled');
    const [language, setLanguage] = useState('ru');

    useEffect(() => {
        const savedNotifications = localStorage.getItem('notifications');
        const savedLanguage = localStorage.getItem('language');

        if (savedNotifications) setNotifications(savedNotifications);
        if (savedLanguage) setLanguage(savedLanguage);
    }, []);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleSupportClick = () => {
        setIsSupportOpen(true);
        setIsSidebarOpen(false);
    };

    const handleProfileClick = () => {
        setIsProfileOpen(true);
        setIsSidebarOpen(false);
    };

    const handlePaymentClick = () => {
        setIsPaymentOpen(true);
        setIsSidebarOpen(false);
    };

    const handleHistoryClick = () => { // New handler for history click
        setIsHistoryOpen(true);
        setIsSidebarOpen(false);
    };

    const handleSettingsClick = () => {
        setIsSettingsOpen(true);
        setIsSidebarOpen(false);
    };

    const closeSupport = () => {
        setIsSupportOpen(false);
    };

    const closeSettings = () => {
        setIsSettingsOpen(false);
    };

    const closeProfile = () => {
        setIsProfileOpen(false);
    };

    const closePayment = () => {
        setIsPaymentOpen(false);
    };

    const closeHistory = () => { // New close handler for history
        setIsHistoryOpen(false);
    };

    const saveSettings = (e) => {
        e.preventDefault();
        localStorage.setItem('notifications', notifications);
        localStorage.setItem('language', language);
        alert('Настройки успешно сохранены!');
        closeSettings();
    };

    const menuItems = [
        { label: 'Профиль', icon: <FaUser />, onClick: handleProfileClick },
        { label: 'Оплата', icon: <FaCreditCard />, onClick: handlePaymentClick },
        { label: 'История', icon: <FaHistory />, onClick: handleHistoryClick }, // Added onClick handler
        { label: 'Поддержка', icon: <FaLifeRing />, onClick: handleSupportClick },
        { label: 'Настройки', icon: <FaCog />, onClick: handleSettingsClick },
    ];

    return (
        <div className="header">
            <button className="menu-button" onClick={toggleSidebar}>☰</button>

            {/* Боковое меню */}
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="close-button" onClick={toggleSidebar}>×</button>
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index} onClick={item.onClick || null} style={{ cursor: 'pointer' }}>
                            {item.icon} <span>{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Профиль */}
            {isProfileOpen && <Profile onClose={closeProfile} />}

            {/* Оплата */}
            {isPaymentOpen && <Payment onClose={closePayment} />}
            
            {/* История поездок */}
            {isHistoryOpen && <RideHistory onClose={closeHistory} />}

            {/* Модальное окно Поддержки */}
            {isSupportOpen && (
                <div className="support-overlay">
                    <div className="support-panel" style={{ maxWidth: window.innerWidth <= 480 ? '90%' : '500px' }}>
                        <div className="modal-header">
                            <h2>Поддержка курьеров</h2>
                            <button className="modal-close-button" onClick={closeSupport}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            <p>Вы можете связаться с нами:</p>
                            <ul className="contact-info">
                                <li>Email: support@rentalsystem.com</li>
                                <li>Телефон: +7 (999) 123-45-67</li>
                            </ul>
                            <h3>Сообщить о проблеме</h3>
                            <form className="complaint-form">
                                <textarea
                                    placeholder="Опишите вашу проблему"
                                    rows="5"
                                    style={{
                                        width: '95%',
                                        fontSize: '14px',
                                        padding: '8px',
                                        borderRadius: '6px',
                                        border: '1px solid #ccc',
                                        resize: 'none',
                                    }}
                                ></textarea>
                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '10px',
                                        padding: '8px 16px',
                                        backgroundColor: '#007BFF',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Отправить
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно Настроек */}
            {isSettingsOpen && (
                <div className="settings-overlay">
                    <div className="settings-panel" style={{ maxWidth: window.innerWidth <= 480 ? '90%' : '500px' }}>
                        <div className="modal-header">
                            <h2>Настройки</h2>
                            <button className="modal-close-button" onClick={closeSettings}>×</button>
                        </div>
                        
                        <div className="modal-content">
                            <form className="settings-form" onSubmit={saveSettings}>
                                <div className="form-group">
                                    <label htmlFor="notifications">Уведомления</label>
                                    <select
                                        id="notifications"
                                        value={notifications}
                                        onChange={(e) => setNotifications(e.target.value)}
                                    >
                                        <option value="enabled">Включены</option>
                                        <option value="disabled">Выключены</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="language">Язык</label>
                                    <select
                                        id="language"
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                    >
                                        <option value="ru">Русский</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    style={{
                                        marginTop: '10px',
                                        padding: '8px 16px',
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: '16px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Сохранить настройки
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;
