/**
 * Authentication utilities using SecureStore
 * Handles JWT tokens securely
 */

import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'farmy_access_token';
const REFRESH_TOKEN_KEY = 'farmy_refresh_token';
const CURRENT_FARM_KEY = 'farmy_current_farm';
const USER_DATA_KEY = 'farmy_user_data';

/**
 * Save access token securely
 */
export async function setAccessToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
}

/**
 * Get access token
 */
export async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

/**
 * Save refresh token securely
 */
export async function setRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

/**
 * Save current farm ID
 */
export async function setCurrentFarmId(farmId: string): Promise<void> {
  await SecureStore.setItemAsync(CURRENT_FARM_KEY, farmId);
}

/**
 * Get current farm ID
 */
export async function getCurrentFarmId(): Promise<string | null> {
  return await SecureStore.getItemAsync(CURRENT_FARM_KEY);
}

/**
 * Save user data
 */
export async function setUserData(userData: any): Promise<void> {
  await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
}

/**
 * Get user data
 */
export async function getUserData(): Promise<any | null> {
  const data = await SecureStore.getItemAsync(USER_DATA_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Clear all auth data (logout)
 */
export async function clearAuth(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(CURRENT_FARM_KEY),
    SecureStore.deleteItemAsync(USER_DATA_KEY),
  ]);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}

