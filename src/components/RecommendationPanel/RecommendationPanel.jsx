import { Umbrella, Wind, Shirt, AlertTriangle, CheckCircle } from 'lucide-react';
import '../css/RecommendationPanel.css';

export default function RecommendationPanel({ recommendations }) {
  if (!recommendations) {
    return null;
  }

  const getItemIcon = (item) => {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('umbrella')) return '☔';
    if (itemLower.includes('mask')) return '😷';
    if (itemLower.includes('sunglasses')) return '🕶️';
    if (itemLower.includes('water')) return '💧';
    if (itemLower.includes('sunscreen')) return '🧴';
    return '📌';
  };

  return (
    <div className="recommendation-panel">
      <h2>
        <CheckCircle size={24} />
        오늘의 추천 사항
      </h2>

      {recommendations.alerts && recommendations.alerts.length > 0 && (
        <div className="recommendation-section alerts">
          <h3>
            <AlertTriangle size={20} />
            기상 경보
          </h3>
          <div className="alert-list">
            {recommendations.alerts.map((alert, idx) => (
              <div key={idx} className="alert-item">
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.items && recommendations.items.length > 0 && (
        <div className="recommendation-section items">
          <h3>
            <Umbrella size={20} />
            잊지 말고 가져가세요
          </h3>
          <div className="items-grid">
            {recommendations.items.map((item, idx) => (
              <div key={idx} className="item-card">
                <span className="item-icon">{getItemIcon(item)}</span>
                <span className="item-text">{item.replace(/[☔😷🕶️💧🧴]/g, '').trim()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.clothing && recommendations.clothing.length > 0 && (
        <div className="recommendation-section clothing">
          <h3>
            <Shirt size={20} />
            추천 의류
          </h3>
          <ul className="clothing-list">
            {recommendations.clothing.map((cloth, idx) => (
              <li key={idx}>{cloth}</li>
            ))}
          </ul>
        </div>
      )}

      {!recommendations.alerts?.length &&
       !recommendations.items?.length &&
       !recommendations.clothing?.length && (
        <div className="no-recommendations">
          <p>날씨가 좋아 보이네요! 오늘은 특별한 추천이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
