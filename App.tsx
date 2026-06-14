import React, { useEffect, useState } from 'react';
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

import RecruitingScreen from './src/screens/recruiting/RecruitingScreen';
import ApplicationFormScreen from './src/screens/application/ApplicationFormScreen';
import type {
  ApplicationInfo,
  CreatedApplication,
} from './src/screens/application/ApplicationFormScreen';
import PaymentScreen from './src/screens/application/PaymentScreen';
import type { PaymentSummary } from './src/screens/application/PaymentScreen';
import {
  buildPreferenceRequest,
  recommendationApi,
  type RecommendationItem,
} from './src/api/recommendation';
import ApplicationCompleteScreen from './src/screens/application/ApplicationCompleteScreen';
import MyApplicationsScreen from './src/screens/application/MyApplicationsScreen';
import type { Application } from './src/screens/application/MyApplicationsScreen';
import ApplicationDetailScreen from './src/screens/application/ApplicationDetailScreen';

import CommunityScreen from './src/screens/community/CommunityScreen';
import type { Post } from './src/screens/community/CommunityScreen';
import CommunityWriteScreen from './src/screens/community/CommunityWriteScreen';
import CommunityPostScreen from './src/screens/community/CommunityPostScreen';
import MyCommunityScreen from './src/screens/community/MyCommunityScreen';
import type { CommunityActivity } from './src/screens/community/MyCommunityScreen';
import type { PostDetail } from './src/api/community';

import MyPageScreen from './src/screens/mypage/MyPageScreen';
import ProfileEditScreen from './src/screens/mypage/ProfileEditScreen';
import SavedListScreen from './src/screens/mypage/SavedListScreen';
import SettingsScreen from './src/screens/mypage/SettingsScreen';
import HelpCenterScreen from './src/screens/mypage/HelpCenterScreen';

import NotificationScreen from './src/screens/notification/NotificationScreen';
import NotificationSettingsScreen from './src/screens/notification/NotificationSettingsScreen';
import * as Linking from 'expo-linking';

import SearchScreen from './src/screens/search/SearchScreen';

import {
  useAuthStore,
  useProfileStore,
  useRecommendFilterStore,
} from './src/store';
import ErrorBoundary from './src/components/ErrorBoundary';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import BenefitScreen from './src/screens/BenefitScreen';
import BenefitProfileInputScreen from './src/screens/benefit/BenefitProfileInputScreen';
import { tokenStorage } from './src/api/tokenStorage';
import { fetchChildren, registerChild, updateChild } from './src/api/child';



const DEV_ACCESS_TOKEN = process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN ?? '';

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
  | 'applicationForm'
  | 'payment'
  | 'applicationComplete'
  | 'community'
  | 'my'
  | 'communityWrite'
  | 'communityPost'
  | 'programDetail'
  | 'notification'
  | 'notificationSettings'
  | 'profileEdit'
  | 'myApplications'
  | 'applicationDetail'
  | 'aiReport'
  | 'search'
  | 'savedList'
  | 'map'
  | 'myCommunity'
  | 'settings'
  | 'help'
  | 'benefit'
  | 'benefitProfile';

