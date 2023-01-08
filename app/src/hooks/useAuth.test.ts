import { useAuth } from './useAuth';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';

describe('useAuth', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  test('should store the auth tokens', () => {
    const { result } = renderHook(() => useAuth());

    const token = 'token';
    const refreshToken = 'refreshToken';
    act(() => {
      result.current.setAuthData(token, refreshToken);
    });

    expect(result.current.authData.token).toBe(token);
    expect(result.current.authData.refreshToken).toBe(refreshToken);

    expect(sessionStorage.getItem('authToken')).toBe(token);
    expect(sessionStorage.getItem('refreshToken')).toBe(refreshToken);
  });

  test('should init values from sessionStorage', () => {
    const token = 'a_token';
    const refreshToken = 'a_refresh_token';
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('refreshToken', refreshToken);

    const { result } = renderHook(() => useAuth());
    expect(result.current.authData.token).toBe(token);
    expect(result.current.authData.refreshToken).toBe(refreshToken);
  });
});