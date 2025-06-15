import React from 'react';
import './styles/App.css';
import Header from './components/Header';
import MapView from './components/MapView';
import VehicleSelector from './components/VehicleSelector';
import RideButton from './components/RideButton';
import { VehicleProvider } from './context/VehicleContext';

function App() {
  return (
    <VehicleProvider>
      <div className="app-container">
        <Header />
        <MapView />
        <VehicleSelector />
        <RideButton />
      </div>
    </VehicleProvider>
  );
}

export default App;

