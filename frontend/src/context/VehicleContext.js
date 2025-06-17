import React, { createContext, useState, useContext } from 'react';

// Создаем контекст
const VehicleContext = createContext();

// Хук для использования контекста в компонентах
export const useVehicle = () => useContext(VehicleContext);

// Провайдер контекста
export const VehicleProvider = ({ children }) => {
  const [selectedVehicleType, setSelectedVehicleType] = useState(null);
  const [activeVehicle, setActiveVehicle] = useState(null);

  // Значение, которое будет доступно в контексте
  const value = {
    selectedVehicleType,
    setSelectedVehicleType,
    activeVehicle,
    setActiveVehicle
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};
