/**
 * The data that should be stored in order for user to be authencticated.
 */
export interface AuthData {
  token: string|null;
  refreshToken: string|null;
}
