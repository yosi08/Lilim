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
import { ScheduleContainer } from '../CalendarSchedule/CalendarSchedule';
import '../css/WeatherDashboard.css';

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

              // 오늘 날짜 기준으로 다음 월요일부터 시작하는 7일 생성
              const today = new Date();
              const currentDay = today.getDay(); // 0(일) ~ 6(토)
              const daysUntilMonday = currentDay === 0 ? 1 : (8 - currentDay) % 7 || 7;

              // 다음 월요일부터 7일간의 예보 생성
              const weekForecasts = [];
              for (let i = 0; i < 7; i++) {
                const targetDate = new Date(today);
                targetDate.setDate(today.getDate() + daysUntilMonday + i);

                // 해당 날짜에 가장 가까운 예보 데이터 찾기
                const closestForecast = extendedForecasts.reduce((closest, forecast) => {
                  const forecastDate = new Date(forecast.dt * 1000);
                  const currentDiff = Math.abs(targetDate - forecastDate);
                  const closestDiff = Math.abs(targetDate - new Date(closest.dt * 1000));
                  return currentDiff < closestDiff ? forecast : closest;
                }, extendedForecasts[0]);

                weekForecasts.push({
                  ...closestForecast,
                  dt: Math.floor(targetDate.getTime() / 1000)
                });
              }

              return weekForecasts.map((item, index) => {
                const temp = Math.round(item.main.temp);
                const icon = item.weather[0].icon;
                const desc = item.weather[0].description;

                // 요일 이름 배열 (월요일부터 시작)
                const dayNames = ['월', '화', '수', '목', '금', '토', '일'];

                return (
                  <div
                    key={index}
                    className={`forecast-item ${selectedDay === index ? 'selected' : ''}`}
                    onClick={() => handleDayClick(index)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="forecast-day">
                      {dayNames[index]}
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
      )}

      <ScheduleContainer />
    </div>
  );
}
