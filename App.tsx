import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import SplashScreen from './src/screens/home/SplashScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import ChildInputScreen from './src/screens/child/ChildInputScreen';

import RecommendScreen from './src/screens/recommendation/RecommendScreen';
import RecommendationScreen from './src/screens/recommendation/RecommendationScreen';
import AiReportScreen from './src/screens/recommendation/AiReportScreen';

import ProgramDetailScreen from './src/screens/program/ProgramDetailScreen';
import type { ProgramDetail } from './src/screens/program/ProgramDetailScreen';
import MapScreen from './src/screens/program/MapScreen';

import ApplyScreen from './src/screens/application/ApplyScreen';
import PaymentScreen from './src/screens/application/PaymentScreen';
import MyApplicationsScreen from './src/screens/application/MyApplicationsScreen';

import CommunityScreen from './src/screens/community/CommunityScreen';
import type { Post } from './src/screens/community/CommunityScreen';
import CommunityWriteScreen from './src/screens/community/CommunityWriteScreen';
import CommunityPostScreen from './src/screens/community/CommunityPostScreen';
import MyCommunityScreen from './src/screens/community/MyCommunityScreen';

import MyPageScreen from './src/screens/mypage/MyPageScreen';
import ProfileEditScreen from './src/screens/mypage/ProfileEditScreen';
import SavedListScreen from './src/screens/mypage/SavedListScreen';
import SettingsScreen from './src/screens/mypage/SettingsScreen';
import HelpCenterScreen from './src/screens/mypage/HelpCenterScreen';

import NotificationScreen from './src/screens/notification/NotificationScreen';
import NotificationSettingsScreen from './src/screens/notification/NotificationSettingsScreen';

import SearchScreen from './src/screens/search/SearchScreen';

import { useAuthStore, useProfileStore, useRecommendFilterStore } from './src/store';
import ErrorBoundary from './src/components/ErrorBoundary';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import BenefitScreen from './src/screens/BenefitScreen';

interface FilterData {
  ageGroup: string;
  region: string;
  budget: string;
  travelMode: string;
  travelTime: string;
  onlineOption: string;
  classType: string;
  concerns: string[];
  subjectDetails: string[];
}

interface SearchScreenState {
  query: string;
  searched: boolean;
}

type Screen =
  | 'splash'
  | 'login'
  | 'child'
  | 'home'
  | 'recommend'
  | 'recommendation'
  | 'apply'
  | 'community'
  | 'my'
  | 'communityWrite'
  | 'communityPost'
  | 'programDetail'
  | 'notification'
  | 'notificationSettings'
  | 'profileEdit'
  | 'myApplications'
  | 'aiReport'
  | 'search'
  | 'payment'
  | 'savedList'
  | 'map'
  | 'myCommunity'
  | 'settings'
  | 'help'
  | 'benefit';

// ─── 임시 아이 정보 등록 화면 (CHD-001 구현 전까지) ──────────────────────
function ChildPlaceholderScreen({ onNext }: { onNext: () => void }) {
  return (
    <View style={placeholder.container}>
      <Text style={placeholder.emoji}>👶</Text>
      <Text style={placeholder.title}>아이 정보 등록</Text>
      <Text style={placeholder.desc}>
        CHD-001 화면 구현 예정{'\n'}지금은 임시 화면입니다
      </Text>
      <TouchableOpacity style={placeholder.button} onPress={onNext}>
        <Text style={placeholder.buttonText}>홈으로 이동</Text>
      </TouchableOpacity>
    </View>
  );
}

const placeholder = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FEE500',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191919',
  },
});

