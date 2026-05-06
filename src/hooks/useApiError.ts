import { useCallback } from 'react';
import { Alert } from 'react-native';

export type ApiErrorType =
  | 'UNAUTHORIZED'    // 401
  | 'FORBIDDEN'       // 403
  | 'NOT_FOUND'       // 404
  | 'SERVER_ERROR'    // 500
  | 'NETWORK_ERROR'   // 네트워크 끊김
  | 'TIMEOUT'         // 타임아웃
  | 'UNKNOWN';        // 그 외

interface ApiError {
  status?: number;
  message?: string;
}

function getErrorType(error: ApiError): ApiErrorType {
  if (!error.status) return 'NETWORK_ERROR';
  if (error.status === 401) return 'UNAUTHORIZED';
  if (error.status === 403) return 'FORBIDDEN';
  if (error.status === 404) return 'NOT_FOUND';
  if (error.status >= 500) return 'SERVER_ERROR';
  return 'UNKNOWN';
}

function getErrorMessage(type: ApiErrorType): string {
  switch (type) {
    case 'UNAUTHORIZED':  return '로그인이 필요해요. 다시 로그인해주세요.';
    case 'FORBIDDEN':     return '접근 권한이 없어요.';
    case 'NOT_FOUND':     return '요청한 정보를 찾을 수 없어요.';
    case 'SERVER_ERROR':  return '서버에 문제가 생겼어요. 잠시 후 다시 시도해주세요.';
    case 'NETWORK_ERROR': return '인터넷 연결을 확인해주세요.';
    case 'TIMEOUT':       return '요청 시간이 초과됐어요. 다시 시도해주세요.';
    default:              return '오류가 발생했어요. 잠시 후 다시 시도해주세요.';
  }
}

export function useApiError() {
  const handleError = useCallback((error: ApiError, onUnauthorized?: () => void) => {
    const type = getErrorType(error);
    const message = getErrorMessage(type);

    if (type === 'UNAUTHORIZED' && onUnauthorized) {
      Alert.alert('로그인 필요', message, [
        { text: '확인', onPress: onUnauthorized },
      ]);
      return;
    }

    Alert.alert('오류', message, [{ text: '확인' }]);
  }, []);

  return { handleError };
}