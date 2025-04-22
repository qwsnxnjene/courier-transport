import React from 'react';
import './styles/App.css';
import Header from './components/Header';
import MapView from './components/MapView';
import VehicleSelector from './components/VehicleSelector';
import RideButton from './components/RideButton';

function App() {
  return (
      <div className="app-container">
        <Header />
        <MapView />
        <VehicleSelector />
        <RideButton />
      </div>
  );
}

export default App;