// ─── 메인 App ─────────────────────────────────────────────────────────────
export default function App() {
  useNetworkStatus();

  const { isLoggedIn, setTokens, logout } = useAuthStore();
  const { childProfile, setChildProfile, clearChildProfile } = useProfileStore();
  const { setRegion } = useRecommendFilterStore();

  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [filterData, setFilterData] = useState<FilterData | null>({
    ageGroup: '',
    region: '강남구',
    budget: '월 15만원 이하',
    travelMode: '',
    travelTime: '',
    onlineOption: '',
    classType: '',
    concerns: [],
    subjectDetails: [],
  });

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ProgramDetail | null>(null);
  const [programDetailBackScreen, setProgramDetailBackScreen] =
    useState<Screen>('recommendation');
  const [searchState, setSearchState] = useState<SearchScreenState>({
    query: '',
    searched: false,
  });
  const [editUserName, setEditUserName] = useState<string>('');

  const handleSplashFinish = () => {
    if (!isLoggedIn) {
      setCurrentScreen('login');
    } else if (!childProfile) {
      setCurrentScreen('child');
    } else {
      setCurrentScreen('home');
    }
  };

  const handleLoginSuccess = () => {
    setTokens('mockAccessToken', 'mockRefreshToken');
    setCurrentScreen('home');
  };

  const handleReset = () => {
    logout();
    clearChildProfile();
    setTimeout(() => setCurrentScreen('splash'), 100);
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <View style={styles.root}>
          {/* ── 테스트 버튼 4개 항상 표시 ── */}
          <View style={styles.devPanel}>
            <TouchableOpacity
              style={[styles.devBtn, { backgroundColor: '#FFD93D' }]}
              onPress={() => setTokens('testAccess', 'testRefresh')}
            >
              <Text style={styles.devBtnText}>로그인 상태 저장</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devBtn, { backgroundColor: '#BAE6FD' }]}
              onPress={() =>
                setChildProfile({
                  name: '민서',
                  age: 7,
                  concerns: ['사회성', '미술'],
                })
              }
            >
              <Text style={styles.devBtnText}>아이 정보 저장</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devBtn, { backgroundColor: '#E5E7EB' }]}
              onPress={() => setRegion('강남구')}
            >
              <Text style={styles.devBtnText}>지역 저장</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devBtn, { backgroundColor: '#FCA5A5' }]}
              onPress={handleReset}
            >
              <Text style={styles.devBtnText}>초기화 후 스플래시 다시보기</Text>
            </TouchableOpacity>
          </View>

          {/* ── 화면 ── */}
          {currentScreen === 'splash' && (
            <SplashScreen onFinish={handleSplashFinish} />
          )}

          {currentScreen === 'login' && (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          )}

          {currentScreen === 'child' && (
            <ChildInputScreen
              onBack={() => setCurrentScreen('login')}
              onComplete={(data) => {
                setChildProfile({
                  name: data.childName,
                  age: data.age,
                  concerns: data.concerns,
                });
                setCurrentScreen('home');
              }}
            />
          )}

          {currentScreen === 'home' && (
            <HomeScreen
              userName="정아름"
              hasChildInfo={!!childProfile}
              childInfo={
                childProfile
                  ? {
                      name: childProfile.name,
                      age: childProfile.age,
                      schoolStage:
                        childProfile.age <= 6 ? '미취학' : '초등 저학년',
                      concerns: childProfile.concerns ?? [],
                      isDualIncome: false,
                    }
                  : undefined
              }
              onTabChange={(tab) => setCurrentScreen(tab as Screen)}
              onRecommendClick={() => setCurrentScreen('recommend')}
              onRegisterChild={() => setCurrentScreen('child')}
              onEditChild={() => setCurrentScreen('child')}
              onNotificationClick={() => setCurrentScreen('notification')}
              onMapClick={() => setCurrentScreen('map')}
              onSupportClick={() => setCurrentScreen('benefit')}
              onAiReportClick={() => setCurrentScreen('aiReport')}
              onSearchClick={() => setCurrentScreen('search')}
            />
          )}

          {currentScreen === 'recommend' && (
            <RecommendScreen
              onTabChange={(tab) => setCurrentScreen(tab as Screen)}
              onComplete={(data) => {
                setFilterData(data);
                setCurrentScreen('recommendation');
              }}
              hasChildInfo={!!childProfile}
              childInfo={
                childProfile
                  ? {
                      name: childProfile.name,
                      age: childProfile.age,
                      ageGroup:
                        childProfile.age <= 6
                          ? '3-5세'
                          : childProfile.age <= 9
                            ? '6-9세'
                            : '10-13세',
                      schoolStage:
                        childProfile.age <= 6 ? '미취학' : '초등 저학년',
                    }
                  : undefined
              }
              onEditChild={() => setCurrentScreen('child')}
            />
          )}

          {currentScreen === 'recommendation' && (
            <RecommendationScreen
              childData={{
                childName: childProfile?.name ?? '아이',
                age: childProfile?.age ?? 0,
                concerns: childProfile?.concerns ?? [],
                region: filterData?.region,
                budget: filterData?.budget,
              }}
              onBack={() => setCurrentScreen('recommend')}
              onGoHome={() => setCurrentScreen('home')}
              onProgramClick={(program) => {
                setSelectedProgram(program);
                setProgramDetailBackScreen('recommendation');
                setCurrentScreen('programDetail');
              }}
            />
          )}

          {currentScreen === 'my' && (
            <MyPageScreen
              userName="정아름"
              hasChildInfo={!!childProfile}
              childName={childProfile?.name}
              childAge={childProfile?.age}
              childConcerns={childProfile?.concerns}
              onTabChange={(tab) => setCurrentScreen(tab as Screen)}
              onLogout={() => {
                logout();
                clearChildProfile();
                setTimeout(() => setCurrentScreen('splash'), 100);
              }}
              onRegisterChild={() => setCurrentScreen('child')}
              onEditProfile={(name) => {
                setEditUserName(name);
                setCurrentScreen('profileEdit');
              }}
              onNavigate={(screen) => {
                if (screen === 'applications') setCurrentScreen('myApplications');
                if (screen === 'saved') setCurrentScreen('savedList');
                if (screen === 'community') setCurrentScreen('myCommunity');
                if (screen === 'settings') setCurrentScreen('settings');
                if (screen === 'help') setCurrentScreen('help');
              }}
            />
          )}

          {currentScreen === 'apply' && (
            <ApplyScreen
              onTabChange={(tab) => setCurrentScreen(tab as Screen)}
              onSearchClick={() => setCurrentScreen('search')}
              onNotificationClick={() => setCurrentScreen('notification')}
            />
          )}

          {currentScreen === 'community' && (
            <CommunityScreen
              onTabChange={(tab) => setCurrentScreen(tab as Screen)}
              onPostClick={(post) => {
                setSelectedPost(post);
                setCurrentScreen('communityPost');
              }}
              onWriteClick={() => setCurrentScreen('communityWrite')}
              onSearchClick={() => setCurrentScreen('search')}
              onNotificationClick={() => setCurrentScreen('notification')}
            />
          )}

          {currentScreen === 'communityWrite' && (
            <CommunityWriteScreen
              onBack={() => setCurrentScreen('community')}
              onSubmit={() => setCurrentScreen('community')}
            />
          )}

          {currentScreen === 'communityPost' && selectedPost && (
            <CommunityPostScreen
              post={selectedPost}
              onBack={() => {
                setCurrentScreen('community');
                setSelectedPost(null);
              }}
            />
          )}

          {currentScreen === 'programDetail' && selectedProgram && (
            <ProgramDetailScreen
              program={selectedProgram}
              onBack={() => {
                setCurrentScreen(programDetailBackScreen);
                setSelectedProgram(null);
              }}
              onApply={(program) => {
                setSelectedProgram(program);
                setCurrentScreen('payment');
              }}
              onGoHome={() => {
                setSelectedProgram(null);
                setCurrentScreen('home');
              }}
            />
          )}

          {currentScreen === 'notification' && (
            <NotificationScreen onBack={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'notificationSettings' && (
            <NotificationSettingsScreen
              onBack={() => setCurrentScreen('notification')}
            />
          )}

          {currentScreen === 'profileEdit' && (
            <ProfileEditScreen
              userName={editUserName}
              onBack={() => setCurrentScreen('my')}
              onSave={(name, avatar) => {
                console.log('저장:', name, avatar);
                setCurrentScreen('my');
              }}
            />
          )}

          {currentScreen === 'myApplications' && (
            <MyApplicationsScreen onBack={() => setCurrentScreen('my')} />
          )}

          {currentScreen === 'aiReport' && (
            <AiReportScreen
              childInfo={{
                name: childProfile?.name ?? '아이',
                age: childProfile?.age ?? 0,
                concerns: childProfile?.concerns ?? [],
              }}
              userName="정아름"
              onBack={() => setCurrentScreen('home')}
              onSelectProgram={() => setCurrentScreen('recommend')}
            />
          )}

          {currentScreen === 'search' && (
            <SearchScreen
              onBack={() => {
                setSearchState({ query: '', searched: false });
                setCurrentScreen('home');
              }}
              initialQuery={searchState.query}
              initialSearched={searchState.searched}
              onSearchStateChange={setSearchState}
              onSelectProgram={(program) => {
                setSelectedProgram(program);
                setProgramDetailBackScreen('search');
                setCurrentScreen('programDetail');
              }}
            />
          )}

          {currentScreen === 'payment' && selectedProgram && (
            <PaymentScreen
              program={selectedProgram}
              onBack={() => setCurrentScreen('programDetail')}
              onComplete={() => setCurrentScreen('myApplications')}
              onGoHome={() => {
                setSelectedProgram(null);
                setCurrentScreen('home');
              }}
            />
          )}

          {currentScreen === 'savedList' && (
            <SavedListScreen onBack={() => setCurrentScreen('my')} />
          )}

          {currentScreen === 'map' && (
            <MapScreen onBack={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'myCommunity' && (
            <MyCommunityScreen onBack={() => setCurrentScreen('my')} />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              onBack={() => setCurrentScreen('my')}
              onLogout={() => {
                logout();
                clearChildProfile();
                setTimeout(() => setCurrentScreen('splash'), 100);
              }}
            />
          )}

          {currentScreen === 'help' && (
            <HelpCenterScreen onBack={() => setCurrentScreen('my')} />
          )}

          {currentScreen === 'benefit' && (
            <BenefitScreen
              userName="정아름"
              childName={childProfile?.name}
              childAge={childProfile?.age}
              childRegion="서울 강동구"
              hasChildInfo={!!childProfile}
              onBack={() => setCurrentScreen('home')}
              onRegisterChild={() => setCurrentScreen('child')}
              onNotificationClick={() => setCurrentScreen('notification')}
              onGoRecommendation={() => setCurrentScreen('recommendation')}
              onGoNotificationSettings={() =>
                setCurrentScreen('notificationSettings')
              }
              onGoMap={() => setCurrentScreen('map')}
            />
          )}
        </View>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  devPanel: {
    paddingTop: 55,
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  devBtn: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  devBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});