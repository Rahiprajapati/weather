

import React, { useState, useEffect } from "react";
import "../components/CSS/weather.css";

const indianCities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
  "Kolkata", "Pune", "Jaipur", "Surat", "Lucknow", "Nagpur", "Indore",
  "Bhopal", "Vadodara", "Patna", "Ludhiana", "Agra", "Nashik", "Rajkot"
];

const WeatherApp = () => {
  const [selectedCity, setSelectedCity] = useState("");
  const [addedCities, setAddedCities] = useState([]);
  const [weatherData, setWeatherData] = useState({});
  const [currentWeather, setCurrentWeather] = useState(null);

  const apiKey = "ddf790bfc6568bddb64d0be20664f6f9"; // Replace with your OpenWeather API key

  // Load saved cities from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("addedCities")) || [];
    setAddedCities(saved);
  }, []);

  // Fetch weather for saved cities
  useEffect(() => {
    if (addedCities.length > 0) {
      addedCities.forEach(async (city) => {
        const data = await fetchWeather(city);
        if (data) {
          setWeatherData((prev) => ({ ...prev, [city]: data }));
        }
      });
    }
  }, [addedCities]);

  // Helper function to fetch weather
  const fetchWeather = async (city) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric`
      );
      const data = await res.json();
      if (data.cod === 200) return data;
      return null;
    } catch (err) {
      console.error("Error fetching weather:", err);
      return null;
    }
  };

  // Fetch current selected city
  const handleGetWeather = async () => {
    if (!selectedCity) return;
    const data = await fetchWeather(selectedCity);
    setCurrentWeather(data);
  };

  // Add selected city to favorites
  const handleAddCity = () => {
    if (!selectedCity || addedCities.includes(selectedCity)) return;
    const newCities = [...addedCities, selectedCity];
    setAddedCities(newCities);
    localStorage.setItem("addedCities", JSON.stringify(newCities));
    setWeatherData((prev) => ({ ...prev, [selectedCity]: currentWeather }));
    setCurrentWeather(null);
  };

  // Remove city from favorites
  const handleRemoveCity = (city) => {
    const updated = addedCities.filter((c) => c !== city);
    setAddedCities(updated);
    localStorage.setItem("addedCities", JSON.stringify(updated));
    setWeatherData((prev) => {
      const copy = { ...prev };
      delete copy[city];
      return copy;
    });
  };

  return (
    <div className="weather-container">
      <div className="weather-box">
        <h2 className="weather-title">🌤️ Indian Weather Dashboard</h2>

        <div className="controls">
          <select
            className="city-dropdown"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="">Select a City</option>
            {indianCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <button className="get-btn" onClick={handleGetWeather}>
            Get Weather
          </button>
        </div>

        {/* Show preview card before adding */}
        {currentWeather && (
          <div className="city-card preview">
            <h3>{currentWeather.name}</h3>
            <p>🌡️ Temp: {currentWeather.main.temp}°C</p>
            <p>💧 Humidity: {currentWeather.main.humidity}%</p>
            <p>🌬️ Wind: {currentWeather.wind.speed} m/s</p>
            <p>👁️ Visibility: {currentWeather.visibility / 1000} km</p>
            <button className="add-btn" onClick={handleAddCity}>
              Add
            </button>
          </div>
        )}

        {/* City cards grid */}
        <div className="city-list">
          {addedCities.length === 0 ? (
            <p className="empty">No saved cities 🌧️</p>
          ) : (
            addedCities.map((city) => {
              const data = weatherData[city];
              return (
                <div key={city} className="city-card">
                  <h3>{city}</h3>
                  {data ? (
                    <>
                      <p>🌡️ Temp: {data.main.temp}°C</p>
                      <p>💧 Humidity: {data.main.humidity}%</p>
                      <p>🌬️ Wind: {data.wind.speed} m/s</p>
                      <p>👁️ Visibility: {data.visibility / 1000} km</p>
                    </>
                  ) : (
                    <p>Loading...</p>
                  )}
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveCity(city)}
                  >
                    Remove
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
