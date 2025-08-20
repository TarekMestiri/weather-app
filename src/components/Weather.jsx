import React, { useEffect, useRef, useState } from "react";
import "./Weather.css";
import search_icon from "../assets/search.png";
import clear_icon from "../assets/clear.png";
import cloud_icon from "../assets/cloud.png";
import drizzle_icon from "../assets/drizzle.png";
import humidity_icon from "../assets/humidity.png";
import rain_icon from "../assets/rain.png";
import snow_icon from "../assets/snow.png";
import wind_icon from "../assets/wind.png";
import mist_icon from "../assets/mist.png";
import thunderstorm_icon from "../assets/thunder.png";
import cloudy_night_icon from "../assets/cloudy-night.png";
import night_icon from "../assets/night.png";
import rain_night_icon from "../assets/rain-night.png";
import thunder_night_icon from "../assets/thunder-night.png";
import ramadan_moon_icon from "../assets/ramadhan-moon.png";
import day_bg from "../assets/day-bg.jpg";
import night_bg from "../assets/night-bg.jpg";

const Weather = () => {
  const inputRef = useRef(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState("day");
  const [unit, setUnit] = useState("metric");
  const [isRamadan, setIsRamadan] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState("");

  // Check if current date is during Ramadan (approximate calculation)
  const checkRamadan = () => {
    const today = new Date();
    const year = today.getFullYear();
    
    // Approximate Ramadan dates (Islamic calendar is lunar, so these are estimates)
    const ramadanDates = {
      2023: { start: new Date(year, 2, 22), end: new Date(year, 3, 21) },
      2024: { start: new Date(year, 2, 10), end: new Date(year, 3, 9) },
      2025: { start: new Date(year, 2, 1), end: new Date(year, 2, 30) },
      2026: { start: new Date(year, 2, 20), end: new Date(year, 3, 19) }
    };
    
    if (ramadanDates[year]) {
      const { start, end } = ramadanDates[year];
      setIsRamadan(today >= start && today <= end);
    } else {
      setIsRamadan(false);
    }
  };

  const allIcons = {
    // Day icons
    "01d": clear_icon,
    "02d": cloud_icon,
    "03d": drizzle_icon,
    "04d": drizzle_icon,
    "09d": rain_icon,
    "10d": rain_icon,
    "11d": thunderstorm_icon,
    "13d": snow_icon,
    "50d": mist_icon,
    
    // Night icons
    "01n": night_icon,
    "02n": cloudy_night_icon,
    "03n": drizzle_icon,
    "04n": drizzle_icon,
    "09n": rain_night_icon,
    "10n": rain_night_icon,
    "11n": thunder_night_icon,
    "13n": snow_icon,
    "50n": mist_icon,
  };

  const search = async (city) => {
    if (!city || city.trim() === "") {
      setError("Please enter a city name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${
        import.meta.env.VITE_APP_ID
      }`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`City "${city}" not found`);
        }
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      // Determine if it's day or night
      const now = Math.floor(Date.now() / 1000);
      const isDayTime = now > data.sys.sunrise && now < data.sys.sunset;
      const time = isDayTime ? "day" : "night";
      setTimeOfDay(time);
      
      // Set background image based on time of day
      setBackgroundImage(time === "day" ? day_bg : night_bg);

      const icon = allIcons[data.weather[0]?.icon] || clear_icon;
      const newWeatherData = {
        humidity: data.main?.humidity || 0,
        windSpeed: data.wind?.speed || 0,
        temperature: Math.floor(data.main?.temp) || 0,
        feelsLike: Math.floor(data.main?.feels_like) || 0,
        location: data.name || "Unknown",
        country: data.sys?.country || "",
        description: data.weather[0]?.description || "",
        icon: icon,
        pressure: data.main?.pressure || 0,
        visibility: data.visibility ? data.visibility / 1000 : 0,
        sunrise: data.sys?.sunrise,
        sunset: data.sys?.sunset,
      };
      
      setWeatherData(newWeatherData);
      
      // Add to recent searches
      const searchItem = `${data.name}, ${data.sys.country}`;
      setRecentSearches(prev => {
        const filtered = prev.filter(item => item !== searchItem);
        return [searchItem, ...filtered].slice(0, 5);
      });
      
    } catch (error) {
      console.error("Search error:", error);
      setError(error.message || "Failed to fetch weather data");
      setWeatherData(null);
    } finally {
      setLoading(false);
      setShowRecent(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      search(inputRef.current?.value);
    }
  };

  const toggleUnit = () => {
    setUnit(prev => prev === "metric" ? "imperial" : "metric");
  };

  const getTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    if (weatherData) {
      search(weatherData.location);
    }
  }, [unit]);

  useEffect(() => {
    checkRamadan();
    
    // Load recent searches from localStorage
    const savedSearches = localStorage.getItem('recentWeatherSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    
    // Set initial background (day as default)
    setBackgroundImage(day_bg);
    
    // Get user's location if they allow it
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${import.meta.env.VITE_APP_ID}`)
            .then(response => response.json())
            .then(data => {
              if (data.name) {
                search(data.name);
              }
            })
            .catch(error => {
              console.error("Geolocation error:", error);
              search("London");
            });
        },
        (error) => {
          console.error("Geolocation permission denied:", error);
          search("London");
        }
      );
    } else {
      search("London");
    }
  }, []);

  useEffect(() => {
    // Save recent searches to localStorage
    localStorage.setItem('recentWeatherSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  return (
    <div 
      className={`weather ${timeOfDay}`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="weather-overlay"></div>
      
      <div className="weather-content-wrapper">
        <div className="weather-header">
          <h1>Weather App</h1>
          <button className="unit-toggle" onClick={toggleUnit}>
            °{unit === "metric" ? "C" : "F"}
          </button>
        </div>
        
        {/* Ramadan Moon Icon - Only show during Ramadan at night */}
        {isRamadan && timeOfDay === "night" && (
          <div className="ramadan-moon">
            <img src={ramadan_moon_icon} alt="Ramadan Moon" />
            <span>Ramadan Mubarak</span>
          </div>
        )}
        
        <div className="search-container">
          <div className="search">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter city name"
              onKeyPress={handleKeyPress}
              onFocus={() => setShowRecent(true)}
              onBlur={() => setTimeout(() => setShowRecent(false), 200)}
            />
            <img
              src={search_icon}
              alt="search"
              onClick={() => search(inputRef.current?.value)}
            />
          </div>
          
          {showRecent && recentSearches.length > 0 && (
            <div className="recent-searches">
              {recentSearches.map((city, index) => (
                <div 
                  key={index} 
                  className="recent-item"
                  onClick={() => {
                    const cityName = city.split(",")[0];
                    inputRef.current.value = cityName;
                    search(cityName);
                  }}
                >
                  {city}
                </div>
              ))}
            </div>
          )}
        </div>

        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading weather data...</p>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <p>{error}</p>
            <button onClick={() => setError("")}>Dismiss</button>
          </div>
        )}
        
        {weatherData && (
          <div className="weather-content">
            <div className="weather-main">
              <img src={weatherData.icon} alt="weather icon" className="weather-icon" />
              <p className="temperature">{weatherData.temperature}°{unit === "metric" ? "C" : "F"}</p>
              <p className="feels-like">Feels like {weatherData.feelsLike}°{unit === "metric" ? "C" : "F"}</p>
              <p className="location">{weatherData.location}, {weatherData.country}</p>
              <p className="description">{weatherData.description}</p>
            </div>
            
            <div className="weather-details">
              <div className="detail-card">
                <img src={humidity_icon} alt="humidity" />
                <div className="detail-info">
                  <p className="detail-value">{weatherData.humidity}%</p>
                  <span className="detail-label">Humidity</span>
                </div>
              </div>
              
              <div className="detail-card">
                <img src={wind_icon} alt="wind" />
                <div className="detail-info">
                  <p className="detail-value">{weatherData.windSpeed} {unit === "metric" ? "km/h" : "mph"}</p>
                  <span className="detail-label">Wind Speed</span>
                </div>
              </div>
              
              <div className="detail-card">
                <div className="detail-icon">↗</div>
                <div className="detail-info">
                  <p className="detail-value">{weatherData.pressure} hPa</p>
                  <span className="detail-label">Pressure</span>
                </div>
              </div>
              
              <div className="detail-card">
                <div className="detail-icon">👁</div>
                <div className="detail-info">
                  <p className="detail-value">{weatherData.visibility} km</p>
                  <span className="detail-label">Visibility</span>
                </div>
              </div>
              
              {weatherData.sunrise && (
                <div className="detail-card">
                  <div className="detail-icon">🌅</div>
                  <div className="detail-info">
                    <p className="detail-value">{getTime(weatherData.sunrise)}</p>
                    <span className="detail-label">Sunrise</span>
                  </div>
                </div>
              )}
              
              {weatherData.sunset && (
                <div className="detail-card">
                  <div className="detail-icon">🌇</div>
                  <div className="detail-info">
                    <p className="detail-value">{getTime(weatherData.sunset)}</p>
                    <span className="detail-label">Sunset</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Weather;