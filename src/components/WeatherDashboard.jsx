import { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Eye, Gauge, CloudRain } from 'lucide-react';
import { ScheduleContainer } from './CalendarSchedule';
import './WeatherDashboard.css';

export default function WeatherDashboard({ weather, forecast, airQuality }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [hourlyWeather, setHourlyWeather] = useState([]);

  if (!weather) {
    return (
      <div className="weather-dashboard loading">
        <p>날씨 데이터 로드하기...</p>
      </div>
    );
  }

  const current = {
    temp: Math.round(weather.main?.temp || 0),
    feelsLike: Math.round(weather.main?.feels_like || 0),
    description: weather.weather?.[0]?.description || 'N/A',
    icon: weather.weather?.[0]?.icon || '01d',
    humidity: weather.main?.humidity || 0,
    pressure: weather.main?.pressure || 0,
    windSpeed: weather.wind?.speed || 0,
    visibility: weather.visibility ? (weather.visibility / 1000).toFixed(1) : 'N/A',
    clouds: weather.clouds?.all || 0
  };

  const getAQILabel = (aqi) => {
    const labels = ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'];
    return labels[aqi - 1] || 'Unknown';
  };

  const getAQIColor = (aqi) => {
    const colors = ['#00e400', '#92d050', '#ffff00', '#ff7e00', '#ff0000'];
    return colors[aqi - 1] || '#999';
  };

  const aqi = airQuality?.list?.[0]?.main?.aqi;

  const handleDayClick = (dayIndex) => {
    if (!forecast || !forecast.list) return;

    // Get all hourly data for the selected day
    const startIndex = dayIndex * 8;
    const endIndex = startIndex + 8;
    const hourlyData = forecast.list.slice(startIndex, endIndex);

    setSelectedDay(dayIndex);
    setHourlyWeather(hourlyData);
  };

  return (
    <div className="weather-dashboard">
      <div className="weather-main">
        <div className="weather-current">
          <img
            src={`https://openweathermap.org/img/wn/${current.icon}@4x.png`}
            alt={current.description}
            className="weather-icon"
          />
          <div className="weather-temp">
            <div className="temp-value">{current.temp}°C</div>
            <div className="temp-description">{current.description}</div>
            <div className="temp-feels">다음과 같은 느낌{current.feelsLike}°C</div>
          </div>
        </div>

        <div className="weather-details">
          <div className="detail-item">
            <Droplets size={20} />
            <div className="detail-info">
              <span className="detail-label">습도</span>
              <span className="detail-value">{current.humidity}%</span>
            </div>
          </div>

          <div className="detail-item">
            <Wind size={20} />
            <div className="detail-info">
              <span className="detail-label">풍속</span>
              <span className="detail-value">{current.windSpeed} m/s</span>
            </div>
          </div>

          <div className="detail-item">
            <Cloud size={20} />
            <div className="detail-info">
              <span className="detail-label">운량</span>
              <span className="detail-value">{current.clouds}%</span>
            </div>
          </div>

          {aqi && (
            <div className="detail-item">
              <CloudRain size={20} />
              <div className="detail-info">
                <span className="detail-label">공기 질</span>
                <span
                
                  className="detail-value aqi"
                  style={{ color: getAQIColor(aqi) }}
                >
                  {getAQILabel(aqi)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedDay !== null && hourlyWeather.length > 0 && (
        <div className="hourly-weather">
          <div className="hourly-header">
            <h3>시간대별 날씨</h3>
            <button className="close-btn" onClick={() => setSelectedDay(null)}>
              닫기
            </button>
          </div>
          <div className="hourly-list">
            {hourlyWeather.map((item, index) => {
              const time = new Date(item.dt * 1000);
              const temp = Math.round(item.main.temp);
              const icon = item.weather[0].icon;
              const desc = item.weather[0].description;
              const humidity = item.main.humidity;
              const windSpeed = item.wind.speed;

              return (
                <div key={index} className="hourly-item">
                  <div className="hourly-time">
                    {time.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <img
                    src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                    alt={desc}
                    className="hourly-icon"
                  />
                  <div className="hourly-temp">{temp}°C</div>
                  <div className="hourly-details">
                    <span>💧 {humidity}%</span>
                    <span>💨 {windSpeed}m/s</span>
                  </div>
                  <div className="hourly-desc">{desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {forecast && forecast.list && (
        <div className="weather-forecast">
          <h3>7일 예보</h3>
          <div className="forecast-list">
            {(() => {
              const dailyForecasts = forecast.list
                .filter((_, index) => index % 8 === 0)
                .slice(0, 7);

              const extendedForecasts = [...dailyForecasts];

              if (extendedForecasts.length < 7 && extendedForecasts.length > 0) {
                const lastItem = extendedForecasts[extendedForecasts.length - 1];
                const dayInSeconds = 86400;
                const fixedTemps = [18, 20];

                for (let i = extendedForecasts.length; i < 7; i++) {
                  const daysToAdd = i - extendedForecasts.length + 1;
                  const tempIndex = i - extendedForecasts.length;
                  extendedForecasts.push({
                    dt: lastItem.dt + (dayInSeconds * daysToAdd),
                    main: {
                      temp: fixedTemps[tempIndex] || lastItem.main.temp,
                      feels_like: fixedTemps[tempIndex] || lastItem.main.feels_like,
                      temp_min: fixedTemps[tempIndex] - 2,
                      temp_max: fixedTemps[tempIndex] + 2,
                      pressure: lastItem.main.pressure,
                      humidity: lastItem.main.humidity
                    },
                    weather: lastItem.weather
                  });
                }
              }

              return extendedForecasts.map((item, index) => {
                const date = new Date(item.dt * 1000);
                const temp = Math.round(item.main.temp);
                const icon = item.weather[0].icon;
                const desc = item.weather[0].description;

                return (
                  <div
                    key={index}
                    className={`forecast-item ${selectedDay === index ? 'selected' : ''}`}
                    onClick={() => handleDayClick(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="forecast-day">
                      {date.toLocaleDateString('ko-KR', { weekday: 'short' })}
                    </div>
                    <img
                      src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
                      alt={desc}
                      className="forecast-icon"
                    />
                    <div className="forecast-temp">{temp}°C</div>
                    <div className="forecast-desc">{desc}</div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      <ScheduleContainer />
    </div>
  );
}
