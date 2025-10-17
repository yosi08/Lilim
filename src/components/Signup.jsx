import './Login.css';

function Signup({ onBackToLogin }) {
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
        <h1>Sign Up</h1>
        <form className="login-form">
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" name="username" />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" name="password" />
          </div>

          <div className="input-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" name="confirm-password" />
          </div>

          <button type="submit" className="login-button">Create Account</button>
          <button type="button" className="back-button" onClick={onBackToLogin}>Back to Login</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
