import './Login.css';

function Login({ onSignupClick, onLoginSuccess }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess();
  };

  return (
    <div className="login-container">
      <div className="clouds">
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="cloud cloud3"></div>
        <div className="cloud cloud4"></div>
        <div className="cloud cloud5"></div>
      </div>

      <div className="login-box">
        <h1>어서오세요</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">사용자이름</label>
            <input type="text" id="username" name="username" />
          </div>

          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input type="password" id="password" name="password" />
          </div>

          <div className="button-group">
            <button type="submit" className="login-button">로그인</button>
            <button type="button" className="signup-button" onClick={onSignupClick}>회원가입</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
