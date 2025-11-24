import { useState, useEffect } from 'react';
import { weatherService } from './services/weatherService';
import { aiService } from './services/aiService';
import WeatherDashboard from './components/WeatherDashboard';
import CalendarSchedule from './components/CalendarSchedule';
import NotificationPanel from './components/NotificationPanel';
import RecommendationPanel from './components/RecommendationPanel';
import DarkModeToggle from './components/DarkModeToggle';
import Login from './components/Login';
import Signup from './components/Signup';
import Settings from './components/Settings';
import { CloudSun, User, Settings as SettingsIcon } from 'lucide-react';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (isLoggedIn) {
      loadWeatherData();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (weather) {
      const recs = aiService.generateRecommendations(weather, schedule, airQuality);
      setRecommendations(recs);
    }
  }, [weather, schedule, airQuality]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfile && !event.target.closest('.profile-icon') && !event.target.closest('.profile-panel')) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfile]);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user location
      const location = await weatherService.getCurrentLocation();

      // Fetch weather data in parallel
      const [weatherData, forecastData, airQualityData] = await Promise.all([
        weatherService.getCurrentWeather(location.lat, location.lon),
        weatherService.getForecast(location.lat, location.lon),
        weatherService.getAirQuality(location.lat, location.lon).catch(() => null)
      ]);

      setWeather(weatherData);
      setForecast(forecastData);
      setAirQuality(airQualityData);
    } catch (err) {
      console.error('Error loading weather data:', err);
      setError('Failed to load weather data. Please check your location permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (newSchedule) => {
    setSchedule(newSchedule);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowProfile(false);
    setWeather(null);
    setForecast(null);
    setAirQuality(null);
    setRecommendations(null);
    setSchedule([]);
  };

  if (!isLoggedIn) {
    if (showSignup) {
      return <Signup onBackToLogin={() => setShowSignup(false)} />;
    }
    return <Login onSignupClick={() => setShowSignup(true)} onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  if (loading) {
    return (
      <div className={`app loading-screen ${darkMode ? 'dark-mode' : ''}`}>
        <div className="sun"></div>
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
        <div className="cloud cloud4"></div>
        <div className="cloud cloud5"></div>
        <div className="cloud cloud6"></div>
        <div className="cloud cloud7"></div>
        <div className="cloud cloud8"></div>
        <div className="cloud cloud9"></div>
        <div className="cloud cloud10"></div>
        <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
        <CloudSun size={64} className="loading-icon" />
        <h2>날씨 데이터 로드하기...</h2>
        <p>위치 접근을 허용해 주세요</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`app error-screen ${darkMode ? 'dark-mode' : ''}`}>
        <div className="sun"></div>
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
        <div className="cloud cloud4"></div>
        <div className="cloud cloud5"></div>
        <div className="cloud cloud6"></div>
        <div className="cloud cloud7"></div>
        <div className="cloud cloud8"></div>
        <div className="cloud cloud9"></div>
        <div className="cloud cloud10"></div>
        <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
        <h2>날씨를 로드할 수 없음</h2>
        <p>{error}</p>
        <button onClick={loadWeatherData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="sun"></div>
      <div className="cloud cloud1"></div>
      <div className="cloud cloud2"></div>
      <div className="cloud cloud3"></div>
      <div className="cloud cloud4"></div>
      <div className="cloud cloud5"></div>
      <div className="cloud cloud6"></div>
      <div className="cloud cloud7"></div>
      <div className="cloud cloud8"></div>
      <div className="cloud cloud9"></div>
      <div className="cloud cloud10"></div>
      <header className="app-header">
        <div className="profile-icon" onClick={toggleProfile}>
          <User size={32} />
        </div>
        {showProfile && (
          <div className="profile-panel">
            <div className="profile-header">
              <div className="profile-avatar">
                <User size={48} />
              </div>
              <h3>사용자 프로필</h3>
            </div>
            <div className="profile-info">
              <p><strong>이메일:</strong> 이메일이 들어가겟지.</p>
            </div>
            <div className="profile-actions">
              <button className="settings-btn" onClick={() => { setShowSettings(true); setShowProfile(false); }}>
                <SettingsIcon size={18} />
                설정
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </div>
        )}
        <div className="header-content">
          <h1>
            <CloudSun size={32} />
            에이아이 날씨 서비스
          </h1>
          <p>당신의 지적인 날씨 동반자</p>
        </div>
        <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
      </header>

      <main className="app-main">
        <div className="main-grid">
          <div className="weather-section">
            <WeatherDashboard
              weather={weather}
              forecast={forecast}
              airQuality={airQuality}
            />
          </div>

          <div className="recommendations-section">
            <RecommendationPanel recommendations={recommendations} />
            <NotificationPanel
              recommendations={recommendations}
              weather={weather}
            />
          </div>
        </div>

        <div className="calendar-section">
          <CalendarSchedule onScheduleChange={handleScheduleChange} />
        </div>
      </main>

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          darkMode={darkMode}
          onDarkModeToggle={toggleDarkMode}
        />
      )}
    </div>
  );
}

export default App;
