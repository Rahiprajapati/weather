import React, { useEffect, useState } from "react";
import "./CSS/weather.css";

const Weather = () => {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const API_KEY = "ddf790bfc6568bddb64d0be20664f6f9";

  // Load saved data
  useEffect(() => {
    const loggedInStatus = localStorage.getItem("weatherAppLoggedIn");
    const savedUsername = localStorage.getItem("weatherAppUsername");

    if (loggedInStatus === "true" && savedUsername) {
      setIsLoggedIn(true);
      setCurrentUser(savedUsername);
      const savedWeatherData = JSON.parse(localStorage.getItem("weatherData") || "[]");
      setWeatherData(savedWeatherData);
      loadUserFavorites(savedUsername);
    }

    const savedTheme = localStorage.getItem("weatherAppTheme");
    if (savedTheme === "dark") {
      setIsDarkTheme(true);
      document.body.classList.add("dark-theme");
    }
  }, []);

  const loadUserFavorites = (username) => {
    const allUserFavorites = JSON.parse(localStorage.getItem("allUserFavorites") || "{}");
    const userFavorites = allUserFavorites[username] || [];
    setFavorites(userFavorites);
  };

  const saveUserFavorites = (username, userFavorites) => {
    const allUserFavorites = JSON.parse(localStorage.getItem("allUserFavorites") || "{}");
    allUserFavorites[username] = userFavorites;
    localStorage.setItem("allUserFavorites", JSON.stringify(allUserFavorites));
  };

  useEffect(() => {
    if (isLoggedIn && weatherData.length > 0) {
      localStorage.setItem("weatherData", JSON.stringify(weatherData));
    }
  }, [weatherData, isLoggedIn]);

  const fetchWeather = async () => {
    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setError(null);

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${API_KEY}&units=metric`
      );

      if (!response.ok) throw new Error("City not found or not in India.");

      const data = await response.json();

      const cityExists = weatherData.some((item) => item.name === data.name);
      if (!cityExists) {
        const newData = [...weatherData, data];
        setWeatherData(newData);
        if (isLoggedIn) localStorage.setItem("weatherData", JSON.stringify(newData));
      }

      setCity("");
      setSuggestions([]);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchCitySuggestions = async (query) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query},IN&limit=5&appid=${API_KEY}`
      );
      const data = await response.json();
      const indianCities = data.filter((item) => item.country === "IN");
      setSuggestions(indianCities);
    } catch {
      setSuggestions([]);
    }
  };

  const handleLogin = () => {
    if (username && password) {
      setIsLoggedIn(true);
      setCurrentUser(username);
      localStorage.setItem("weatherAppLoggedIn", "true");
      localStorage.setItem("weatherAppUsername", username);
      setShowLogin(false);
      loadUserFavorites(username);
      setUsername("");
      setPassword("");
    } else {
      setError("Please enter both username and password");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser("");
    localStorage.setItem("weatherAppLoggedIn", "false");
    localStorage.removeItem("weatherAppUsername");
    setFavorites([]);
  };

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    if (!isDarkTheme) {
      document.body.classList.add("dark-theme");
      localStorage.setItem("weatherAppTheme", "dark");
    } else {
      document.body.classList.remove("dark-theme");
      localStorage.setItem("weatherAppTheme", "light");
    }
  };

  const toggleFavorite = (cityData) => {
    if (!isLoggedIn || !currentUser) return;

    const isFavorite = favorites.some((fav) => fav.name === cityData.name);

    const newFavorites = isFavorite
      ? favorites.filter((fav) => fav.name !== cityData.name)
      : [...favorites, cityData];

    setFavorites(newFavorites);
    saveUserFavorites(currentUser, newFavorites);
  };

  const getWeatherBasedTheme = (weatherType) => {
    if (!weatherType) return {};
    const weatherLower = weatherType.toLowerCase();
    if (weatherLower.includes("rain") || weatherLower.includes("drizzle"))
      return { backgroundColor: "#607d8b", color: "#fff" };
    if (weatherLower.includes("cloud"))
      return { backgroundColor: "#90a4ae", color: "#fff" };
    if (weatherLower.includes("clear"))
      return { backgroundColor: "#4fc3f7", color: "#fff" };
    if (weatherLower.includes("snow"))
      return { backgroundColor: "#e0e0e0", color: "#333" };
    if (weatherLower.includes("storm"))
      return { backgroundColor: "#455a64", color: "#fff" };
    return {};
  };

  const getActivitySuggestions = (weatherType, temp) => {
    if (!weatherType) return [];
    const lower = weatherType.toLowerCase();
    if (lower.includes("clear") && temp > 20)
      return ["Beach visit", "Hiking", "Outdoor dining"];
    if (lower.includes("cloud")) return ["Cafe hopping", "Shopping", "Museum visit"];
    if (lower.includes("rain")) return ["Movie", "Indoor games", "Art galleries"];
    if (lower.includes("snow")) return ["Skiing", "Hot chocolate", "Photography"];
    return ["Explore local places", "Relax indoors"];
  };

  return (
    <div className={`weather-container ${isDarkTheme ? "dark-theme" : "light-theme"}`}>
      <div className="header">
        <h2>🌤 Weather App</h2>
        <div className="header-controls">
          <button className="theme-toggle" onClick={toggleTheme}>
            {isDarkTheme ? "☀️ Light" : "🌙 Dark"}
          </button>

          {!isLoggedIn ? (
            <div className="auth-buttons">
              <button onClick={() => setShowLogin(true)}>Login</button>
            </div>
          ) : (
            <div className="user-actions">
              <div className="user-info">
                <span>Welcome, {currentUser}</span>
                {favorites.length > 0 && (
                  <span className="favorites-count">{favorites.length} ❤️</span>
                )}
              </div>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Enter Indian city name..."
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            fetchCitySuggestions(e.target.value);
          }}
          onKeyPress={(e) => e.key === "Enter" && fetchWeather()}
        />
        <button onClick={fetchWeather}>Get Weather</button>

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
                {item.name} {item.state ? `(${item.state})` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {showLogin && (
        <div className="auth-modal">
          <h3>Login</h3>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="modal-buttons">
            <button onClick={handleLogin}>Login</button>
            <button onClick={() => setShowLogin(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="weather-results">
        {weatherData.map((weather, index) => {
          const weatherType = weather.weather[0].main;
          const weatherTheme = getWeatherBasedTheme(weatherType);
          const activitySuggestions = getActivitySuggestions(weatherType, weather.main.temp);
          const isFavorite = favorites.some((fav) => fav.name === weather.name);

          return (
            <div key={index} className="weather-card" style={weatherTheme}>
              <div className="card-header">
                <h3>
                  {weather.name}, {weather.sys.country}
                </h3>
                {isLoggedIn && (
                  <button className="favorite-btn" onClick={() => toggleFavorite(weather)}>
                    {isFavorite ? "★" : "☆"}
                  </button>
                )}
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                alt={weather.weather[0].description}
              />
              <p>🌡 Temp: {weather.main.temp}°C</p>
              <p>🌤 Type: {weatherType}</p>
              <p>💧 Humidity: {weather.main.humidity}%</p>
              <p>💨 Wind: {weather.wind.speed} m/s</p>
              <div className="suggestions">
                <h4>Activities:</h4>
                <ul>
                  {activitySuggestions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Weather;
