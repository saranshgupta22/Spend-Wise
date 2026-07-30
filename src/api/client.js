import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';

const normalizeUrl = (url) => url?.trim().replace(/\/+$/, '');

const getExpoHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (!hostUri) return null;

  return hostUri.split(':')[0];
};

const getBaseUrl = () => {
  const envUrl = normalizeUrl(process.env.EXPO_PUBLIC_API_URL);
  if (envUrl) return envUrl;

  const expoHost = getExpoHost();
  if (expoHost) return `http://${expoHost}:3000`;

  return Platform.OS === 'android'
    ? 'http://10.0.2.2:3000'
    : 'http://localhost:3000';
};

const BASE_URL = getBaseUrl();

let isRefreshing = false;
let refreshPromise = null;

const getHeaders = () => {
  const token = useAppStore.getState().userToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const logout = () => {
  const { logout } = useAppStore.getState();
  logout();
};

const refreshAccessToken = async () => {
  const refreshToken = useAppStore.getState().refreshToken;
  
  if (!refreshToken) {
    logout();
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      const { login } = useAppStore.getState();
      login(useAppStore.getState().userPhone, data.token, data.refreshToken);
      return data.token;
    } else {
      logout();
      return null;
    }
  } catch (error) {
    console.log('[Token Refresh Error]', error.message);
    logout();
    return null;
  }
};

const handleUnauthorized = async (originalFetch) => {
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken();
  
  const newToken = await refreshPromise;
  isRefreshing = false;
  refreshPromise = null;

  if (newToken) {
    return originalFetch();
  }
  
  return { success: false, error: 'Session expired. Please login again.' };
};

export const apiClient = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: getHeaders(),
      });
      
      if (response.status === 401) {
        const data = await response.json();
        if (data.code === 'TOKEN_EXPIRED') {
          return handleUnauthorized(() => apiClient.get(endpoint));
        }
        logout();
        return { success: false, error: 'Unauthorized' };
      }
      
      return await response.json();
    } catch (error) {
      console.log(`[API GET ERROR] ${endpoint}:`, error.message);
      return { success: false, error: 'Network request failed' };
    }
  },

  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      
      if (response.status === 401) {
        const json = await response.json();
        if (json.code === 'TOKEN_EXPIRED') {
          return handleUnauthorized(() => apiClient.post(endpoint, data));
        }
        logout();
        return { success: false, error: 'Unauthorized' };
      }
      
      return await response.json();
    } catch (error) {
      console.log(`[API POST ERROR] ${endpoint}:`, error.message);
      return { success: false, error: 'Network request failed' };
    }
  },

  put: async (endpoint, data) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      
      if (response.status === 401) {
        const json = await response.json();
        if (json.code === 'TOKEN_EXPIRED') {
          return handleUnauthorized(() => apiClient.put(endpoint, data));
        }
        logout();
        return { success: false, error: 'Unauthorized' };
      }
      
      return await response.json();
    } catch (error) {
      console.log(`[API PUT ERROR] ${endpoint}:`, error.message);
      return { success: false, error: 'Network request failed' };
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      
      if (response.status === 401) {
        const json = await response.json();
        if (json.code === 'TOKEN_EXPIRED') {
          return handleUnauthorized(() => apiClient.delete(endpoint));
        }
        logout();
        return { success: false, error: 'Unauthorized' };
      }
      
      return await response.json();
    } catch (error) {
      console.log(`[API DELETE ERROR] ${endpoint}:`, error.message);
      return { success: false, error: 'Network request failed' };
    }
  }
};
