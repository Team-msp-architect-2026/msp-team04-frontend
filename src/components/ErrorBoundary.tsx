import React, { Component, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View style={s.container}>
          <Text style={s.emoji}>😵</Text>
          <Text style={s.title}>앗, 문제가 생겼어요</Text>
          <Text style={s.desc}>
            예상치 못한 오류가 발생했어요.{'\n'}잠시 후 다시 시도해주세요.
          </Text>
          <TouchableOpacity style={s.btn} onPress={this.handleReset}>
            <Text style={s.btnText}>다시 시도하기</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji:  { fontSize: 64, marginBottom: 16 },
  title:  { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 8 },
  desc:   { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  btn:    { backgroundColor: '#FFD93D', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12 },
  btnText:{ fontSize: 15, fontWeight: '700', color: '#191919' },
});