import axios from 'axios';
import { tokenStorage } from './tokenStorage';

const BASE_URL = 'https://api.moment-app.com'; // 백엔드 URL 나오면 여기만 교체

// ── axios 인스턴스 ──
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── 토큰 재발급 중복 방지용 ──
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
};

// ── 요청 인터셉터: Authorization 헤더 자동 첨부 ──
client.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── 응답 인터셉터: 401 시 토큰 재발급 ──
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 이미 재발급 중이면 큐에 넣고 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return client(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken = data.accessToken;
      await tokenStorage.setAccessToken(newAccessToken);

      processQueue(null, newAccessToken);
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return client(originalRequest);

    } catch (refreshError) {
      // 재발급 실패 → 토큰 삭제 + 로그인으로 이동
      processQueue(refreshError, null);
      await tokenStorage.clearAll();
      // 로그인 화면 이동은 화면 연결 후 추가
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default client;