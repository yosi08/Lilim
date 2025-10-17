import './Login.css';

function Login({ onSignupClick }) {
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
        <h1>Welcome</h1>
        <form className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" />
          </div>

          <div className="button-group">
            <button type="submit" className="login-button">Login</button>
            <button type="button" className="signup-button" onClick={onSignupClick}>Sign Up</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
