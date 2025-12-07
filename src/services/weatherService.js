import axios from 'axios';
import { apiService } from './apiService';

// Mock data for demo mode
const MOCK_WEATHER = {
  coord: { lon: -122.4194, lat: 37.7749 },
  weather: [{ id: 500, main: 'Rain', description: 'light rain', icon: '10d' }],
  base: 'stations',
  main: {
    temp: 18,
    feels_like: 17,
    temp_min: 16,
    temp_max: 20,
    pressure: 1013,
    humidity: 75
  },
  visibility: 10000,
  wind: { speed: 4.5, deg: 270 },
  clouds: { all: 60 },
  dt: Math.floor(Date.now() / 1000),
  sys: { country: 'US', sunrise: 1697544000, sunset: 1697587200 },
  timezone: -25200,
  id: 5391959,
  name: 'San Francisco',
  cod: 200
};

const MOCK_FORECAST = {
  cod: '200',
  message: 0,
  cnt: 56,
  list: Array.from({ length: 56 }, (_, i) => ({
    dt: Math.floor(Date.now() / 1000) + i * 10800,
    main: {
      temp: 18 + Math.sin(i / 3) * 5,
      feels_like: 17 + Math.sin(i / 3) * 5,
      temp_min: 16 + Math.sin(i / 3) * 5,
      temp_max: 20 + Math.sin(i / 3) * 5,
      pressure: 1013,
      humidity: 70 + Math.random() * 20
    },
    weather: [
      {
        id: i % 3 === 0 ? 500 : i % 3 === 1 ? 800 : 801,
        main: i % 3 === 0 ? 'Rain' : i % 3 === 1 ? 'Clear' : 'Clouds',
        description: i % 3 === 0 ? 'light rain' : i % 3 === 1 ? 'clear sky' : 'few clouds',
        icon: i % 3 === 0 ? '10d' : i % 3 === 1 ? '01d' : '02d'
      }
    ],
    clouds: { all: Math.random() * 100 },
    wind: { speed: 3 + Math.random() * 3, deg: 270 },
    visibility: 10000,
    pop: Math.random(),
    dt_txt: new Date(Date.now() + i * 10800000).toISOString()
  }))
};

const MOCK_AIR_QUALITY = {
  coord: { lon: -122.4194, lat: 37.7749 },
  list: [
    {
      main: { aqi: 2 },
      components: {
        co: 230,
        no: 0.1,
        no2: 15,
        o3: 60,
        so2: 5,
        pm2_5: 12,
        pm10: 20,
        nh3: 1
      },
      dt: Math.floor(Date.now() / 1000)
    }
  ]
};

// Helper function to convert WMO weather codes to descriptions
function getWeatherDescription(code) {
  const weatherCodes = {
    0: 'Clear',
    1: 'Mainly Clear',
    2: 'Partly Cloudy',
    3: 'Cloudy',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Light Showers',
    81: 'Showers',
    82: 'Heavy Showers',
    85: 'Light Snow Showers',
    86: 'Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with Hail',
    99: 'Thunderstorm with Hail'
  };
  return weatherCodes[code] || 'Unknown';
}

// Helper function to convert WMO weather codes to icons
function getWeatherIcon(code) {
  if (code === 0) return '01d';
  if (code === 1 || code === 2) return '02d';
  if (code === 3) return '03d';
  if (code === 45 || code === 48) return '50d';
  if (code >= 51 && code <= 55) return '09d';
  if (code >= 61 && code <= 65) return '10d';
  if (code >= 71 && code <= 77) return '13d';
  if (code >= 80 && code <= 82) return '09d';
  if (code >= 85 && code <= 86) return '13d';
  if (code >= 95) return '11d';
  return '01d';
}

