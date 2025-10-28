import React, { useState, useEffect } from "react";
import "./weather.css";

const API_KEY = "ddf790bfc6568bddb64d0be20664f6f9";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Fetch weather
  const fetchWeather = async () => {
    if (!city.trim()) return;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      setWeather(data);
      setError("");
    } catch (err) {
      setError("City not found. Try another one.");
      setWeather(null);
    }
  };

  // Handle input + fetch Indian city suggestions
  const handleCityChange = async (value) => {
    setCity(value);
    if (value.length > 2) {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${value},IN&limit=5&appid=${API_KEY}`
        );
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error(err);
      }
    } else {
      setSuggestions([]);
    }
  };

  const addFavorite = (name) => {
    if (!favorites.includes(name)) {
      setFavorites([...favorites, name]);
    }
  };

  return (
    <div className="weather-container">
      <div className="header">
        <h2>🌤️ Weather App</h2>
        <button className="login-btn">Login</button>
      </div>

      <div className="search-container">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Enter Indian city name..."
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
          />
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
                  {item.name}, {item.state ? `${item.state}, ` : ""}India
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={fetchWeather}>Get Weather</button>
      </div>

      {error && <div className="error">{error}</div>}

      {weather && (
        <div className="weather-results">
          <div className="weather-card">
            <div className="card-header">
              <h3>{weather.name}</h3>
              <button
                className="favorite-btn"
                onClick={() => addFavorite(weather.name)}
              >
                ★
              </button>
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt="icon"
            />
            <p className="main-type">{weather.weather[0].main}</p>
            <p>🌡️ {weather.main.temp.toFixed(1)}°C</p>
            <p>💧 {weather.main.humidity}% Humidity</p>
            <p>🌬️ {weather.wind.speed} m/s Wind</p>
          </div>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="favorites-section">
          <h3>⭐ Favorite Cities</h3>
          <div className="favorites-list">
            {favorites.map((f, i) => (
              <div key={i} className="favorite-item">
                {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
