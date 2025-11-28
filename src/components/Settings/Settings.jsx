import { X, User, Bell, Moon, Globe, Shield, Webhook } from 'lucide-react';
import { useState, useEffect } from 'react';
import '../css/Settings.css';

function Settings({ onClose, darkMode, onDarkModeToggle }) {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookStatus, setWebhookStatus] = useState('');

  useEffect(() => {
    const savedWebhookUrl = localStorage.getItem('webhookUrl');
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    }
  }, []);

  const handleSaveWebhook = () => {
    if (webhookUrl.trim()) {
      localStorage.setItem('webhookUrl', webhookUrl);
      setWebhookStatus('웹훅 URL이 저장되었습니다.');
      setTimeout(() => setWebhookStatus(''), 3000);
    } else {
      setWebhookStatus('유효한 URL을 입력해주세요.');
      setTimeout(() => setWebhookStatus(''), 3000);
    }
  };

  return (
    <div className="settings-overlay">
      <div className="settings-container">
        <div className="settings-header">
          <h2>설정</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          <section className="settings-section">
            <div className="section-header">
              <User size={20} />
              <h3>계정</h3>
            </div>
            <div className="setting-item">
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                Value=""
                disabled
              />
            </div>
            <div className="setting-item">
              <label htmlFor="name">이름</label>
              <input
                type="text"
                id="name"
                placeholder="이름을 입력하세요"
              />
            </div>
            <button className="save-btn">변경 사항 저장</button>
          </section>

          <section className="settings-section">
            <div className="section-header">
              <Webhook size={20} />
              <h3>웹훅 설정</h3>
            </div>
            <div className="setting-item">
              <label htmlFor="webhookUrl">디스코드 웹훅 URL</label>
              <input
                type="text"
                id="webhookUrl"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
              />
              <p className="toggle-description">
                날씨 및 일정 알림을 받을 디스코드 웹훅 URL을 입력하세요
              </p>
              {webhookStatus && (
                <p className={`webhook-status ${webhookStatus.includes('저장') ? 'success' : 'error'}`}>
                  {webhookStatus}
                </p>
              )}
            </div>
            <button className="save-btn" onClick={handleSaveWebhook}>
              웹훅 URL 저장
            </button>
          </section>
          <section className="Requirements-settings-section">
            <div className="section-header">
              <Shield size={20} />
              <h3>요구사항</h3>
            </div>
            <div className="setting-item">
              <label htmlFor="allergies">요구사항 항목</label>
              <input
                type="text"
                id="Requirements"
              />
            </div>
            <button className="save-btn">변경 사항 저장</button>
          </section>

          <section className="settings-section">
            <div className="section-header">
              <Moon size={20} />
              <h3>테마</h3>
            </div>
            <div className="setting-item toggle-item">
              <div className="toggle-label">
                <span>다크 모드</span>
                <p className="toggle-description">어두운 테마로 전환</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={onDarkModeToggle}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </section>

          <section className="settings-section">
            <div className="section-header">
              <Bell size={20} />
              <h3>알림</h3>
            </div>
            <div className="setting-item toggle-item">
              <div className="toggle-label">
                <span>날씨 알림</span>
                <p className="toggle-description">중요한 날씨 변화 알림</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="setting-item toggle-item">
              <div className="toggle-label">
                <span>일정 알림</span>
                <p className="toggle-description">일정 시작 전 알림</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </section>

          <section className="settings-section">
            <div className="section-header">
              <Globe size={20} />
              <h3>지역 설정</h3>
            </div>
            <div className="setting-item">
              <label htmlFor="language">언어</label>
              <select id="language">
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="ja">日本語</option>
                <option value="cn">中国话 </option>
              </select>
            </div>
            <div className="setting-item">
              <label htmlFor="timezone">시간대</label>
              <select id="timezone">
                <option value="Asia/Seoul">서울 (GMT+9)</option>
                <option value="Asia/Tokyo">도쿄 (GMT+9)</option>
                <option value="America/New_York">뉴욕 (GMT-5)</option>
              </select>
            </div>
          </section>

          <section className="settings-section">
            <div className="section-header">
              <Shield size={20} />
              <h3>개인정보 및 보안</h3>
            </div>
            <div className="setting-item toggle-item">
              <div className="toggle-label">
                <span>위치 정보 사용</span>
                <p className="toggle-description">정확한 날씨 정보를 위해 위치 사용</p>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <button className="danger-btn">계정 삭제</button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Settings;