export const weatherService = {
  /**
   * Get current weather for a location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Weather data
   */
  async getCurrentWeather(lat, lon) {
    try {
      // Use Open-Meteo API (free, no API key required)
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m',
          timezone: 'auto'
        }
      });

      // Convert Open-Meteo data to OpenWeatherMap format
      const data = response.data;
      return {
        coord: { lon: lon, lat: lat },
        weather: [{
          id: data.current.weather_code,
          main: getWeatherDescription(data.current.weather_code),
          description: getWeatherDescription(data.current.weather_code).toLowerCase(),
          icon: getWeatherIcon(data.current.weather_code)
        }],
        main: {
          temp: data.current.temperature_2m,
          feels_like: data.current.apparent_temperature,
          humidity: data.current.relative_humidity_2m,
          pressure: 1013,
          temp_min: data.current.temperature_2m - 2,
          temp_max: data.current.temperature_2m + 2
        },
        wind: {
          speed: data.current.wind_speed_10m,
          deg: data.current.wind_direction_10m
        },
        clouds: { all: 50 },
        dt: Math.floor(Date.now() / 1000),
        name: 'Current Location'
      };
    } catch (error) {
      console.error('Error fetching current weather:', error);
      // Fallback to mock data on error
      return MOCK_WEATHER;
    }
  },

  /**
   * Get 7-day weather forecast
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Forecast data
   */
  async getForecast(lat, lon) {
    console.log('getForecast called with lat:', lat, 'lon:', lon);

    // If user is logged in, use backend API for personalized forecast
    if (apiService.isAuthenticated()) {
      try {
        const backendForecast = await apiService.getForecast(lat, lon);
        console.log('Got forecast from backend:', backendForecast);
        console.log('Backend forecast type:', typeof backendForecast);
        console.log('Backend forecast has list?', backendForecast?.list);
        console.log('Backend forecast list length:', backendForecast?.list?.length);

        // Check if backend forecast has the correct format
        if (backendForecast && backendForecast.list && backendForecast.list.length > 0) {
          return backendForecast;
        } else {
          console.warn('Backend forecast format invalid, falling back to Open-Meteo');
        }
      } catch (error) {
        console.error('Error fetching personalized forecast from backend, falling back to Open-Meteo:', error);
      }
    }

    // Use Open-Meteo API
    try {
      console.log('Fetching forecast from Open-Meteo API...');
      const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
        params: {
          latitude: lat,
          longitude: lon,
          hourly: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
          daily: 'weather_code,temperature_2m_max,temperature_2m_min',
          timezone: 'auto',
          forecast_days: 7
        }
      });

      console.log('Open-Meteo API response:', response.data);
      const data = response.data;

      // Convert to OpenWeatherMap forecast format
      const list = [];
      for (let i = 0; i < Math.min(56, data.hourly.time.length); i += 1) {
        list.push({
          dt: new Date(data.hourly.time[i]).getTime() / 1000,
          main: {
            temp: data.hourly.temperature_2m[i],
            feels_like: data.hourly.temperature_2m[i],
            temp_min: data.hourly.temperature_2m[i] - 2,
            temp_max: data.hourly.temperature_2m[i] + 2,
            pressure: 1013,
            humidity: data.hourly.relative_humidity_2m[i]
          },
          weather: [{
            id: data.hourly.weather_code[i],
            main: getWeatherDescription(data.hourly.weather_code[i]),
            description: getWeatherDescription(data.hourly.weather_code[i]).toLowerCase(),
            icon: getWeatherIcon(data.hourly.weather_code[i])
          }],
          clouds: { all: 50 },
          wind: {
            speed: data.hourly.wind_speed_10m[i],
            deg: 0
          },
          visibility: 10000,
          pop: 0.3,
          dt_txt: data.hourly.time[i]
        });
      }

      const forecastResult = {
        cod: '200',
        message: 0,
        cnt: list.length,
        list: list
      };

      console.log('Converted forecast result:', forecastResult);
      console.log('Forecast list length:', list.length);

      return forecastResult;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      console.log('Returning mock forecast');
      return MOCK_FORECAST;
    }
  },

  /**
   * Get air quality data
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Air quality data
   */
  async getAirQuality(lat, lon) {
    try {
      // Use Open-Meteo Air Quality API
      const response = await axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
        params: {
          latitude: lat,
          longitude: lon,
          current: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone',
          timezone: 'auto'
        }
      });

      const data = response.data.current;

      // Calculate AQI based on PM2.5 (simplified)
      let aqi = 1;
      if (data.pm2_5 > 50) aqi = 5;
      else if (data.pm2_5 > 35) aqi = 4;
      else if (data.pm2_5 > 25) aqi = 3;
      else if (data.pm2_5 > 12) aqi = 2;

      return {
        coord: { lon: lon, lat: lat },
        list: [{
          main: { aqi: aqi },
          components: {
            co: data.carbon_monoxide || 0,
            no: 0,
            no2: data.nitrogen_dioxide || 0,
            o3: data.ozone || 0,
            so2: data.sulphur_dioxide || 0,
            pm2_5: data.pm2_5 || 0,
            pm10: data.pm10 || 0,
            nh3: 0
          },
          dt: Math.floor(Date.now() / 1000)
        }]
      };
    } catch (error) {
      console.error('Error fetching air quality:', error);
      return MOCK_AIR_QUALITY;
    }
  },

  /**
   * Get user's current location
   * @returns {Promise<{lat: number, lon: number}>}
   */
  async getCurrentLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported, using default location');
        resolve({ lat: 37.5665, lon: 126.9780 }); // Seoul, Korea
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Error getting location, using default:', error);
          resolve({ lat: 37.5665, lon: 126.9780 }); // Seoul, Korea
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }
};
