import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Login from './Login';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { waitTillMswResponses } from '../../testing/helper';

describe('<Login/>', () => {
  const token = 'a_token';
  const refreshToken = 'refresh_token';
  const tokenResponse = { token, refreshToken };

  const username = 'user';
  const password = 'pass';
  const errorUsername = 'error';
  const errorPassword = 'pass';

  const error = 'Internal error';

  const server = setupServer(
    rest.post('/api/admin_login', (req, res, ctx) => {
      if (!req.body) {
        return res(ctx.json({ error: 'Incorrect request' }), ctx.status(400));
      }

      const body: { username: string; password: string } = JSON.parse(
        req.body.toString()
      );

      if (body.username === username && body.password === password) {
        return res(ctx.json(tokenResponse));
      } else if (
        body.username === errorUsername &&
        body.password === errorPassword
      ) {
        return res(ctx.json({ error }), ctx.status(500));
      } else {
        return res(ctx.json({ error: 'Invalid credentials' }), ctx.status(401));
      }
    })
  );

  beforeAll(() => server.listen());

  beforeEach(() => {
    window.history.pushState({}, 'Main', '/');
  });

  afterEach(() => {
    sessionStorage.clear();
    server.resetHandlers();
  });

  afterAll(() => server.close());

  const renderDummyAppWithLogin = () => {
    return render(
      <React.StrictMode>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </React.StrictMode>
    );
  };

  test('successful login request', async () => {
    renderDummyAppWithLogin();

    const usernameField =
      screen.getByTestId<HTMLInputElement>('username-field');
    fireEvent.change(usernameField, { target: { value: username } });

    const passwordField =
      screen.getByTestId<HTMLInputElement>('password-field');
    fireEvent.change(passwordField, { target: { value: password } });
    const loginBtn = screen.getByRole('button');

    act(() => {
      fireEvent.click(loginBtn);
    });

    // we're waiting till the request to msw is finished
    await act(async () => {
      await waitTillMswResponses();
    });

    expect(window.location.pathname).toEqual('/');

    expect(sessionStorage.getItem('authToken')).toBe(token);
    expect(sessionStorage.getItem('refreshToken')).toBe(refreshToken);

    const alert = screen.queryByRole('alert');
    expect(alert).toBeNull();
  });

  test('incorrect credentials: should show the message', async () => {
    renderDummyAppWithLogin();

    const usernameField =
      screen.getByTestId<HTMLInputElement>('username-field');
    fireEvent.change(usernameField, { target: { value: 'incorrect' } });

    const passwordField =
      screen.getByTestId<HTMLInputElement>('password-field');
    fireEvent.change(passwordField, { target: { value: 'incorrect' } });

    const loginBtn = screen.getByRole('button');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Invalid credentials');
    });

    expect(window.location.pathname).toEqual('/');

    expect(sessionStorage.getItem('authToken')).toBeNull();
    expect(sessionStorage.getItem('refreshToken')).toBeNull();
  });

  test('error: should show the message', async () => {
    renderDummyAppWithLogin();

    const usernameField =
      screen.getByTestId<HTMLInputElement>('username-field');
    fireEvent.change(usernameField, { target: { value: errorUsername } });

    const passwordField =
      screen.getByTestId<HTMLInputElement>('password-field');
    fireEvent.change(passwordField, { target: { value: errorPassword } });

    const loginBtn = screen.getByRole('button');

    fireEvent.click(loginBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent(error);
    });

    expect(window.location.pathname).toEqual('/');

    expect(sessionStorage.getItem('authToken')).toBeNull();
    expect(sessionStorage.getItem('refreshToken')).toBeNull();
  });

  test('validation: login empty', async () => {
    renderDummyAppWithLogin();

    const passwordField =
      screen.getByTestId<HTMLInputElement>('password-field');
    fireEvent.change(passwordField, { target: { value: 'incorrect' } });

    const loginBtn = screen.getByRole('button');

    fireEvent.click(loginBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('The username should not be empty');
    });

    expect(window.location.pathname).toEqual('/');

    expect(sessionStorage.getItem('authToken')).toBeNull();
    expect(sessionStorage.getItem('refreshToken')).toBeNull();
  });

  test('validation: password empty', async () => {
    renderDummyAppWithLogin();

    const usernameField =
      screen.getByTestId<HTMLInputElement>('username-field');
    fireEvent.change(usernameField, { target: { value: 'incorrect' } });

    const loginBtn = screen.getByRole('button');
    fireEvent.click(loginBtn);

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('The password should not be empty');
    });

    expect(window.location.pathname).toEqual('/');

    expect(sessionStorage.getItem('authToken')).toBeNull();
    expect(sessionStorage.getItem('refreshToken')).toBeNull();
  });

  test('successful after error: should clear the error', async () => {
    renderDummyAppWithLogin();

    const usernameField =
      screen.getByTestId<HTMLInputElement>('username-field');
    fireEvent.change(usernameField, { target: { value: username } });

    const loginBtn = screen.getByRole('button');

    fireEvent.click(loginBtn);

    // we're waiting till a response returns from msw
    await act(async () => {
      await waitTillMswResponses();
    });

    const passwordField =
      screen.getByTestId<HTMLInputElement>('password-field');
    fireEvent.change(passwordField, { target: { value: password } });

    fireEvent.click(loginBtn);

    // we're waiting till a response returns from msw
    await act(async () => {
      await waitTillMswResponses();
    });

    const alert = screen.queryByRole('alert');
    expect(alert).toBeNull();
  });
});
