import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './Login.css';

/**
 * The component of the login page.
 */
const Login: FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  const { setAuthData } = useAuth();

  /**`
   * Updates the state when a form field value is changed.
   */
  const handleChange = (event: React.FormEvent<HTMLInputElement>) => {
    const name = event.currentTarget.name;
    const value = event.currentTarget.value;

    const udpatedCredentials = Object.assign({}, credentials, {
      [name]: value,
    });
    setCredentials(udpatedCredentials);
  };

  /**
   * Sends the login request to the server.
   */
  const login = async () => {
    const username = credentials.username;
    const password = credentials.password;

    setError(null);

    if (!username) {
      setError('The username should not be empty');
      return;
    }

    if (!password) {
      setError('The password should not be empty');
      return;
    }

    const authReq = JSON.stringify({ username, password });

    const response = await fetch('/api/admin_login', {
      method: 'POST',
      body: authReq,
    });

    const data: { token: string; refreshToken: string; error?: string } =
      await response.json();

    if (response.status !== 200) {
      setError(data.error || null);
      return;
    }

    setAuthData(data.token, data.refreshToken);
    navigate('/');
  };

  return (
    <div className="login" data-testid="Login">
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-md-4 col-12">
            <form className="login__form">
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  data-testid="username-field"
                  className="form-control"
                  name="username"
                  onChange={handleChange}
                  aria-describedby="usernameHelp"
                />
                <div id="usernameHelp" className="form-text">
                  Required
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="text"
                  name="password"
                  className="form-control"
                  data-testid="password-field"
                  onChange={handleChange}
                  aria-describedby="passwordHelp"
                />
                <div id="passwordHelp" className="form-text">
                  Required
                </div>
              </div>
              <button type="button" className="btn btn-primary" onClick={login}>
                Log in
              </button>

              {error !== null && (
                <div
                  className="alert alert-danger mt-4"
                  role="alert"
                  id="error-info">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
