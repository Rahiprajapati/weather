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
        `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&units=metric&appid=${API_KEY}`
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

  // Fetch Indian city suggestions only
  const fetchSuggestions = async (value) => {
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${value},IN&limit=10&appid=${API_KEY}`
      );
      const data = await res.json();
      // Filter only Indian cities (country === "IN")
      const indianCities = data.filter((item) => item.country === "IN");
      setSuggestions(indianCities);
    } catch {
      setSuggestions([]);
    }
  };

  return (
    <div className="weather-container">
      <h2 className="app-title">🌤️ India Weather Finder</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search Indian city..."
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
                {item.state ? `, ${item.state}` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <h3>
            {weather.name}, {weather.sys.country}
          </h3>
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
