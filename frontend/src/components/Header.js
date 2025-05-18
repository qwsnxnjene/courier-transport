import React, { useState, useEffect } from 'react';
import { FaUser, FaCreditCard, FaHistory, FaLifeRing, FaCog } from 'react-icons/fa';

const Header = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Состояние для настроек
    const [notifications, setNotifications] = useState('enabled');
    const [language, setLanguage] = useState('ru');

    // Загрузка сохраненных настроек из localStorage при загрузке компонента
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
    };

    const closeSupport = () => {
        setIsSupportOpen(false);
    };

    const handleSettingsClick = () => {
        setIsSettingsOpen(true);
    };

    const closeSettings = () => {
        setIsSettingsOpen(false);
    };

    // Обработка сохранения настроек
    const saveSettings = (e) => {
        e.preventDefault();
        localStorage.setItem('notifications', notifications);
        localStorage.setItem('language', language);
        alert('Настройки успешно сохранены!');
        closeSettings();
    };

    const menuItems = [
        { label: 'Profile', icon: <FaUser /> },
        { label: 'Payment', icon: <FaCreditCard /> },
        { label: 'History', icon: <FaHistory /> },
        { label: 'Support', icon: <FaLifeRing />, onClick: handleSupportClick },
        { label: 'Settings', icon: <FaCog />, onClick: handleSettingsClick },
    ];

    return (
        <div className="header">
            <button className="menu-button" onClick={toggleSidebar}>☰</button>
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="close-button" onClick={toggleSidebar}>×</button>
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index} onClick={item.onClick || null}>
                            {item.icon} <span>{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Модальное окно Поддержки */}
            {isSupportOpen && (
                <div className="support-overlay">
                    <div className="support-panel">
                        <button className="close-support" onClick={closeSupport}>×</button>
                        <h2>Поддержка клиентов</h2>
                        <p>Вы можете связаться с нами:</p>
                        <ul className="contact-info">
                            <li>Email: support@rentalsystem.com</li>
                            <li>Телефон: +7 (999) 123-45-67</li>
                        </ul>
                        <h3>Жалоба</h3>
                        <form className="complaint-form">
                            <textarea
                                placeholder="Опишите вашу проблему"
                                rows="5"
                                style={{
                                    width: '100%',
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
            )}

            {/* Модальное окно Настроек */}
            {isSettingsOpen && (
                <div className="settings-overlay">
                    <div className="settings-panel">
                        <button className="close-settings" onClick={closeSettings}>×</button>
                        <h2>Настройки</h2>
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
            )}
        </div>
    );
};

export default Header;