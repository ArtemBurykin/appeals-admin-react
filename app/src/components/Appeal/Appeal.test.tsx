import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Appeal from './Appeal';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { waitTillMswResponses } from '../../testing/helper';

describe('<Appeal />', () => {
  const appeal = {
    id: 1,
    title: 'appeal 1',
    messages: [{ text: 'a message', isAdmin: false }],
  };

  const token = 'an_auth_token';

  const server = setupServer(
    rest.get('/api/appeals/1', (req, res, ctx) => {
      const tokenReceived = req.headers.get('Authorization');

      // to control that we get the auth token
      if (tokenReceived === `Bearer ${token}`) {
        return res(ctx.json(appeal));
      } else {
        return res(ctx.json({ error: 'Unauthorized' }), ctx.status(401));
      }
    }),
    rest.post('/api/appeals/1/add-message', (req, res, ctx) => {
      const tokenReceived = req.headers.get('Authorization');

      // to control that we get the auth token
      if (tokenReceived !== `Bearer ${token}`) {
        return res(ctx.json({ error: 'Unauthorized' }), ctx.status(401));
      }

      const body = JSON.parse(req.body as string);
      if (body.message === undefined || body.isAdmin === undefined) {
        return res(ctx.json({ error: 'Bad request' }), ctx.status(400));
      }

      return res(ctx.json(''));
    })
  );

  const renderWithRoute = () => {
    const route = '/appeals/1';

    render(
      <React.StrictMode>
        <MemoryRouter initialEntries={[route]}>
          <Routes>
            <Route path="/appeals/:appealId" element={<Appeal />} />
          </Routes>
        </MemoryRouter>
      </React.StrictMode>
    );
  };

  beforeAll(() => server.listen());

  beforeEach(() => {
    sessionStorage.setItem('authToken', token);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  afterAll(() => server.close());

  test('init: successful', async () => {
    renderWithRoute();

    await act(async () => {
      await waitTillMswResponses();
    });

    const titleLabel = screen.queryByTestId('title');
    expect(titleLabel?.textContent).toBe(`Appeal #1: ${appeal.title}`);

    const messages = screen.queryAllByTestId('message');
    expect(messages.length).toBe(1);
    expect(messages[0].textContent).toBe(appeal.messages[0].text);
  });

  test('init: error', async () => {
    const error = 'an error';
    server.use(
      rest.get('/api/appeals/1', (req, res, ctx) => {
        return res(ctx.json({ error }), ctx.status(500));
      })
    );

    renderWithRoute();

    await act(async () => {
      await waitTillMswResponses();
    });

    const errorAlert: HTMLElement | null = screen.queryByRole('alert');
    expect(errorAlert?.textContent).toContain(error);
  });

  test('init: loader: successful', async () => {
    server.use(
      rest.get('/api/appeals/1', (_, res, ctx) => {
        return res(ctx.json(appeal), ctx.status(200));
      })
    );

    renderWithRoute();

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
      rest.get('/api/appeals/1', (_, res, ctx) => {
        return res(ctx.json({ error: 'error' }), ctx.status(500));
      })
    );

    renderWithRoute();

    await waitFor(() => {
      const loader: HTMLElement | null = screen.queryByText('Loading...');
      expect(loader).not.toBeNull();
    });

    await act(async () => {
      await waitTillMswResponses();
    });

    expect(screen.queryByText('Loading...')).toBeNull();
  });

  test('add message: successful', async () => {
    server.resetHandlers();
    renderWithRoute();

    await act(async () => {
      await waitTillMswResponses();
    });

    let messages = screen.queryAllByTestId('message');
    expect(messages.length).toBe(1);
    expect(messages[0].textContent).toContain(appeal.messages[0].text);
    expect(messages[0].textContent).not.toContain('By admin');

    const messageInput = screen.queryByTestId(
      'messageInput'
    ) as HTMLInputElement;
    const submitBtn = screen.queryByTestId('send-btn') as HTMLElement;

    const adminMessage = 'message by admin';

    act(() => {
      fireEvent.change(messageInput, { target: { value: adminMessage } });
    });

    act(() => {
      submitBtn.click();
    });

    await act(async () => {
      await waitTillMswResponses();
    });

    const displayedError = screen.queryByTestId(
      'add-message-status'
    ) as HTMLElement;
    expect(displayedError.textContent).toBe('');

    messages = screen.queryAllByTestId('message');
    expect(messages.length).toBe(2);
    expect(messages[1].textContent).toContain(adminMessage);
    expect(messages[1].textContent).toContain('By admin');
    expect(messageInput.value).toBe('');
  });

  test('add message: error', async () => {
    server.use(
      rest.post('/api/appeals/1/add-message', (_, res, ctx) => {
        return res(ctx.json({ error: 'error' }), ctx.status(500));
      })
    );

    renderWithRoute();

    await act(async () => {
      await waitTillMswResponses();
    });

    let messages = screen.queryAllByTestId('message');
    expect(messages.length).toBe(1);
    expect(messages[0].textContent).toContain(appeal.messages[0].text);
    expect(messages[0].textContent).not.toContain('By admin');

    const messageInput = screen.queryByTestId(
      'messageInput'
    ) as HTMLInputElement;
    const submitBtn = screen.queryByTestId('send-btn') as HTMLElement;

    const adminMessage = 'message by admin';

    act(() => {
      fireEvent.change(messageInput, { target: { value: adminMessage } });
    });

    act(() => {
      submitBtn.click();
    });

    await act(async () => {
      await waitTillMswResponses();
    });

    const displayedError = screen.queryByTestId(
      'add-message-status'
    ) as HTMLElement;
    expect(displayedError.textContent).toContain('error');

    messages = screen.queryAllByTestId('message');
    expect(messages.length).toBe(1);
    expect(messageInput.value).toBe(adminMessage);
  });
});
