import { useEffect, useState } from "react";
import "./CSS/weather.css";

const API_KEY = "ddf790bfc6568bddb64d0be20664f6f9";

const WeatherApp = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [favWeather, setFavWeather] = useState([]);
  const [error, setError] = useState("");

  // Load favorites from localStorage on start
  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(storedFavorites);
  }, []);

  // Save favorites whenever they change
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Fetch Indian city suggestions while typing
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

  // Fetch weather for a city
  const fetchWeather = async (cityName) => {
    if (!cityName.trim()) return;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName},IN&appid=${API_KEY}&units=metric`
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

  // Add/remove favorites
  const toggleFavorite = (cityName) => {
    if (favorites.includes(cityName)) {
      const updated = favorites.filter((c) => c !== cityName);
      setFavorites(updated);
    } else {
      setFavorites([...favorites, cityName]);
    }
  };

  // Fetch weather for all favorites
  useEffect(() => {
    const fetchFavoritesWeather = async () => {
      const data = await Promise.all(
        favorites.map(async (cityName) => {
          try {
            const res = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?q=${cityName},IN&appid=${API_KEY}&units=metric`
            );
            return await res.json();
          } catch {
            return null;
          }
        })
      );
      setFavWeather(data.filter(Boolean));
    };
    if (favorites.length > 0) fetchFavoritesWeather();
    else setFavWeather([]);
  }, [favorites]);

  return (
    <div className="weather-container">
      <h2 className="title">🌤️ Weather App</h2>

      {/* Search box */}
      <div className="search-box">
        <div className="dropdown-wrapper">
          <input
            type="text"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            placeholder="Enter Indian city..."
            onKeyDown={(e) => e.key === "Enter" && fetchWeather(city)}
          />
          {suggestions.length > 0 && (
            <ul className="dropdown">
              {suggestions.map((item, index) => (
                <li
                  key={index}
                  onClick={() => {
                    setCity(item.name);
                    fetchWeather(item.name);
                    setSuggestions([]);
                  }}
                >
                  {item.name}, {item.state ? `${item.state}, ` : ""}India
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={() => fetchWeather(city)}>Get Weather</button>
      </div>

      {error && <p className="error">{error}</p>}

      {/* Weather Card */}
      {weather && (
        <div className="weather-card">
          <h2>
            {weather.name}, {weather.sys?.country}
          </h2>
          <p>🌡️ Temp: {weather.main?.temp}°C</p>
          <p>💧 Humidity: {weather.main?.humidity}%</p>
          <p>👁️ Visibility: {(weather.visibility / 1000).toFixed(1)} km</p>
          <p>🌬️ Wind: {weather.wind?.speed} m/s</p>
          <p>
            ☁️ Condition:{" "}
            {weather.weather && weather.weather[0]?.description
              ? weather.weather[0].description
              : ""}
          </p>
          <button
            className={
              favorites.includes(weather.name) ? "remove-btn" : "add-btn"
            }
            onClick={() => toggleFavorite(weather.name)}
          >
            {favorites.includes(weather.name)
              ? "Remove from Favorites"
              : "Add to Favorites"}
          </button>
        </div>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <>
          <h3 className="fav-title">⭐ Favorite Cities</h3>
          <div className="card-container">
            {favWeather.map((f, i) => (
              <div key={i} className="weather-card small">
                <h2>
                  {f.name}, {f.sys?.country}
                </h2>
                <p>🌡️ Temp: {f.main?.temp}°C</p>
                <p>💧 Humidity: {f.main?.humidity}%</p>
                <p>👁️ Visibility: {(f.visibility / 1000).toFixed(1)} km</p>
                <p>🌬️ Wind: {f.wind?.speed} m/s</p>
                <button
                  className="remove-btn"
                  onClick={() => toggleFavorite(f.name)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherApp;
