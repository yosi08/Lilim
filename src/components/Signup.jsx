import './Login.css';

function Signup({ onBackToLogin }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('회원가입 처리');
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
        <h1>회원가입</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">사용자이름</label>
            <input type="text" id="username" name="username" />
          </div>

          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <input type="email" id="email" name="email" />
          </div>

          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input type="password" id="password" name="password" />
          </div>

          <div className="input-group">
            <label htmlFor="confirm-password">비밀번호 확인</label>
            <input type="password" id="confirm-password" name="confirm-password" />
          </div>

          <button type="submit" className="login-button">계정 만들기</button>
          <button type="button" className="back-button" onClick={onBackToLogin}>로그인으로 돌아가기</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
