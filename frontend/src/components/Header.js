import React, { useState } from 'react';
import { FaUser, FaCreditCard, FaHistory, FaLifeRing, FaCog } from 'react-icons/fa';

const Header = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const menuItems = [
        { label: 'Profile', icon: <FaUser /> },
        { label: 'Payment', icon: <FaCreditCard /> },
        { label: 'History', icon: <FaHistory /> },
        { label: 'Support', icon: <FaLifeRing /> },
        { label: 'Settings', icon: <FaCog /> },
    ];

    return (
        <div className="header">
            <button className="menu-button" onClick={toggleSidebar}>☰</button>
            <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <button className="close-button" onClick={toggleSidebar}>×</button>
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            {item.icon} <span>{item.label}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Header;