import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Alert } from 'react-native';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isFirstCheck, setIsFirstCheck] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? true;

      // 최초 체크는 Alert 안 띄움
      if (isFirstCheck) {
        setIsConnected(connected);
        setIsFirstCheck(false);
        return;
      }

      // 연결 끊겼을 때만 Alert
      if (!connected && isConnected) {
        Alert.alert(
          '인터넷 연결 없음',
          '네트워크 연결을 확인해주세요.\n일부 기능이 제한될 수 있어요.',
          [{ text: '확인' }]
        );
      }

      setIsConnected(connected);
    });

    return () => unsubscribe();
  }, [isConnected, isFirstCheck]);

  return { isConnected };
}