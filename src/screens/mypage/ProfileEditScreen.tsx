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
import { uploadProfileImage } from '../../api/profileImageUploadApi';

interface ProfileEditScreenProps {
  userName: string;
  initialAvatar?: string;
  onBack: () => void;
  onSave: (name: string, avatar?: string) => void | Promise<void>;
}

export default function ProfileEditScreen({
  userName,
  initialAvatar,
  onBack,
  onSave,
}: ProfileEditScreenProps) {
  const [name, setName] = useState(userName);
  const [avatar, setAvatar] = useState<string | null>(initialAvatar ?? null);
  const [saving, setSaving] = useState(false);

  const trimmedName = name.trim();
  const isSaveDisabled = !trimmedName || saving;

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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

  const handleSave = async () => {
    if (!trimmedName || saving) {
      return;
    }

    try {
      setSaving(true);

      const savedAvatar =
        avatar && avatar.startsWith('file://')
          ? (await uploadProfileImage(avatar)).fileUrl
          : avatar ?? undefined;

      await onSave(trimmedName, savedAvatar);
    } catch (error) {
      console.error('프로필 이미지 저장 실패:', error);
      Alert.alert(
        '저장 실패',
        '프로필 이미지를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* 헤더 */}
      <View style={s.header}>
        <TouchableOpacity
          style={s.headerBtn}
          onPress={onBack}
          activeOpacity={0.72}
        >
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>

        <Text style={s.headerTitle}>프로필 수정</Text>

        <TouchableOpacity
          style={s.saveButton}
          onPress={handleSave}
          disabled={isSaveDisabled}
          activeOpacity={0.76}
        >
          <Text style={[s.saveText, isSaveDisabled && s.saveTextDisabled]}>
            {saving ? '저장 중...' : '저장'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
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
              <TouchableOpacity
                style={s.removeBtn}
                onPress={handleRemoveAvatar}
                activeOpacity={0.78}
              >
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={s.cameraBtn}
              onPress={handlePickImage}
              activeOpacity={0.78}
            >
              <Ionicons name="camera" size={16} color="#6B7280" />
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
            placeholderTextColor="#AEB4BE"
            maxLength={20}
            autoCorrect={false}
            returnKeyType="done"
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
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },

  headerBtn: {
    width: 56,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },

  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: -0.25,
  },

  saveButton: {
    minWidth: 58,
    height: 40,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  saveText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
    color: '#191919',
    letterSpacing: -0.2,
  },

  saveTextDisabled: {
    color: '#AEB4BE',
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 34,
    paddingBottom: 40,
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: 38,
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F3F4F6',
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
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
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
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E3E6EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  avatarHint: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    color: '#8B929E',
    textAlign: 'center',
  },

  inputSection: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    letterSpacing: -0.15,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#E7EAF0',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    color: '#1A1A1A',
    backgroundColor: '#FAFBFC',
  },

  charCount: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#A8AFBA',
    textAlign: 'right',
  },
});