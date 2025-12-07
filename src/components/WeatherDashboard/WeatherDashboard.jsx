import { useState, useEffect } from 'react';
import {
  Cloud,
  Droplets,
  Wind,
  Eye,
  Gauge,
  CloudRain,
  Sun,
  CloudSun,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Moon,
  CloudMoon
} from 'lucide-react';
import './WeatherDashboard.css';

export default function WeatherDashboard({ weather, forecast, airQuality }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const [hourlyWeather, setHourlyWeather] = useState([]);

  // 날씨 코드에 따른 아이콘 매핑
  const getWeatherIcon = (iconCode, size = 80) => {
    const iconProps = {
      size,
      strokeWidth: 1.5,
      className: 'weather-icon-svg'
    };

    // OpenWeatherMap 아이콘 코드 분석
    const code = iconCode?.substring(0, 2);
    const isNight = iconCode?.endsWith('n');

    switch (code) {
      case '01': // Clear sky
        return isNight ? <Moon {...iconProps} /> : <Sun {...iconProps} />;
      case '02': // Few clouds
        return isNight ? <CloudMoon {...iconProps} /> : <CloudSun {...iconProps} />;
      case '03': // Scattered clouds
      case '04': // Broken clouds
        return <Cloud {...iconProps} />;
      case '09': // Shower rain
        return <CloudDrizzle {...iconProps} />;
      case '10': // Rain
        return <CloudRain {...iconProps} />;
      case '11': // Thunderstorm
        return <CloudLightning {...iconProps} />;
      case '13': // Snow
        return <CloudSnow {...iconProps} />;
      case '50': // Mist/Fog
        return <CloudFog {...iconProps} />;
      default:
        return <CloudSun {...iconProps} />;
    }
  };

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
    windSpeed: Math.round(weather.wind?.speed || 0),
    visibility: weather.visibility ? Math.round(weather.visibility / 1000) : 'N/A',
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
          <div className="weather-icon">
            {getWeatherIcon(current.icon, 120)}
          </div>
          <div className="weather-temp">
            <div className="temp-value">{current.temp}°C</div>
            <div className="temp-description">{current.description}</div>
            <div className="temp-feels">다음과 같은 느낌 {current.feelsLike}°C</div>
          </div>
        </div>

        <div className="weather-details">
          <div className="detail-item">
            <Droplets size={28} />
            <div className="detail-info">
              <span className="detail-label">습도</span>
              <span className="detail-value">{current.humidity}%</span>
            </div>
          </div>

          <div className="detail-item">
            <Wind size={28} />
            <div className="detail-info">
              <span className="detail-label">풍속</span>
              <span className="detail-value">{current.windSpeed} m/s</span>
            </div>
          </div>

          <div className="detail-item">
            <Cloud size={28} />
            <div className="detail-info">
              <span className="detail-label">운량</span>
              <span className="detail-value">{current.clouds}%</span>
            </div>
          </div>

          {aqi && (
            <div className="detail-item">
              <CloudRain size={28} />
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
              const humidity = Math.round(item.main.humidity);
              const windSpeed = Math.round(item.wind.speed);
              const rain = item.rain ? Math.round(item.rain['3h'] || item.rain['1h'] || 0) : 0;

              return (
                <div key={index} className="hourly-item">
                  <div className="hourly-time">
                    {time.getHours()}시
                  </div>
                  <div className="hourly-icon">
                    {getWeatherIcon(icon, 40)}
                  </div>
                  <div className="hourly-temp">{temp}°C</div>
                  <div className="hourly-details">
                    <span><Droplets size={12} /> {humidity}%</span>
                    <span><Wind size={12} /> {windSpeed}m/s</span>
                    {rain > 0 && <span><CloudRain size={12} /> {rain}mm</span>}
                  </div>
                  <div className="hourly-desc">{desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="weather-forecast">
        <h3>7일 예보</h3>
        <div className="forecast-list">
          {(() => {
            console.log('Forecast data:', forecast);

            if (!forecast || !forecast.list || forecast.list.length === 0) {
              console.log('No forecast data available');
              return <p>예보 데이터를 불러올 수 없습니다.</p>;
            }

            console.log('Forecast list length:', forecast.list.length);

            // 하루에 하나씩 선택 (3시간 간격 * 8 = 24시간)
            const dailyForecasts = [];
            for (let i = 0; i < Math.min(7, forecast.list.length); i += 1) {
              const index = i * 8;
              if (index < forecast.list.length) {
                dailyForecasts.push(forecast.list[index]);
              }
            }

            console.log('Daily forecasts:', dailyForecasts);

            // 7일이 안 되면 마지막 데이터로 채우기
            while (dailyForecasts.length < 7 && dailyForecasts.length > 0) {
              const lastItem = dailyForecasts[dailyForecasts.length - 1];
              dailyForecasts.push({
                ...lastItem,
                dt: lastItem.dt + 86400 // 하루 추가
              });
            }

            const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

            return dailyForecasts.map((item, index) => {
              const date = new Date(item.dt * 1000);
              const temp = Math.round(item.main.temp);
              const icon = item.weather[0].icon;
              const desc = item.weather[0].description;
              const dayName = dayNames[date.getDay()];

              return (
                <div
                  key={index}
                  className={`forecast-item ${selectedDay === index ? 'selected' : ''}`}
                  onClick={() => handleDayClick(index)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="forecast-day">
                    {index === 0 ? '오늘' : dayName}
                  </div>
                  <div className="forecast-icon">
                    {getWeatherIcon(icon, 48)}
                  </div>
                  <div className="forecast-temp">{temp}°C</div>
                  <div className="forecast-desc">{desc}</div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
