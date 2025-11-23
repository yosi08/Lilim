import axios from 'axios';

export const webhookService = {
  /**
   * Send data to webhook URL
   * @param {string} webhookUrl - Discord webhook URL
   * @param {Object} data - Data to send
   * @returns {Promise}
   */
  async sendToWebhook(webhookUrl, data) {
    if (!webhookUrl) {
      throw new Error('Webhook URL is required');
    }

    try {
      const response = await axios.post(webhookUrl, data);
      console.log('Data sent to webhook successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending data to webhook:', error);
      throw error;
    }
  },

  /**
   * Send weather notification to Discord webhook
   * @param {string} webhookUrl - Discord webhook URL
   * @param {Object} weather - Weather data
   * @param {Object} recommendations - AI recommendations
   * @returns {Promise}
   */
  async sendWeatherNotification(webhookUrl, weather, recommendations) {
    const temp = Math.round(weather.main?.temp || 0);
    const condition = weather.weather?.[0]?.description || 'unknown';
    const location = weather.name || 'Unknown location';

    const fields = [
      {
        name: '🌡️ 온도',
        value: `${temp}°C`,
        inline: true
      },
      {
        name: '💧 습도',
        value: `${weather.main?.humidity || 0}%`,
        inline: true
      },
      {
        name: '💨 풍속',
        value: `${weather.wind?.speed || 0} m/s`,
        inline: true
      }
    ];

    if (recommendations?.items?.length > 0) {
      fields.push({
        name: '📋 준비물',
        value: recommendations.items.join('\n') || '없음',
        inline: false
      });
    }

    if (recommendations?.clothing?.length > 0) {
      fields.push({
        name: '👔 옷차림',
        value: recommendations.clothing.join('\n'),
        inline: false
      });
    }

    if (recommendations?.alerts?.length > 0) {
      fields.push({
        name: '⚠️ 알림',
        value: recommendations.alerts.join('\n'),
        inline: false
      });
    }

    const embedData = {
      embeds: [{
        title: `🌤️ 날씨 알림 - ${location}`,
        description: `현재 날씨: ${condition}`,
        color: this.getColorForWeather(weather.weather?.[0]?.main),
        fields: fields,
        timestamp: new Date().toISOString()
      }]
    };

    return this.sendToWebhook(webhookUrl, embedData);
  },

  /**
   * Send schedule notification to Discord webhook
   * @param {string} webhookUrl - Discord webhook URL
   * @param {Array} schedule - Schedule data
   * @returns {Promise}
   */
  async sendScheduleNotification(webhookUrl, schedule) {
    const today = new Date().toLocaleDateString('ko-KR');

    const embedData = {
      embeds: [{
        title: `📅 오늘의 일정 - ${today}`,
        description: schedule.length > 0 ? `오늘 ${schedule.length}개의 일정이 있습니다.` : '오늘은 일정이 없습니다.',
        color: 3447003,
        fields: schedule.slice(0, 10).map(event => ({
          name: event.title || '제목 없음',
          value: `시간: ${new Date(event.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}\n${event.description || ''}`,
          inline: false
        })),
        timestamp: new Date().toISOString()
      }]
    };

    return this.sendToWebhook(webhookUrl, embedData);
  },

  /**
   * Send simple message to Discord webhook
   * @param {string} webhookUrl - Discord webhook URL
   * @param {string} content - Message content
   * @returns {Promise}
   */
  async sendMessage(webhookUrl, content) {
    return this.sendToWebhook(webhookUrl, { content });
  },

  /**
   * Get color code based on weather condition
   * @param {string} weatherMain - Main weather condition
   * @returns {number} Color as decimal
   */
  getColorForWeather(weatherMain) {
    const colors = {
      'Clear': 16776960,
      'Clouds': 8421504,
      'Rain': 2067276,
      'Drizzle': 3447003,
      'Thunderstorm': 10181046,
      'Snow': 16777215,
      'Mist': 12632256,
      'Smoke': 6316128,
      'Haze': 15658734,
      'Dust': 13882323,
      'Fog': 12632256,
      'Sand': 15653280,
      'Ash': 6316128,
      'Squall': 2123412,
      'Tornado': 8388608
    };

    return colors[weatherMain] || 5814783;
  }
};
