import React, { useState, useEffect } from 'react';
import axios from 'axios';
import themeIcon from './assets/dark.png'; 

function App() {
  const [data, setData] = useState({});
  const [forecast, setForecast] = useState([]);
  const [location, setLocation] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('searchHistory')) || []);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  const apiKey = '7b59385a4352b38f673425056d555759';

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = theme; 
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const fetchWeatherData = async (city) => {
    try {
      const [weatherRes, forecastRes] = await Promise.all([
        axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`),
        axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`),
      ]);
      setData(weatherRes.data);
      setForecast(forecastRes.data.list.filter((item, index) => index % 8 === 0)); 
    } catch (err) {
      alert('City not found!');
    }
  };

  const searchLocation = (event) => {
    if (event.key === 'Enter') {
      fetchWeatherData(location);
      setCurrentCity(location);
      setHistory((prev) => {
        const updated = [location, ...prev.filter((city) => city.toLowerCase() !== location.toLowerCase())];
        return updated.slice(0, 5);
      });
      setLocation('');
    }
  };

  const handleHistoryClick = (city) => {
    fetchWeatherData(city);
    setCurrentCity(city);
    setHistory((prev) => {
      const updated = [city, ...prev.filter((item) => item.toLowerCase() !== city.toLowerCase())];
      return updated.slice(0, 5);
    });
  };

  const handleRefresh = () => {
    if (currentCity) {
      fetchWeatherData(currentCity);
    }
  };

  return (
    <div className={`app ${theme}`}>
      {}
      <img
        src={themeIcon}
        alt="Toggle Theme"
        className="theme-icon"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      />

      <div className="search">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onKeyPress={searchLocation}
          placeholder="Enter Location"
          type="text"
        />

        <div className="history">
          {history.map((city, index) => (
            <button key={index} onClick={() => handleHistoryClick(city)}>
              {city}
            </button>
          ))}
        </div>
      </div>

      {}
      {currentCity && (
        <div className="refresh-section">
          <button onClick={handleRefresh} className="refresh-btn">
            🔄Refresh
          </button>
        </div>
      )}

      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp">
            {data.main ? <h1>{data.main.temp.toFixed()}°F</h1> : null}
          </div>
          <div className="description">
            {data.weather ? <p>{data.weather[0].main}</p> : null}
          </div>
        </div>

        {data.name && (
          <div className="bottom">
            <div className="feels">
              {data.main && <p className="bold">{data.main.feels_like.toFixed()}°F</p>}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main && <p className="bold">{data.main.humidity}%</p>}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind && <p className="bold">{data.wind.speed.toFixed()} MPH</p>}
              <p>Wind Speed</p>
            </div>
          </div>
        )}

        {forecast.length > 0 && (
          <div className="forecast">
            <h2>5-Day Forecast</h2>
            <div className="forecast-cards">
              {forecast.map((item, index) => (
                <div key={index} className="forecast-card">
                  <p>{new Date(item.dt_txt).toLocaleDateString()}</p>
                  <p>{item.main.temp.toFixed()}°F</p>
                  <p>{item.weather[0].main}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
