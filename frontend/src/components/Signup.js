import React, { useState } from 'react';

const Signup = ({ onSignupSuccess, onClose }) => {
    const [signupData, setSignupData] = useState({
        login: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSignupData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        try {
            const response = await fetch('http://localhost:3031/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка регистрации');
            }

            setSuccess(true);
            // Можно сразу входить или возвращать к логину
            onSignupSuccess();
        } catch (error) {
            setError(error.message);
            setSuccess(false);
        }
    };

    return (
        <div className="profile-overlay">
            <div className="profile-panel">
                <button className="close-profile" onClick={onClose}>×</button>
                <h2>Регистрация</h2>
                {success && <div style={{ color: 'green', marginBottom: 10 }}>Регистрация прошла успешно!</div>}
                {error && <div className="error-message" style={{ color: 'red', marginBottom: 10 }}>{error}</div>}
                <form onSubmit={handleSignup} className="login-form">
                    <div className="form-group">
                        <label>Логин</label>
                        <input
                            type="text"
                            name="login"
                            value={signupData.login}
                            onChange={handleInputChange}
                            placeholder="Введите логин"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Пароль</label>
                        <input
                            type="password"
                            name="password"
                            value={signupData.password}
                            onChange={handleInputChange}
                            placeholder="Введите пароль"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Зарегистрироваться</button>
                </form>
            </div>
        </div>
    );
};

export default Signup;
