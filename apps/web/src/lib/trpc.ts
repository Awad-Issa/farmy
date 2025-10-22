/**
 * tRPC React client setup
 * Handles JWT auth + X-Farm-Id header injection
 */

import { createTRPCReact } from '@trpc/react-query';
import { httpLink, loggerLink } from '@trpc/client';
import { type AppRouter } from '@farmy/api';
import superjson from 'superjson';

// Create typed tRPC React client
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get auth token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

/**
 * Get current farm ID from localStorage
 */
export function getCurrentFarmId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('currentFarmId');
}

/**
 * Set auth token in localStorage and cookies
 */
export function setAuthToken(token: string) {
  localStorage.setItem('accessToken', token);
  // Also set in cookie for middleware access
  document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

/**
 * Set refresh token in localStorage
 */
export function setRefreshToken(token: string) {
  localStorage.setItem('refreshToken', token);
  // Also set in cookie
  document.cookie = `refresh_token=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
}

/**
 * Set current farm ID
 */
export function setCurrentFarmId(farmId: string) {
  localStorage.setItem('currentFarmId', farmId);
}

/**
 * Clear auth data (logout)
 */
export function clearAuth() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('currentFarmId');
  localStorage.removeItem('user');
  // Clear cookies
  document.cookie = 'auth_token=; path=/; max-age=0';
  document.cookie = 'refresh_token=; path=/; max-age=0';
}

/**
 * Create tRPC client with custom configuration
 */
export function createTRPCClient() {
  return trpc.createClient({
    // transformer: superjson, // Temporarily disabled to see raw errors
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === 'development' ||
          (opts.direction === 'down' && opts.result instanceof Error),
      }),
      httpLink({
        url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/trpc`,
        
        // Add custom headers
        headers() {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };

          // Add JWT token if available
          const token = getAuthToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }

          // Add X-Farm-Id header if available
          const farmId = getCurrentFarmId();
          if (farmId) {
            headers['X-Farm-Id'] = farmId;
          }

          return headers;
        },
        
        // Handle fetch errors (401, 403)
        fetch(url, options) {
          return fetch(url, options).then(async (response) => {
            // Handle 401 - Unauthorized (token expired/invalid)
            if (response.status === 401) {
              // Try to refresh token
              const refreshToken = getRefreshToken();
              if (refreshToken) {
                try {
                  // Call refresh endpoint
                  const refreshResponse = await fetch('/api/trpc/auth.refresh', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      refreshToken,
                    }),
                  });

                  if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setAuthToken(data.result.data.accessToken);
                    setRefreshToken(data.result.data.refreshToken);
                    
                    // Retry original request with new token
                    const newHeaders = {
                      ...options?.headers,
                      Authorization: `Bearer ${data.result.data.accessToken}`,
                    };
                    return fetch(url, { ...options, headers: newHeaders });
                  }
                } catch (error) {
                  console.error('Token refresh failed:', error);
                }
              }
              
              // Refresh failed or no refresh token - redirect to login
              clearAuth();
              if (typeof window !== 'undefined') {
                const locale = window.location.pathname.split('/')[1] || 'en';
                window.location.href = `/${locale}/login`;
              }
            }

            // Handle 403 - Forbidden (insufficient permissions)
            if (response.status === 403) {
              // Show error message or redirect to no-access page
              if (typeof window !== 'undefined') {
                // You can show a toast notification here
                console.error('Access denied - insufficient permissions');
              }
            }

            return response;
          });
        },
      }),
    ],
  });
}

