import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import './styles/App.css';
import Header from './components/Header';
import MapView from './components/MapView';
import VehicleSelector from './components/VehicleSelector';
import RideButton from './components/RideButton';
import { VehicleProvider, useVehicle } from './context/VehicleContext'; // Import useVehicle
import VehicleDetailSlider from './components/VehicleDetailSlider'; // Import the slider

// Helper function to map Russian vehicle types to English for icon/key consistency
const mapVehicleTypeToEnglishGlobal = (russianType) => {
    if (typeof russianType !== 'string') {
        return "";
    }
    const typeMap = {
        'Электросамокат': 'E-Scooter',
        'Велосипед': 'Bike',
        'Электровелосипед': 'E-Bike'
    };
    return typeMap[russianType] || russianType;
};

// Create a new component to be wrapped by VehicleProvider, so we can use useVehicle hook
function AppContent() {
  const [sliderVehicle, setSliderVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]); // State to hold all vehicles
  const { selectedVehicleType, setSelectedVehicleType } = useVehicle(); // Get from context

  // Fetch all vehicles once when the component mounts
  useEffect(() => {
    const fetchVehiclesData = async () => {
      try {
        const response = await fetch('http://localhost:3031/api/transport');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setVehicles(data);
          } else {
            console.warn('App.js: Vehicle data is empty or null, using mock data.');
            setVehicles([
              { id: 'mock1', latitude: '55.796127', longitude: '49.106414', batteryLevel: 80, status: 'free', type: 'Электросамокат', pricePerMinute: 5 },
              { id: 'mock2', latitude: '55.790000', longitude: '49.120000', batteryLevel: 40, status: 'free', type: 'Велосипед', pricePerMinute: 3 },
              { id: 'mock3', latitude: '55.805000', longitude: '49.115000', batteryLevel: 95, status: 'free', type: 'Электровелосипед', pricePerMinute: 4 },
            ]);
          }
        } else {
          console.error('App.js: Error fetching vehicles, using mock data.');
          setVehicles([
            { id: 'mock1', latitude: '55.796127', longitude: '49.106414', batteryLevel: 80, status: 'free', type: 'Электросамокат', pricePerMinute: 5 },
            { id: 'mock2', latitude: '55.790000', longitude: '49.120000', batteryLevel: 40, status: 'free', type: 'Велосипед', pricePerMinute: 3 },
            { id: 'mock3', latitude: '55.805000', longitude: '49.115000', batteryLevel: 95, status: 'free', type: 'Электровелосипед', pricePerMinute: 4 },
          ]);
        }
      } catch (error) {
        console.error('App.js: Network error fetching vehicles, using mock data:', error);
        setVehicles([
          { id: 'mock1', latitude: '55.796127', longitude: '49.106414', batteryLevel: 80, status: 'free', type: 'Электросамокат', pricePerMinute: 5 },
          { id: 'mock2', latitude: '55.790000', longitude: '49.120000', batteryLevel: 40, status: 'free', type: 'Велосипед', pricePerMinute: 3 },
          { id: 'mock3', latitude: '55.805000', longitude: '49.115000', batteryLevel: 95, status: 'free', type: 'Электровелосипед', pricePerMinute: 4 },
        ]);
      }
    };
    fetchVehiclesData();
  }, []);

  // Effect to handle vehicle selection from VehicleSelector (via context)
  useEffect(() => {
    if (selectedVehicleType && vehicles.length > 0) {
      const firstMatchingVehicle = vehicles.find(v => {
        const vehicleTypeEnglish = mapVehicleTypeToEnglishGlobal(v.type);
        return vehicleTypeEnglish.toLowerCase() === selectedVehicleType.toLowerCase();
      });

      if (firstMatchingVehicle) {
        // Only update if slider isn't already showing this or if type changed
        if (!sliderVehicle || mapVehicleTypeToEnglishGlobal(sliderVehicle.type).toLowerCase() !== selectedVehicleType.toLowerCase()) {
            setSliderVehicle(firstMatchingVehicle);
        }
      }
    } else if (!selectedVehicleType) {
        // If selectedVehicleType is null (e.g. deselected or slider closed), ensure slider is also closed.
        // This is mainly handled by handleCloseSlider, but this effect acts as a sync.
        if (sliderVehicle) {
            // setSliderVehicle(null); // This line might cause issues if sliderVehicle is set by placemark click directly.
                                  // handleCloseSlider is the primary way to close it.
        }
    }
  }, [selectedVehicleType, vehicles, sliderVehicle]); // sliderVehicle is included to prevent re-setting if already set by map click

  const handleCloseSlider = () => {
    setSliderVehicle(null);
    setSelectedVehicleType(null); 
  };

  // This function is passed to MapView for direct placemark clicks
  const handlePlacemarkSelect = (vehicle) => {
    setSliderVehicle(vehicle);
    // Also update the selectedVehicleType in context to keep VehicleSelector in sync
    const englishType = mapVehicleTypeToEnglishGlobal(vehicle.type);
    if (englishType && selectedVehicleType !== englishType) {
        setSelectedVehicleType(englishType);
    }
  };

  return (
    <div className="app-container">
      <Header />
      {/* Pass all vehicles and the placemark select handler to MapView */}
      <MapView
        vehicles={vehicles}
        setSliderVehicle={handlePlacemarkSelect}
      />
      {/* Conditionally render the slider */}
      {sliderVehicle ? (
        <VehicleDetailSlider
          vehicle={sliderVehicle}
          onClose={handleCloseSlider}
        />
      ) : (
        <VehicleSelector />
      )}
      <RideButton />
    </div>
  );
}

// Original App component now wraps AppContent with the Provider
function App() {
  return (
    <VehicleProvider>
      <AppContent />
    </VehicleProvider>
  );
}

export default App;

