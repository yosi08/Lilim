import axios from 'axios';

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || 'demo';
const WEATHER_API_BASE = 'https://api.openweathermap.org/data/2.5';
const USE_DEMO_MODE = WEATHER_API_KEY === 'demo';

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
  dt: Date.now() / 1000,
  sys: { country: 'US', sunrise: 1697544000, sunset: 1697587200 },
  timezone: -25200,
  id: 5391959,
  name: 'San Francisco',
  cod: 200
};

const MOCK_FORECAST = {
  cod: '200',
  message: 0,
  cnt: 40,
  list: Array.from({ length: 40 }, (_, i) => ({
    dt: Date.now() / 1000 + i * 10800,
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
      dt: Date.now() / 1000
    }
  ]
};

export const weatherService = {
  /**
   * Get current weather for a location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Weather data
   */
  async getCurrentWeather(lat, lon) {
    if (USE_DEMO_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_WEATHER), 500));
    }

    try {
      const response = await axios.get(`${WEATHER_API_BASE}/weather`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching current weather:', error);
      throw error;
    }
  },

  /**
   * Get 5-day weather forecast
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Forecast data
   */
  async getForecast(lat, lon) {
    if (USE_DEMO_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_FORECAST), 500));
    }

    try {
      const response = await axios.get(`${WEATHER_API_BASE}/forecast`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY,
          units: 'metric'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  },

  /**
   * Get air quality data
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise} Air quality data
   */
  async getAirQuality(lat, lon) {
    if (USE_DEMO_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_AIR_QUALITY), 500));
    }

    try {
      const response = await axios.get(`${WEATHER_API_BASE}/air_pollution`, {
        params: {
          lat,
          lon,
          appid: WEATHER_API_KEY
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching air quality:', error);
      throw error;
    }
  },

  /**
   * Get user's current location
   * @returns {Promise<{lat: number, lon: number}>}
   */
  async getCurrentLocation() {
    if (USE_DEMO_MODE) {
      return new Promise((resolve) => setTimeout(() => resolve({ lat: 37.7749, lon: -122.4194 }), 500));
    }

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
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
          reject(error);
        }
      );
    });
  }
};
