import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../constants';

interface ProfileEditScreenProps {
  userName: string;
  onBack: () => void;
  onSave: (name: string, avatar?: string) => void;
}

export default function ProfileEditScreen({
  userName,
  onBack,
  onSave,
}: ProfileEditScreenProps) {
  const [name, setName] = useState(userName);
  const [avatar, setAvatar] = useState<string | null>(null);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],   // ← 수정된 부분
      allowsEditing: true,
      aspect: [1, 1] as [number, number],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleRemoveAvatar = () => {
    Alert.alert('프로필 사진 삭제', '프로필 사진을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => setAvatar(null) },
    ]);
  };

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), avatar || undefined);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity style={s.headerBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>프로필 수정</Text>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={handleSave}
          disabled={!name.trim()}
        >
          <Text style={[s.saveText, !name.trim() && s.saveTextDisabled]}>
            저장
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 아바타 영역 */}
        <View style={s.avatarSection}>
          <View style={s.avatarWrapper}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={s.avatarImage} />
            ) : (
              <View style={s.avatarPlaceholder}>
                <Text style={s.avatarInitial}>{name.charAt(0) || '?'}</Text>
              </View>
            )}
            {avatar && (
              <TouchableOpacity style={s.removeBtn} onPress={handleRemoveAvatar}>
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={s.cameraBtn} onPress={handlePickImage}>
              <Ionicons name="camera" size={16} color="#888" />
            </TouchableOpacity>
          </View>
          <Text style={s.avatarHint}>
            프로필 사진을 변경하려면 카메라 아이콘을 탭하세요
          </Text>
        </View>

        {/* 이름 입력 */}
        <View style={s.inputSection}>
          <Text style={s.label}>이름</Text>
          <TextInput
            style={s.input}
            value={name}
            onChangeText={setName}
            placeholder="이름을 입력해주세요"
            placeholderTextColor="#aaa"
            maxLength={20}
          />
          <Text style={s.charCount}>{name.length}/20</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary.default,
  },
  saveTextDisabled: {
    color: '#ccc',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
    width: 96,
    height: 96,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  removeBtn: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1A1A1A',
    backgroundColor: '#fff',
  },
  charCount: {
    marginTop: 6,
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
  },
});