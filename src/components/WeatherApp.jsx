import React, { useState } from "react";
import "./Weather.css";

const API_KEY = "YOUR_OPENWEATHERMAP_API_KEY";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  // Fetch weather details
  const fetchWeather = async () => {
    if (!city) return;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);
      setSuggestions([]);
      setError("");
    } catch (err) {
      setError(err.message);
      setWeather(null);
    }
  };

  // Fetch suggestions
  const fetchSuggestions = async (value) => {
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${API_KEY}`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  };

  return (
    <div className="weather-container">
      <h2 className="app-title">🌤️ Weather Finder</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search for a city..."
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
        />
        <button onClick={fetchWeather}>Search</button>

        {suggestions.length > 0 && (
          <ul className="suggestion-list">
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  setCity(item.name);
                  setSuggestions([]);
                }}
              >
                {item.name}
                {item.state ? `, ${item.state}` : ""}, {item.country}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <h3>{weather.name}, {weather.sys.country}</h3>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt="Weather Icon"
          />
          <h2>{Math.round(weather.main.temp)}°C</h2>
          <p className="description">{weather.weather[0].description}</p>
          <div className="details">
            <p>💨 Wind: {weather.wind.speed} m/s</p>
            <p>💧 Humidity: {weather.main.humidity}%</p>
            <p>🌡️ Feels like: {Math.round(weather.main.feels_like)}°C</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
