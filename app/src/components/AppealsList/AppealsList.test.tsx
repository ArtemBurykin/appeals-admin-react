import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import AppealsList from './AppealsList';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import { waitTillMswResponses } from '../../testing/helper';

describe('<AppealsList />', () => {
  const appealsList = [
    { id: 1, title: 'appeal 1' },
    { id: 2, title: 'appeal 2' },
  ];

  const token = 'an_auth_token';

  const server = setupServer(
    rest.get('/api/appeals', (req, res, ctx) => {
      const tokenReceived = req.headers.get('Authorization');

      // to control that we get the auth token
      if (tokenReceived === `Bearer ${token}`) {
        return res(ctx.json(appealsList));
      } else {
        return res(ctx.json({ error: 'Unauthorized' }), ctx.status(401));
      }
    })
  );

  beforeAll(() => server.listen());

  beforeEach(() => {
    sessionStorage.setItem('authToken', token);
    window.history.pushState({}, 'Main', '/');
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  afterAll(() => server.close());

  test('init: successful', async () => {
    render(
      <React.StrictMode>
        <BrowserRouter>
          <AppealsList />
        </BrowserRouter>
      </React.StrictMode>
    );

    await act(async () => {
      await waitTillMswResponses();
    });

    const cells = screen.queryAllByRole('cell');
    expect(cells.length).toBe(4);

    const cellsContent = cells.map((cell) => cell.textContent);
    expect(cellsContent).toEqual(['1', 'appeal 1', '2', 'appeal 2']);
  });

  test('init: error', async () => {
    const error = 'an error';
    server.use(
      rest.get('/api/appeals', (req, res, ctx) => {
        return res(ctx.json({ error }), ctx.status(500));
      })
    );

    render(
      <React.StrictMode>
        <BrowserRouter>
          <AppealsList />
        </BrowserRouter>
      </React.StrictMode>
    );

    await act(async () => {
      await waitTillMswResponses();
    });

    const errorAlert: HTMLElement | null = screen.queryByRole('alert');

    expect(errorAlert?.textContent).toContain(error);
  });

  test('init: loader: successful', async () => {
    server.use(
      rest.get('/api/appeals', (_, res, ctx) => {
        return res(ctx.json(appealsList), ctx.status(200));
      })
    );

    render(
      <React.StrictMode>
        <BrowserRouter>
          <AppealsList />
        </BrowserRouter>
      </React.StrictMode>
    );

    await waitFor(() => {
      const loader: HTMLElement | null = screen.queryByText('Loading...');
      expect(loader).not.toBeNull();
    });

    await act(async () => {
      await waitTillMswResponses();
    });

    expect(screen.queryByText('Loading...')).toBeNull();
  });

  test('init: loader: error', async () => {
    server.use(
      rest.get('/api/appeals', (_, res, ctx) => {
        return res(ctx.json({ error: 'error' }), ctx.status(500));
      })
    );

    render(
      <React.StrictMode>
        <BrowserRouter>
          <AppealsList />
        </BrowserRouter>
      </React.StrictMode>
    );

    await waitFor(() => {
      const loader: HTMLElement | null = screen.queryByText('Loading...');
      expect(loader).not.toBeNull();
    });

    await act(async () => {
      await waitTillMswResponses();
    });

    expect(screen.queryByText('Loading...')).toBeNull();
  });

  test('goToItem: should navigate', async () => {
    server.use(
      rest.get('/api/appeals', (_, res, ctx) => {
        return res(ctx.json(appealsList), ctx.status(200));
      })
    );

    render(
      <React.StrictMode>
        <BrowserRouter>
          <AppealsList />
        </BrowserRouter>
      </React.StrictMode>
    );

    await act(async () => {
      await waitTillMswResponses();
    });

    const appealTitle1Cell = screen.getByText('appeal 2');
    fireEvent.click(appealTitle1Cell);

    expect(window.location.pathname).toEqual('/appeals/2');
  });
});
