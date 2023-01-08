import { AuthData } from './AuthData';

/**
 * Our auth context contains the current auth state, as well as methods to manipulate it.
 */
export interface AuthContextData {
  authData: AuthData,
  setAuthData: (token: string, refreshToken: string) => void,
}