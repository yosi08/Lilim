/**
 * AI Service for generating weather-based recommendations
 * Note: This uses a simple rule-based system. For production, you can integrate with Claude API
 */

export const aiService = {
  /**
   * Generate recommendations based on weather and schedule
   * @param {Object} weather - Weather data
   * @param {Object} schedule - User's schedule for the day
   * @param {Object} airQuality - Air quality data
   * @returns {Object} Recommendations
   */
  generateRecommendations(weather, schedule, airQuality = null) {
    const recommendations = {
      items: [],
      clothing: [],
      alerts: [],
      summary: ''
    };

    const temp = weather.main?.temp || 20;
    const weatherCondition = weather.weather?.[0]?.main?.toLowerCase() || '';
    const description = weather.weather?.[0]?.description || '';
    const humidity = weather.main?.humidity || 0;
    const windSpeed = weather.wind?.speed || 0;

    // Temperature-based recommendations
    if (temp < 10) {
      recommendations.clothing.push('Heavy coat or jacket');
      recommendations.clothing.push('Warm layers');
      recommendations.alerts.push('⚠️ Cold weather - dress warmly!');
    } else if (temp < 20) {
      recommendations.clothing.push('Light jacket or sweater');
    } else if (temp > 30) {
      recommendations.clothing.push('Light, breathable clothing');
      recommendations.alerts.push('🌡️ Hot weather - stay hydrated!');
      recommendations.items.push('Water bottle');
    }

    // Weather condition recommendations
    if (weatherCondition.includes('rain') || weatherCondition.includes('drizzle')) {
      recommendations.items.push('☔ Umbrella');
      recommendations.items.push('Raincoat or waterproof jacket');
      recommendations.alerts.push('🌧️ Rain expected - bring an umbrella!');
    }

    if (weatherCondition.includes('snow')) {
      recommendations.items.push('❄️ Winter boots');
      recommendations.items.push('Umbrella');
      recommendations.alerts.push('❄️ Snow expected - drive carefully!');
    }

    if (weatherCondition.includes('thunderstorm')) {
      recommendations.alerts.push('⚡ Thunderstorm warning - stay safe indoors if possible!');
    }

    // Air quality recommendations
    if (airQuality) {
      const aqi = airQuality.list?.[0]?.main?.aqi || 1;
      if (aqi >= 3) {
        recommendations.items.push('😷 Face mask (poor air quality)');
        recommendations.alerts.push('🌫️ Poor air quality - wear a mask outdoors!');
      } else if (aqi >= 2) {
        recommendations.items.push('😷 Face mask (moderate air quality)');
      }
    }

    // Wind recommendations
    if (windSpeed > 10) {
      recommendations.alerts.push('💨 Strong winds expected!');
    }

    // Humidity recommendations
    if (humidity > 80) {
      recommendations.alerts.push('💧 High humidity - may feel muggy');
    }

    // UV/Sun recommendations
    if (weatherCondition.includes('clear') && temp > 20) {
      recommendations.items.push('🕶️ Sunglasses');
      recommendations.items.push('Sunscreen');
      recommendations.alerts.push('☀️ Sunny day - protect your skin!');
    }

    // Generate summary
    recommendations.summary = this.generateSummary(weather, recommendations, schedule);

    return recommendations;
  },

  /**
   * Generate a natural language summary
   */
  generateSummary(weather, recommendations, schedule) {
    const temp = Math.round(weather.main?.temp || 20);
    const condition = weather.weather?.[0]?.description || 'partly cloudy';
    const scheduleInfo = schedule ? ` You have ${schedule.length} event(s) scheduled.` : '';

    let summary = `Today will be ${condition} with a temperature of ${temp}°C.${scheduleInfo}`;

    if (recommendations.items.length > 0) {
      summary += ` Don't forget to bring: ${recommendations.items.slice(0, 3).join(', ')}.`;
    }

    return summary;
  },

  /**
   * Analyze schedule and weather for optimal planning
   */
  analyzeScheduleWithWeather(schedule, forecast) {
    const analysis = [];

    schedule.forEach(event => {
      const eventTime = new Date(event.time);
      const matchingForecast = forecast.list?.find(f => {
        const forecastTime = new Date(f.dt * 1000);
        return Math.abs(forecastTime - eventTime) < 3 * 60 * 60 * 1000; // Within 3 hours
      });

      if (matchingForecast) {
        const weather = matchingForecast.weather[0].main.toLowerCase();
        const temp = Math.round(matchingForecast.main.temp);

        analysis.push({
          event: event.title,
          time: event.time,
          weather: matchingForecast.weather[0].description,
          temp: temp,
          recommendation: this.getEventRecommendation(weather, temp)
        });
      }
    });

    return analysis;
  },

  /**
   * Get specific recommendation for an event based on weather
   */
  getEventRecommendation(weather, temp) {
    if (weather.includes('rain')) {
      return 'Bring an umbrella and leave a few minutes early';
    }
    if (temp < 10) {
      return 'Dress warmly and allow extra time for travel';
    }
    if (temp > 30) {
      return 'Stay hydrated and seek shade when possible';
    }
    return 'Weather looks good for your event';
  }
};
