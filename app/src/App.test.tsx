import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

describe('app routing', () => {
  const renderWithRoute = (
    route: string,
    { isAuthenticated }: { isAuthenticated: boolean }
  ) => {
    if (isAuthenticated) {
      sessionStorage.setItem('authToken', 'token');
      sessionStorage.setItem('refreshToken', 'refresh_token');
    }

    window.history.pushState({}, '', route);

    render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
  };

  afterEach(() => {
    sessionStorage.clear();
  });

  test('/: not authenticated: redirect to login', () => {
    renderWithRoute('/', { isAuthenticated: false });
    expect(window.location.pathname).toBe('/login');
  });

  test('/: authenticated: should redirect to the appeals page', () => {
    renderWithRoute('/', { isAuthenticated: true });
    expect(window.location.pathname).toEqual('/appeals');
  });

  test('/appeals: not authenticated: redirect to login', () => {
    renderWithRoute('/appeals', { isAuthenticated: false });
    expect(window.location.pathname).toBe('/login');
  });

  test('/appeals: authenticated: should stay on the appeals page', () => {
    renderWithRoute('/appeals', { isAuthenticated: true });
    expect(window.location.pathname).toEqual('/appeals');
  });

  test('/appeals/id: not authenticated: redirect to login', () => {
    renderWithRoute('/appeals/3', { isAuthenticated: false });
    expect(window.location.pathname).toBe('/login');
  });

  test('/appeals/id: authenticated: should stay onthe appeal page', () => {
    renderWithRoute('/appeals/3', { isAuthenticated: true });
    expect(window.location.pathname).toEqual('/appeals/3');
  });
});
