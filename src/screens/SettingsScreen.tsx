import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function SettingsScreen({ onBack, onLogout }: SettingsScreenProps) {
  return (
    <SafeAreaView style={s.root}>
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>설정</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* 계정 */}
        <Text style={s.sectionLabel}>계정</Text>
        <View style={s.menuSection}>
          <TouchableOpacity style={[s.menuItem, s.menuItemBorder]}>
            <View style={s.menuLeft}>
              <Ionicons name="shield" size={20} color="#888" />
              <Text style={s.menuLabel}>개인정보 관리</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={s.menuItem}>
            <View style={s.menuLeft}>
              <Ionicons name="shield" size={20} color="#888" />
              <Text style={s.menuLabel}>연결된 소셜 계정</Text>
            </View>
            <View style={s.menuRight}>
              <Text style={s.menuSub}>카카오</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </View>
          </TouchableOpacity>
        </View>

        {/* 정보 */}
        <Text style={s.sectionLabel}>정보</Text>
        <View style={s.menuSection}>
          <TouchableOpacity style={[s.menuItem, s.menuItemBorder]}>
            <View style={s.menuLeft}>
              <Ionicons name="document-text" size={20} color="#888" />
              <Text style={s.menuLabel}>이용약관</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.menuItem, s.menuItemBorder]}>
            <View style={s.menuLeft}>
              <Ionicons name="document-text" size={20} color="#888" />
              <Text style={s.menuLabel}>개인정보처리방침</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={s.menuItem}>
            <View style={s.menuLeft}>
              <Ionicons name="information-circle" size={20} color="#888" />
              <Text style={s.menuLabel}>앱 버전</Text>
            </View>
            <Text style={s.menuSub}>v1.0.0</Text>
          </TouchableOpacity>
        </View>

        {/* 계정 관리 */}
        <Text style={s.sectionLabel}>계정 관리</Text>
        <View style={s.menuSection}>
          <TouchableOpacity style={[s.menuItem, s.menuItemBorder]} onPress={onLogout}>
            <View style={s.menuLeft}>
              <Ionicons name="log-out" size={20} color="#888" />
              <Text style={s.menuLabel}>로그아웃</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={s.menuItem}>
            <View style={s.menuLeft}>
              <Ionicons name="trash" size={20} color="#f87171" />
              <Text style={[s.menuLabel, { color: '#f87171' }]}>회원탈퇴</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 11, fontWeight: '600', color: '#888', marginBottom: 8, marginTop: 8, paddingHorizontal: 4 },
  menuSection: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#F0F0F0', overflow: 'hidden', marginBottom: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  menuLabel: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  menuSub: { fontSize: 13, color: '#888' },
});