export default function App() {
  useNetworkStatus();

  const { isLoggedIn, setTokens, logout } = useAuthStore();
  const { childProfile, setChildProfile, clearChildProfile } = useProfileStore();
  const { setRegion } = useRecommendFilterStore();

  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');

 

  const [applyInitialFilter, setApplyInitialFilter] = useState<string>('all');

useEffect(() => {
  const handleDeepLink = async (event: { url: string }) => {
    const parsed = Linking.parse(event.url);
    const accessToken = Array.isArray(parsed.queryParams?.accessToken)
      ? parsed.queryParams.accessToken[0]
      : parsed.queryParams?.accessToken;
    const refreshToken = Array.isArray(parsed.queryParams?.refreshToken)
      ? parsed.queryParams.refreshToken[0]
      : parsed.queryParams?.refreshToken;

    if (accessToken && refreshToken) {
  await tokenStorage.setAccessToken(accessToken);
  await tokenStorage.setRefreshToken(refreshToken);
  setTokens(accessToken, refreshToken);

  try {
    const children = await fetchChildren();
    console.log('딥링크 children 응답:', JSON.stringify(children));
    if (children.length > 0) {
      const child = children[0];
      setChildProfile({
        id: child.childId,
        name: child.childName,
        age: child.age,
        concerns: child.concerns,
      });
    }
  } catch (e) {
    console.warn('딥링크 자녀 정보 조회 실패', e);
  }

  setCurrentScreen('home');
}
  };

  const subscription = Linking.addEventListener('url', handleDeepLink);

  // 앱이 종료된 상태에서 딥링크로 열린 경우
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  return () => subscription.remove();
}, []);
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
  const [recommendationPreferenceId, setRecommendationPreferenceId] =
    useState<number | null>(null);
  const [recommendationItems, setRecommendationItems] = useState<
    RecommendationItem[]
  >([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationErrorMessage, setRecommendationErrorMessage] =
    useState('');


  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [communityPostBackScreen, setCommunityPostBackScreen] =
    useState<Screen>('community');
  const [editPost, setEditPost] = useState<PostDetail | null>(null);

  const [selectedProgram, setSelectedProgram] =
    useState<ProgramDetail | null>(null);
  const [programDetailBackScreen, setProgramDetailBackScreen] =
    useState<Screen>('recommendation');

  const [applicationInfo, setApplicationInfo] =
    useState<ApplicationInfo | null>(null);
  const [createdApplication, setCreatedApplication] =
    useState<CreatedApplication | null>(null);
  const [paymentSummary, setPaymentSummary] =
    useState<PaymentSummary | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);

  const [searchState, setSearchState] = useState<SearchScreenState>({
    query: '',
    searched: false,
  });

  const [editUserName, setEditUserName] = useState<string>('');
  const [profileEditBackScreen, setProfileEditBackScreen] =
    useState<Screen>('my');

  const [benefitProfileBackScreen, setBenefitProfileBackScreen] =
    useState<Screen>('benefit');
  const [benefitProfileNextScreen, setBenefitProfileNextScreen] =
    useState<Screen>('benefit');

  const clearApplicationFlow = () => {
    setApplicationInfo(null);
    setCreatedApplication(null);
    setPaymentSummary(null);
    setSelectedApplication(null);
  };

  const handleSplashFinish = async () => {
  const accessToken = await tokenStorage.getAccessToken();
  const refreshToken = await tokenStorage.getRefreshToken();

  if (accessToken) {
  setTokens(accessToken, refreshToken ?? '');
  clearChildProfile();

    try {
    const children = await fetchChildren();
    console.log('SplashFinish children 응답:', JSON.stringify(children));
    if (children.length > 0) {
      const child = children[0];
      setChildProfile({
        id: child.childId,
        name: child.childName,
        age: child.age,
        concerns: child.concerns,
      });
    }
  } catch (e) {
    console.warn('자녀 정보 조회 실패', e);
  }

  setCurrentScreen('home');
  return;
}

  if (!isLoggedIn) {
    setCurrentScreen('login');
  } else {
    setCurrentScreen('home');
  }
};

const handleDevLogin = () => {
  if (!DEV_ACCESS_TOKEN) {
    console.warn(
      'EXPO_PUBLIC_DEV_ACCESS_TOKEN이 없습니다. 프론트 .env에 로컬 JWT를 넣어주세요.',
    );
    return;
  }
  setTokens(DEV_ACCESS_TOKEN, '');
};

  const handleLoginSuccess = async () => {
  const accessToken = await tokenStorage.getAccessToken();
  const refreshToken = await tokenStorage.getRefreshToken();

  if (!accessToken) {
    console.warn('카카오 로그인 후 저장된 accessToken이 없습니다.');
    setCurrentScreen('login');
    return;
  }

  setTokens(accessToken, refreshToken ?? '');

  try {
    const children = await fetchChildren();
    console.log('children 응답:', JSON.stringify(children));
    if (children.length > 0) {
      const child = children[0];
      setChildProfile({
        id: child.childId,
        name: child.childName,
        age: child.age,
        concerns: child.concerns,
      });
    }
  } catch (e) {
    console.warn('자녀 정보 조회 실패', e);
  }

  setCurrentScreen('home');
};

  const handleReset = () => {
    logout();
    clearChildProfile();
    setSelectedPost(null);
    setEditPost(null);
    setCommunityPostBackScreen('community');
    setSelectedProgram(null);
    clearApplicationFlow();
    setSearchState({ query: '', searched: false });
    setProfileEditBackScreen('my');
    setBenefitProfileBackScreen('benefit');
    setTimeout(() => setCurrentScreen('splash'), 100);
  };

  const handleGoHome = () => {
    setSelectedPost(null);
    setEditPost(null);
    setCommunityPostBackScreen('community');
    setSelectedProgram(null);
    clearApplicationFlow();
    setProfileEditBackScreen('my');
    setBenefitProfileBackScreen('benefit');
    setCurrentScreen('home');
  };

  const handleCommunityActivityPress = (activity: CommunityActivity) => {
    setSelectedPost(activity.post);
    setCommunityPostBackScreen('myCommunity');
    setCurrentScreen('communityPost');
  };

  const handleLogout = () => {
    logout();
    clearChildProfile();
    setSelectedPost(null);
    setEditPost(null);
    setCommunityPostBackScreen('community');
    setSelectedProgram(null);
    clearApplicationFlow();
    setSearchState({ query: '', searched: false });
    setProfileEditBackScreen('my');
    setBenefitProfileBackScreen('benefit');
    setTimeout(() => setCurrentScreen('splash'), 100);
  };

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <View style={styles.root}>
        
          {false && (
          <View style={styles.devPanel}>
            <TouchableOpacity
              style={[styles.devBtn, { backgroundColor: '#FFD93D' }]}
              onPress={handleDevLogin}
            >
              <Text style={styles.devBtnText}>로컬 JWT 로그인 저장</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.devBtn, { backgroundColor: '#BAE6FD' }]}
              onPress={() =>
                setChildProfile({
                  id: 1,
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
  )}

          {currentScreen === 'splash' && (
            <SplashScreen onFinish={handleSplashFinish} />
          )}

          {currentScreen === 'login' && (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          )}

          {currentScreen === 'child' && (
            <ChildInputScreen
              onBack={() => setCurrentScreen('login')}
              onComplete={async (data) => {
  try {
    const birthDate = `${new Date().getFullYear() - data.age}-01-01`;
    
    if (childProfile?.id) {
      // 기존 자녀 수정
      const updated = await updateChild(childProfile.id, {
        childName: data.childName,
        birthDate,
        concerns: data.concerns,
      });
      setChildProfile({
        id: updated.childId,
        name: updated.childName,
        age: updated.age,
        concerns: updated.concerns,
      });
    } else {
      // 신규 등록
      const created = await registerChild({
        childName: data.childName,
        birthDate,
        concerns: data.concerns,
      });
      setChildProfile({
        id: created.childId,
        name: created.childName,
        age: created.age,
        concerns: created.concerns,
      });
    }
  } catch (e) {
    console.error('자녀 등록/수정 실패', e);
  }
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
              onAiReportClick={() => {
                if (!childProfile?.id) {
                  setCurrentScreen('child');
                  return;
                }

                setBenefitProfileBackScreen('home');
                setBenefitProfileNextScreen('aiReport');
                setCurrentScreen('benefitProfile');
              }}
              onSearchClick={() => setCurrentScreen('search')}
              onUrgentMoreClick={() => {
      setApplyInitialFilter('urgent');
      setCurrentScreen('apply');
    }}
    onOnlineMoreClick={() => {          // 추가
      setApplyInitialFilter('online');
      setCurrentScreen('apply');
    }}
    onProgramClick={(program) => {
      setSelectedProgram(program);
      setProgramDetailBackScreen('home');
      clearApplicationFlow();
      setCurrentScreen('programDetail');
    }}
            />
          )}

          {currentScreen === 'recommend' && (
            <RecommendScreen
              onTabChange={(tab) => setCurrentScreen(tab as Screen)}
              onComplete={async (data) => {
                setFilterData(data);
                setRecommendationPreferenceId(null);
                setRecommendationItems([]);
                setRecommendationErrorMessage('');

                if (!childProfile?.id) {
                  setRecommendationErrorMessage(
                    '추천 결과를 조회하려면 자녀 정보 저장이 필요합니다.',
                  );
                  setCurrentScreen('recommendation');
                  return;
                }

                try {
                  setRecommendationLoading(true);

                  const preferenceRequest = buildPreferenceRequest(
                    childProfile.id,
                    data,
                  );
                  const preferenceId =
                    await recommendationApi.savePreference(preferenceRequest);
                  const recommendationPage =
                    await recommendationApi.getRecommendations(
                      childProfile.id,
                      preferenceId,
                      0,
                      20,
                    );

                  setRecommendationPreferenceId(preferenceId);
                  setRecommendationItems(recommendationPage.content);
                } catch (error) {
                  console.error('추천 결과 조회 실패', error);
                  setRecommendationErrorMessage(
                    '추천 결과를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.',
                  );
                } finally {
                  setRecommendationLoading(false);
                  setCurrentScreen('recommendation');
                }
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
              preferenceId={recommendationPreferenceId}
              recommendations={recommendationItems}
              loading={recommendationLoading}
              errorMessage={recommendationErrorMessage}
              onBack={() => setCurrentScreen('recommend')}
              onGoHome={() => setCurrentScreen('home')}
              onProgramClick={(program) => {
                setSelectedProgram(program);
                setProgramDetailBackScreen('recommendation');
                clearApplicationFlow();
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
              onLogout={handleLogout}
              onRegisterChild={() => setCurrentScreen('child')}
              onEditProfile={(name) => {
                setEditUserName(name);
                setProfileEditBackScreen('my');
    setBenefitProfileBackScreen('benefit');
                setCurrentScreen('profileEdit');
              }}
              onNavigate={(screen) => {
                if (screen === 'applications') {
                  setSelectedApplication(null);
                  setCurrentScreen('myApplications');
                }
                if (screen === 'saved') {
                  setSelectedProgram(null);
                  setCurrentScreen('savedList');
                }
                if (screen === 'benefitProfile') {
                  setBenefitProfileBackScreen('my');
                  setBenefitProfileNextScreen('benefit');
                  setCurrentScreen('benefitProfile');
                }
                if (screen === 'community') setCurrentScreen('myCommunity');
                if (screen === 'notifications') {
                  setCurrentScreen('notificationSettings');
                }
                if (screen === 'settings') setCurrentScreen('settings');
                if (screen === 'help') setCurrentScreen('help');
              }}
            />
          )}

          {currentScreen === 'apply' && (
  <RecruitingScreen
    initialFilter={applyInitialFilter}
    onTabChange={(tab) => {
      setApplyInitialFilter('all');
      setCurrentScreen(tab as Screen);
    }}
    onSearchClick={() => setCurrentScreen('search')}
    onNotificationClick={() => setCurrentScreen('notification')}
    onProgramClick={(program) => {
      setSelectedProgram(program);
      setProgramDetailBackScreen('apply');
      clearApplicationFlow();
      setCurrentScreen('programDetail');
    }}
  />
)}

          {currentScreen === 'community' && (
            <CommunityScreen
              onTabChange={(tab) => setCurrentScreen(tab as Screen)}
              onPostClick={(post) => {
                setSelectedPost(post);
                setCommunityPostBackScreen('community');
                setCurrentScreen('communityPost');
              }}
              onWriteClick={() => {
                setEditPost(null);
                setCurrentScreen('communityWrite');
              }}
              onSearchClick={() => setCurrentScreen('search')}
              onNotificationClick={() => setCurrentScreen('notification')}
            />
          )}

          {currentScreen === 'communityWrite' && (
            <CommunityWriteScreen
              onBack={() => {
                if (editPost) {
                  setCurrentScreen('communityPost');
                } else {
                  setCurrentScreen('community');
                }
              }}
              onSubmit={() => {
                setEditPost(null);
                setCurrentScreen('community');
              }}
              editPost={editPost ?? undefined}
            />
          )}

          {currentScreen === 'communityPost' && selectedPost && (
            <CommunityPostScreen
              post={selectedPost}
              onBack={() => {
                setCurrentScreen(communityPostBackScreen);
                setSelectedPost(null);
                setEditPost(null);
                setCommunityPostBackScreen('community');
              }}
              onEdit={(postDetail) => {
                setEditPost(postDetail);
                setCurrentScreen('communityWrite');
              }}
            />
          )}

          {currentScreen === 'programDetail' && selectedProgram && (
            <ProgramDetailScreen
              program={selectedProgram}
              preferenceId={
                programDetailBackScreen === 'recommendation'
                  ? recommendationPreferenceId
                  : null
              }
              childId={childProfile?.id ?? null}
              onBack={() => {
                setCurrentScreen(programDetailBackScreen);
                setSelectedProgram(null);
              }}
              onApply={(program) => {
                setSelectedProgram(program);
                clearApplicationFlow();
                setCurrentScreen('applicationForm');
              }}
              onGoHome={handleGoHome}
            />
          )}

          {currentScreen === 'applicationForm' && selectedProgram && (
            <ApplicationFormScreen
              program={selectedProgram}
              childId={childProfile?.id}
              initialChildName={childProfile?.name ?? ''}
              initialParentName="정아름"
              onBack={() => setCurrentScreen('programDetail')}
              onNext={(info, application) => {
                setApplicationInfo(info);
                setCreatedApplication(application);
                setCurrentScreen('payment');
              }}
              onGoHome={handleGoHome}
            />
          )}

          {currentScreen === 'payment' &&
            selectedProgram &&
            applicationInfo &&
            createdApplication && (
              <PaymentScreen
                program={selectedProgram}
                applicationInfo={applicationInfo}
                createdApplication={createdApplication}
                onBack={() => setCurrentScreen('applicationForm')}
                onComplete={(summary) => {
                  setPaymentSummary(summary);
                  setCurrentScreen('applicationComplete');
                }}
                onGoHome={handleGoHome}
              />
            )}

          {currentScreen === 'applicationComplete' &&
            selectedProgram &&
            applicationInfo &&
            paymentSummary &&
            createdApplication && (
              <ApplicationCompleteScreen
                program={selectedProgram}
                applicationInfo={applicationInfo}
                paymentSummary={paymentSummary}
                createdApplication={createdApplication}
                applicationId={createdApplication.applicationId}
                onGoApplications={() => {
                  setSelectedProgram(null);
                  clearApplicationFlow();
                  setCurrentScreen('myApplications');
                }}
                onGoHome={handleGoHome}
              />
            )}

          {currentScreen === 'notification' && (
            <NotificationScreen onBack={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'notificationSettings' && (
            <NotificationSettingsScreen onBack={() => setCurrentScreen('my')} />
          )}

          {currentScreen === 'profileEdit' && (
            <ProfileEditScreen
              userName={editUserName}
              onBack={() => setCurrentScreen(profileEditBackScreen)}
              onSave={(name, avatar) => {
                console.log('저장:', name, avatar);
                setCurrentScreen(profileEditBackScreen);
              }}
            />
          )}

          {currentScreen === 'myApplications' && (
            <MyApplicationsScreen
              onBack={() => {
                setSelectedApplication(null);
                setCurrentScreen('my');
              }}
              onApplicationPress={(application) => {
                setSelectedApplication(application);
                setCurrentScreen('applicationDetail');
              }}
            />
          )}

          {currentScreen === 'applicationDetail' && selectedApplication && (
            <ApplicationDetailScreen
              application={selectedApplication}
              onBack={() => {
                setSelectedApplication(null);
                setCurrentScreen('myApplications');
              }}
            />
          )}

          {currentScreen === 'aiReport' && (
            <AiReportScreen
              childId={childProfile?.id ?? null}
              childInfo={{
                name: childProfile?.name ?? '아이',
                age: childProfile?.age ?? 0,
                concerns: childProfile?.concerns ?? [],
              }}
              userName="정아름"
              onBack={() => setCurrentScreen('home')}
              onSelectBenefit={() => setCurrentScreen('benefit')}
              onSelectFreePrograms={() => setCurrentScreen('apply')}
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
                clearApplicationFlow();
                setCurrentScreen('programDetail');
              }}
            />
          )}

          {currentScreen === 'savedList' && (
            <SavedListScreen
              onBack={() => setCurrentScreen('my')}
              onApplyPress={(program) => {
                const priceValue =
                  program.price === '무료'
                    ? 0
                    : Number(program.price.replace(/[^0-9]/g, '')) || 0;

                const savedProgramDetail: ProgramDetail = {
                  id: program.id,
                  title: program.title,
                  organization: program.organization,
                  type: program.location === '온라인' ? 'online' : 'private',
                  location: program.location,
                  address: program.location,
                  distance: program.location === '온라인' ? '-' : '2.1km',
                  price: program.price,
                  priceValue,
                  rating: program.rating,
                  reviewCount: 12,
                  ageRange: '3~13세',
                  schedule: '운영 일정 확인 필요',
                  score: 92,
                  isOpen: program.isOpen,
                  tags: ['저장한 프로그램', '맞춤 추천'],
                  description: `${program.organization}에서 운영하는 ${program.title}입니다. 자녀의 관심사와 조건에 맞춰 추천된 프로그램입니다.`,
                  curriculum: [
                    '프로그램 소개 및 오리엔테이션',
                    '아이 수준에 맞춘 기초 활동',
                    '실습 중심의 참여형 수업',
                    '마무리 활동 및 보호자 피드백',
                  ],
                  contact: '02-0000-0000',
                  capacity: 20,
                  enrolled: program.isOpen ? 12 : 20,
                  startDate: '2024.04.01',
                  endDate: '2024.06.30',
                  isPartner: true,
                  aiReason:
                    '저장한 프로그램 중 자녀 조건과 관심사에 잘 맞는 프로그램입니다.',
                  reviewChips: ['만족도 높음', '친절한 설명', '아이 흥미 유도'],
                  matchRate: 92,
                };

                setSelectedProgram(savedProgramDetail);
                setProgramDetailBackScreen('savedList');
                clearApplicationFlow();
                setCurrentScreen('programDetail');
              }}
            />
          )}

          {currentScreen === 'map' && (
            <MapScreen onBack={() => setCurrentScreen('home')} />
          )}

          {currentScreen === 'myCommunity' && (
            <MyCommunityScreen
              onBack={() => setCurrentScreen('my')}
              onActivityPress={handleCommunityActivityPress}
            />
          )}

          {currentScreen === 'settings' && (
            <SettingsScreen
              onBack={() => setCurrentScreen('my')}
              onProfilePress={() => {
                setEditUserName('정아름');
                setProfileEditBackScreen('settings');
                setCurrentScreen('profileEdit');
              }}
              onLogout={handleLogout}
            />
          )}

          {currentScreen === 'help' && (
  <HelpCenterScreen onBack={() => setCurrentScreen('my')} />
)}

{currentScreen === 'benefitProfile' && (
            <BenefitProfileInputScreen
              childId={childProfile?.id ?? null}
              childName={childProfile?.name ?? '아이'}
              onBack={() => setCurrentScreen(benefitProfileBackScreen)}
              onSaved={() => {
                const nextScreen = benefitProfileNextScreen;
                setBenefitProfileNextScreen('benefit');
                setCurrentScreen(nextScreen);
              }}
            />
          )}

          {currentScreen === 'benefit' && (() => {
  console.log('childProfile:', JSON.stringify(childProfile));
  return (
    <BenefitScreen
      userName="정아름"
      childName={childProfile?.name}
      childAge={childProfile?.age}
      childId={childProfile?.id}
      childRegion="서울 강동구"
      hasChildInfo={!!childProfile}
      onBack={() => setCurrentScreen('home')}
      onRegisterChild={() => setCurrentScreen('child')}
      onBenefitProfileInput={() => {
        setBenefitProfileBackScreen('benefit');
        setBenefitProfileNextScreen('benefit');
        setCurrentScreen('benefitProfile');
      }}
      onNotificationClick={() => setCurrentScreen('notification')}
      onGoRecommendation={() => setCurrentScreen('recommendation')}
      onGoNotificationSettings={() =>
        setCurrentScreen('notificationSettings')
      }
      onGoMap={() => setCurrentScreen('map')}
    />
  );
})()}
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

  backendStatus: {
  paddingTop: 50,
  paddingBottom: 8,
  textAlign: 'center',
  backgroundColor: '#E0F2FE',
  color: '#0369A1',
  fontSize: 14,
  fontWeight: '700',
},
});
