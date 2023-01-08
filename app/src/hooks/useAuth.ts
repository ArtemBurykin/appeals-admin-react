import { useState } from 'react';
import { AuthContextData } from './AuthContextData';

/**
 * The hook to provide the app auth state, and a way to manipulate it.
 */
export const useAuth: () => AuthContextData  = () => {
  const [authData, setAuthData] = useState<{token: string|null, refreshToken: string|null }>({
    token: sessionStorage.getItem('authToken'),
    refreshToken: sessionStorage.getItem('refreshToken'),
  });

  const updateAuthData = (token: string, refreshToken: string) => {
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('refreshToken', refreshToken);
    setAuthData({ token, refreshToken });
  };

  return {
    authData,
    setAuthData: updateAuthData,
  };
};
