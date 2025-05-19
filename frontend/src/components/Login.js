import React, { useState } from 'react';

const Login = ({ onLoginSuccess, onClose }) => {  // Добавляем onClose в пропсы
    const [loginData, setLoginData] = useState({
        login: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:3031/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка авторизации');
            }

            if (data.token) {
                localStorage.setItem('authToken', data.token);
                onLoginSuccess();
            } else {
                throw new Error('Токен не получен');
            }
        } catch (error) {
            setError(error.message);
            console.error('Ошибка при авторизации:', error);
        }
    };

    return (
        <div className="profile-overlay">
            <div className="profile-panel">
                <button className="close-profile" onClick={onClose}>×</button>
                <h2>Авторизация</h2>
                {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>Логин</label>
                        <input 
                            type="text" 
                            name="login"
                            value={loginData.login}
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
                            value={loginData.password}
                            onChange={handleInputChange}
                            placeholder="Введите пароль" 
                            required 
                        />
                    </div>
                    <button type="submit" className="login-button">Войти</button>
                </form>
            </div>
        </div>
    );
};

export default Login;