import React, { useState } from "react";
// ... другие импорты

// Добавь этот словарь типов
const typeTranslations = {
    "E-Scooter": "Электросамокат",
    "Bike": "Велосипед",
    "E-Bike": "Электровелосипед"
};

const randomFromArray = arr => arr[Math.floor(Math.random() * arr.length)];
const fakeAddresses = [
    'ул. Ленина, 1', 'пр. Мира, 18', 'ул. Гагарина, 24', 'ул. Советская, 5'
];


const ScooterDetails = ({ vehicle, onClose }) => {
    const [bookingState, setBookingState] = useState('idle');
    const [message, setMessage] = useState('');

    if (!vehicle) {
        return null;
    }

    const type = vehicle.type || '';
    const charge = vehicle.batteryLevel !== undefined ? vehicle.batteryLevel : vehicle.charge;
    const price = vehicle.pricePerMinute || vehicle.price;
    const isFree = !vehicle.status || vehicle.status === 'free' || vehicle.status === 'Свободен';

    const handleBook = () => {
        setBookingState('started');
        setMessage('Поездка началась! Хорошей дороги 😊');
    };

    const handleFinish = async () => {
        setMessage('Завершаем поездку...');
        setBookingState('finished');

        // Моковая генерация поездки
        const id = (Date.now() + Math.floor(Math.random()*1000)).toString();
        const date = new Date().toLocaleDateString("ru-RU");
        const types = ["E-Scooter", "Bike", "E-Bike"];
        const vehicleType = typeTranslations[type] || randomFromArray(types);
        const duration = `${randomFromArray([10, 15, 20, 25])} мин`;
        const distance = `${(Math.random() * 2 + 1.2).toFixed(1)} км`;
        const cost = `${randomFromArray([65, 80, 105, 110])} ₽`;
        const startPoint = randomFromArray(fakeAddresses);
        const endPoint = randomFromArray(fakeAddresses);


        const newRide = {
            id, date, vehicleType, duration, distance, cost, startPoint, endPoint,
        };
        const newPayment = {
            id: Date.now(),
            date: new Date().toISOString(),
            amount: cost,     // вычислено в вашей логике
            duration: duration, // вычислено в вашей логике
            method: "Visa *1234", // или другой актуальный способ
            vehicleType: "Электросамокат", // или другой тип
        };
        const existing = JSON.parse(localStorage.getItem("paymentHistory") || "[]");

        localStorage.setItem("paymentHistory", JSON.stringify([newPayment, ...existing]));

        setTimeout(() => {
            // Добавляем поездку в localStorage!
            const saved = localStorage.getItem("rideHistory");
            let history = saved ? JSON.parse(saved) : [];
            history = [newRide, ...history];
            localStorage.setItem("rideHistory", JSON.stringify(history));

            // Генерируем событие для обновления RideHistory
            window.dispatchEvent(new Event('update-ride-history'));

            setMessage("Поездка завершена и добавлена в историю!");
        }, 1200);
    };

    return (
        <div className="scooter-details-overlay"
             style={{
                 position: 'fixed',
                 top: 0,
                 left: 0,
                 width: '100%',
                 height: '100%',
                 backgroundColor: 'rgba(0,0,0,0.5)',
                 zIndex: 1000,
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
             }}
        >
            <div className="scooter-details"
                 style={{
                     background: 'white',
                     padding: '20px',
                     borderRadius: '12px',
                     maxWidth: '400px',
                     width: '90%',
                     textAlign: 'center',
                     position: 'relative',
                 }}
            >
                <button
                    className="close-details"
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                    }}
                    aria-label="Закрыть"
                >✖</button>
                <h2>Информация о транспорте</h2>
                <p>
                    <strong>Тип:</strong> {typeTranslations[type] || type}
                </p>
                <p>
                    <strong>Заряд батареи:</strong> {charge}%
                </p>
                <p>
                    <strong>Стоимость:</strong> {price} ₽/мин
                </p>
                {/* <div style={{ margin: "16px 0" }}>
                    <AddTestRide />
                </div> */}
                {bookingState === 'idle' && isFree && (
                    <button
                        className="book-scooter"
                        onClick={handleBook}
                        style={{
                            padding: '10px 20px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            marginTop: '10px'
                        }}
                    >
                        Забронировать
                    </button>
                )}
                {bookingState === 'started' && (
                    <>
                        <div style={{ color: '#28a745', fontWeight: 500, margin: '12px 0' }}>
                            {message || "Поездка началась! Хорошей дороги 😊"}
                        </div>
                        <button
                            className="finish-ride"
                            onClick={handleFinish}
                            style={{
                                padding: '10px 20px',
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                marginTop: '16px'
                            }}
                        >
                            Завершить поездку
                        </button>
                    </>
                )}
                {bookingState === 'finished' && (
                    <div style={{ color: '#007bff', fontWeight: 500, marginTop: '18px' }}>
                        {message || "Поездка завершена!"}
                        <button
                            style={{
                                marginTop: '20px',
                                padding: '10px 18px',
                                background: '#28a745',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                            onClick={() => {
                                setBookingState('idle');
                                setMessage('');
                            }}
                        >
                            Забронировать снова
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}

// Как у тебя, импортируй нужные typeTranslations, если они есть
export default ScooterDetails;