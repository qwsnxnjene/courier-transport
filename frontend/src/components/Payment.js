import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaPaypal, FaApplePay, FaHistory, FaPlus, FaTrash } from 'react-icons/fa';

const Payment = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('methods');
    const [savedCards, setSavedCards] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);

    useEffect(() => {
        setSavedCards([
            {
                id: 1,
                type: 'visa',
                number: '**** **** **** 1234',
                expiry: '12/24',
                isDefault: true
            }
        ]);

        let loadedHistory = [];
        const stored = localStorage.getItem("paymentHistory");
        if (stored) {
            loadedHistory = JSON.parse(stored);
        } // не подставляем моковые данные!
        setPaymentHistory(loadedHistory);


    }, []);

    const handleAddCard = () => {
        alert('Функция добавления карты будет доступна позже');
    };

    const handleRemoveCard = (cardId) => {
        setSavedCards(savedCards.filter(card => card.id !== cardId));
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="payment-overlay">
            <div className="payment-panel">
                <button className="close-payment" onClick={onClose}>×</button>
                <h2>Способы оплаты</h2>

                <div className="payment-tabs">
                    <button
                        className={`tab-button ${activeTab === 'methods' ? 'active' : ''}`}
                        onClick={() => setActiveTab('methods')}
                    >
                        Способы оплаты
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        История платежей
                    </button>
                </div>

                {activeTab === 'methods' ? (
                    <div className="payment-methods-container">
                        <div className="saved-cards">
                            <h3>Сохраненные карты</h3>
                            {savedCards.map(card => (
                                <div key={card.id} className="saved-card">
                                    <FaCreditCard className="card-icon" />
                                    <div className="card-info">
                                        <span>{card.number}</span>
                                        <span className="card-expiry">До {card.expiry}</span>
                                    </div>
                                    {card.isDefault && <span className="default-badge">По умолчанию</span>}
                                    <button
                                        className="remove-card-button"
                                        onClick={() => handleRemoveCard(card.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                            <button className="add-card-button" onClick={handleAddCard}>
                                <FaPlus /> Добавить карту
                            </button>
                        </div>

                        <div className="other-methods">
                            <h3>Другие способы оплаты</h3>
                            <div className="payment-method">
                                <FaPaypal />
                                <span>PayPal</span>
                            </div>
                            <div className="payment-method">
                                <FaApplePay />
                                <span>Apple Pay</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="payment-history">
                        <h3>История платежей</h3>
                        {paymentHistory.map(payment => (
                            <div key={payment.id} className="payment-record">
                                <div className="payment-record-header">
                                    <span className="payment-date">{formatDate(payment.date)}</span>
                                    <span className="payment-amount">{payment.amount}</span>
                                </div>
                                <div className="payment-details">
                                    <span>Транспорт: {payment.vehicleType}</span>
                                    <span>Длительность: {payment.duration}</span>
                                    <span>Способ оплаты: {payment.method}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;