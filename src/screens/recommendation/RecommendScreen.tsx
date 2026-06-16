import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants';
 
export interface FilterData {
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
 
interface RecommendScreenProps {
  onTabChange: (tab: string) => void;
  onComplete: (data: FilterData) => void;
  hasChildInfo?: boolean;
  childInfo?: {
    name: string;
    age: number;
    ageGroup: string;
    schoolStage: string;
  };
  onEditChild?: () => void;
}
 
const SEOUL_DISTRICTS = [
  '강남구','강동구','강북구','강서구','관악구','광진구','구로구','금천구',
  '노원구','도봉구','동대문구','동작구','마포구','서대문구','서초구','성동구',
  '성북구','송파구','양천구','영등포구','용산구','은평구','종로구','중구','중랑구',
];
 
const BUDGET_OPTIONS = ['무료', '0~10만원', '10~20만원', '20만원+', '무관'];
 
const CLASS_TYPE_OPTIONS = [
  { icon: '👥', label: '소규모 (5명 이하)', desc: '집중적인 개인 케어 가능' },
  { icon: '👨‍👩‍👧', label: '중규모 (6~10명)', desc: '또래 친구와 함께 성장' },
  { icon: '🧑‍🏫', label: '1:1 개인', desc: '완전 맞춤형 수업' },
  { icon: '💻', label: '온라인', desc: '집에서 편하게' },
  { icon: '🏠', label: '방문 수업', desc: '선생님이 직접 방문' },
];
 
const CONCERN_CATEGORIES = [
  { category: '학습/교육', items: ['기초학습 부족', '학습습관 필요', '특정 과목 보완 필요'] },
  { category: '돌봄/시간', items: ['맡길 곳 필요', '가족 돌봄 정보', '방학/휴일 돌봄'] },
  { category: '사회성/정서', items: ['친구관계', '자신감 부족', '감정조절'] },
  { category: '생활/습관', items: ['게임 과몰입', '집중력 부족', '자기주도 학습 어려움'] },
  { category: '현실 고민', items: ['비용 부담', '선택 어려움'] },
];
 
const SUBJECT_OPTIONS: Record<string, string[]> = {
  '학교 교과': ['국어', '수학', '영어', '사회', '과학'],
  '사고력/디지털': ['한자', '논술', '코딩'],
  '예체능': ['미술', '음악', '체육', '축구', '태권도', '수영', '댄스'],
};
 
const babyIcon = require('../../../assets/baby_icon_no_bg.png');
 
// ── AI 배너 ──────────────────────────────────────────────────────────────
function AIBanner({ childName, confidence }: { childName: string; confidence: number }) {
  const [displayed, setDisplayed] = useState(0);
 
  useEffect(() => {
    setDisplayed(0);
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(prev => {
          if (prev >= confidence) { clearInterval(interval); return confidence; }
          return prev + 1;
        });
      }, 18);
      return () => clearInterval(interval);
    }, 100);
    return () => clearTimeout(timer);
  }, [confidence]);
 
  return (
    <View style={banner.wrap}>
      <View style={banner.left}>
        <Text style={banner.star}>✦</Text>
        <Text style={banner.text}>AI가 {childName}에게 딱 맞는 조건을 분석하고 있어요</Text>
      </View>
      <View style={banner.badge}>
        <Text style={banner.badgeText}>✦ {displayed}%</Text>
      </View>
    </View>
  );
}
 
const banner = StyleSheet.create({
  wrap: {
    backgroundColor: '#EBF8FF',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#BEE3F8',
    marginBottom: 20,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  star: { fontSize: 14, color: '#3182CE' },
  text: { fontSize: 12, fontWeight: '600', color: '#1A365D', flex: 1 },
  badge: { backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 20, minWidth: 52, alignItems: 'center' },
  badgeText: { fontSize: 13, fontWeight: '700', color: '#3182CE' },
});
 
// ── 메인 ─────────────────────────────────────────────────────────────────
export default function RecommendScreen({ onTabChange, onComplete, hasChildInfo, childInfo, onEditChild }: RecommendScreenProps) {
  const TOTAL_STEPS = 6;
  const [step, setStep] = useState(1);
  const [filterData, setFilterData] = useState<FilterData>({
    ageGroup: '', region: '', budget: '', travelMode: '', travelTime: '',
    onlineOption: '', classType: '', concerns: [], subjectDetails: [],
  });
 
  useEffect(() => {
    if (childInfo?.ageGroup) {
      setFilterData(prev => ({ ...prev, ageGroup: childInfo.ageGroup.split(' ')[0] }));
    }
  }, [childInfo]);
 
  const getConfidence = () => ({ 1: 10, 2: 32, 3: 54, 4: 66, 5: 82, 6: 95 }[step] ?? 10);
  const childName = childInfo?.name ?? '아이';
 
  const canProceed = () => {
    switch (step) {
      case 1: return filterData.ageGroup !== '' || !!childInfo;
      case 2: return filterData.region !== '';
      case 3: return filterData.budget !== '';
      case 4: return filterData.onlineOption !== '';
      case 5: return filterData.classType !== '';
      case 6: return true;
      default: return false;
    }
  };
 
  const handleNext = () => { if (step < TOTAL_STEPS) setStep(step + 1); else onComplete(filterData); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };
  const handleHome = () => onTabChange('home');
 
  const toggleConcern = (concern: string) => {
    setFilterData(prev => {
      const newConcerns = prev.concerns.includes(concern)
        ? prev.concerns.filter(c => c !== concern)
        : prev.concerns.length < 3 ? [...prev.concerns, concern] : prev.concerns;
      return { ...prev, concerns: newConcerns };
    });
  };
 
  const toggleSubject = (subject: string) => {
    setFilterData(prev => ({
      ...prev,
      subjectDetails: prev.subjectDetails.includes(subject)
        ? prev.subjectDetails.filter(s => s !== subject)
        : [...prev.subjectDetails, subject],
    }));
  };
 
  const showSubjectDetails = filterData.concerns.includes('특정 과목 보완 필요');
  const progressWidth = `${(step / TOTAL_STEPS) * 100}%`;
 
  return (
    <SafeAreaView style={s.root}>
      {/* 헤더 */}
      <View style={s.header}>
        {step > 1 ? (
          <TouchableOpacity style={s.backBtn} onPress={handleBack}>
            <Text style={s.backBtnText}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
        <Text style={s.headerTitle}>맞춤 추천</Text>
        <TouchableOpacity style={s.closeBtn} onPress={handleHome}>
          <Text style={s.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
 
      {/* 프로그레스 바 */}
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: progressWidth as any }]} />
      </View>
 
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {step >= 3 && <AIBanner childName={childName} confidence={getConfidence()} />}
 
        {/* 1단계: 아이 정보 확인 또는 연령대 선택 */}
        {step === 1 && (
          <View style={s.stepContainer}>
            {childInfo ? (
              <>
                <Text style={s.stepTitle}>입력하신 정보가 맞나요?</Text>
                <Text style={s.stepDesc}>정보를 확인하고 다음 단계로 이동해 주세요.</Text>
                <View style={s.childCard}>
                  <View style={s.childCardLeft}>
                    <View style={s.childAvatar}>
                      <Image source={babyIcon} style={s.childAvatarImage} resizeMode="contain" />
                    </View>
                    <View>
                      <Text style={s.childName}>{childInfo.name} <Text style={s.childAge}>· {childInfo.age}세</Text></Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        <View style={s.stageBadge}><Text style={s.stageBadgeText}>{childInfo.schoolStage}</Text></View>
                        <View style={s.ageBadge}><Text style={s.ageBadgeText}>{childInfo.ageGroup}</Text></View>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={s.editBtn} onPress={onEditChild}>
                    <Text style={{ fontSize: 16 }}>✏️</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={s.stepTitle}>자녀 연령대를 선택해 주세요</Text>
                <Text style={s.stepDesc}>연령에 맞는 프로그램을 추천해 드릴게요</Text>
                {['3-5세 (영유아)', '6-9세 (초등 저학년)', '10-13세 (초등 고학년)'].map(age => {
                  const value = age.split(' ')[0];
                  const selected = filterData.ageGroup === value;
                  return (
                    <TouchableOpacity
                      key={age}
                      style={[s.optionBtn, selected && s.optionBtnSelected]}
                      onPress={() => setFilterData({ ...filterData, ageGroup: value })}
                    >
                      <Text style={[s.optionBtnText, selected && s.optionBtnTextSelected]}>{age}</Text>
                      {selected && <Text style={{ color: colors.primary.default }}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </>
            )}
          </View>
        )}
 
        {/* 2단계: 지역 선택 */}
        {step === 2 && (
          <View style={s.stepContainer}>
            <Text style={s.stepTitle}>어디에서 서비스를 찾으세요?</Text>
            <Text style={s.stepDesc}>서울 지역을 선택해 주세요</Text>
            <AIBanner childName={childName} confidence={getConfidence()} />
            <View style={s.districtGrid}>
              {SEOUL_DISTRICTS.map(district => {
                const selected = filterData.region === district;
                return (
                  <TouchableOpacity
                    key={district}
                    style={[s.districtBtn, selected && s.districtBtnSelected]}
                    onPress={() => setFilterData({ ...filterData, region: district })}
                  >
                    <Text style={[s.districtBtnText, selected && s.districtBtnTextSelected]}>
                      📍 {district}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
 
        {/* 3단계: 예산 */}
        {step === 3 && (
          <View style={s.stepContainer}>
            <Text style={s.stepTitle}>희망하는 수업료 범위가 어떻게 돼요? 💰</Text>
            <Text style={s.stepDesc}>선택하신 범위 내에서 프로그램을 찾아드릴게요</Text>
            {BUDGET_OPTIONS.map(option => {
              const selected = filterData.budget === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[s.budgetBtn, selected && s.budgetBtnSelected]}
                  onPress={() => setFilterData({ ...filterData, budget: option })}
                >
                  <Text style={[s.budgetBtnText, selected && s.budgetBtnTextSelected]}>{option}</Text>
                  {selected && <Text style={{ color: '#F9A825', fontWeight: '700' }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
 
        {/* 4단계: 온라인 옵션 */}
        {step === 4 && (
          <View style={s.stepContainer}>
            <Text style={s.stepTitle}>온라인과 오프라인, 어느 쪽을 선호하세요?</Text>
            <Text style={s.stepDesc}>둘 다 괜찮다면 '상관없어요'를 선택해 주세요</Text>
            {[
              { v: '온라인', l: '온라인 수업도 좋아요' },
              { v: '오프라인', l: '오프라인만 원해요' },
              { v: '무관', l: '상관없어요' },
            ].map(o => {
              const selected = filterData.onlineOption === o.v;
              return (
                <TouchableOpacity
                  key={o.v}
                  style={[s.optionBtn, selected && s.optionBtnSelected]}
                  onPress={() => setFilterData({ ...filterData, onlineOption: o.v })}
                >
                  <Text style={[s.optionBtnText, selected && s.optionBtnTextSelected]}>{o.l}</Text>
                  {selected && <Text style={{ color: colors.primary.default }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
 
        {/* 5단계: 수업방식 */}
        {step === 5 && (
          <View style={s.stepContainer}>
            <Text style={s.stepTitle}>수업 방식은요? 📚</Text>
            <Text style={s.stepDesc}>아이에게 맞는 수업 환경을 선택해주세요</Text>
            {CLASS_TYPE_OPTIONS.map(c => {
              const selected = filterData.classType === c.label;
              return (
                <TouchableOpacity
                  key={c.label}
                  style={[s.classTypeBtn, selected && s.classTypeBtnSelected]}
                  onPress={() => setFilterData({ ...filterData, classType: c.label })}
                >
                  <Text style={{ fontSize: 22 }}>{c.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.classTypeBtnTitle, selected && s.classTypeBtnTitleSelected]}>{c.label}</Text>
                    <Text style={s.classTypeBtnDesc}>{c.desc}</Text>
                  </View>
                  {selected && <Text style={{ color: '#F9A825', fontWeight: '700' }}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
 
        {/* 6단계: 고민 선택 */}
        {step === 6 && (
          <View style={s.stepContainer}>
            <Text style={s.stepTitle}>어떤 고민이 있으세요?</Text>
            <Text style={s.stepDesc}>최대 3개까지 선택할 수 있어요</Text>
            {CONCERN_CATEGORIES.map(cat => (
              <View key={cat.category} style={{ marginBottom: 16 }}>
                <Text style={s.sectionLabel}>{cat.category}</Text>
                <View style={s.concernRow}>
                  {cat.items.map(item => {
                    const selected = filterData.concerns.includes(item);
                    const disabled = !selected && filterData.concerns.length >= 3;
                    return (
                      <TouchableOpacity
                        key={item}
                        style={[s.concernChip, selected && s.concernChipSelected, disabled && s.concernChipDisabled]}
                        onPress={() => !disabled && toggleConcern(item)}
                      >
                        <Text style={[s.concernChipText, selected && s.concernChipTextSelected]}>{item}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ))}
            {showSubjectDetails && (
              <View style={s.subjectBox}>
                <Text style={s.sectionLabel}>보완이 필요한 과목을 선택해 주세요</Text>
                {Object.entries(SUBJECT_OPTIONS).map(([group, subjects]) => (
                  <View key={group} style={{ marginTop: 12 }}>
                    <Text style={s.subjectGroup}>{group}</Text>
                    <View style={s.concernRow}>
                      {subjects.map(subject => {
                        const selected = filterData.subjectDetails.includes(subject);
                        return (
                          <TouchableOpacity
                            key={subject}
                            style={[s.concernChip, selected && s.concernChipSelected]}
                            onPress={() => toggleSubject(subject)}
                          >
                            <Text style={[s.concernChipText, selected && s.concernChipTextSelected]}>{subject}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
 
      {/* 하단 버튼 */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.nextBtn, !canProceed() && s.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={s.nextBtnText}>
            {step === TOTAL_STEPS ? '✦ AI 추천 결과 보기' : `다음 단계 (${step}/${TOTAL_STEPS}) →`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
 
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backBtnText: { fontSize: 20, color: '#1A1A1A' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { fontSize: 18, color: '#888' },
 
  progressBg: { height: 4, backgroundColor: '#F0F0F0' },
  progressFill: { height: 4, backgroundColor: colors.primary.default },
 
  scroll: { padding: 24, paddingBottom: 160 },
  stepContainer: { gap: 12 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  stepDesc: { fontSize: 13, color: '#888', marginBottom: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginBottom: 8 },
 
  childCard: { backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#FFE08A', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  childCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  childAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF3CD', alignItems: 'center', justifyContent: 'center' },
  childAvatarImage: { width: 44, height: 44 },
  childName: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  childAge: { fontSize: 13, fontWeight: '400', color: '#888' },
  stageBadge: { backgroundColor: '#FFF3CD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  stageBadgeText: { fontSize: 11, fontWeight: '700', color: '#F9A825' },
  ageBadge: { backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  ageBadgeText: { fontSize: 11, color: '#888' },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
 
  optionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 16, backgroundColor: '#fff' },
  optionBtnSelected: { borderColor: colors.primary.default, backgroundColor: '#FFF9E6' },
  optionBtnText: { fontSize: 14, fontWeight: '500', color: '#1A1A1A' },
  optionBtnTextSelected: { color: colors.primary.default, fontWeight: '600' },
 
  districtGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  districtBtn: { width: '30%', height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  districtBtnSelected: { borderColor: colors.primary.default, backgroundColor: colors.primary.default },
  districtBtnText: { fontSize: 11, fontWeight: '500', color: '#1A1A1A' },
  districtBtnTextSelected: { color: '#fff', fontWeight: '700' },
 
  budgetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, borderRadius: 16, borderWidth: 2, borderColor: '#F0F0F0', backgroundColor: '#F9F9F9', marginBottom: 8 },
  budgetBtnSelected: { borderColor: '#F9A825', backgroundColor: '#FFE082' },
  budgetBtnText: { fontSize: 14, fontWeight: '600', color: '#4A5568' },
  budgetBtnTextSelected: { color: '#7B5E00' },
 
  classTypeBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, borderWidth: 2, borderColor: '#F0F0F0', backgroundColor: '#F9F9F9', marginBottom: 8 },
  classTypeBtnSelected: { borderColor: '#F9A825', backgroundColor: '#FFE082' },
  classTypeBtnTitle: { fontSize: 14, fontWeight: '600', color: '#2D3748' },
  classTypeBtnTitleSelected: { color: '#7B5E00' },
  classTypeBtnDesc: { fontSize: 11, color: '#A0AEC0', marginTop: 2 },
 
  concernRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  concernChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  concernChipSelected: { borderColor: colors.primary.default, backgroundColor: colors.primary.default },
  concernChipDisabled: { opacity: 0.4 },
  concernChipText: { fontSize: 13, fontWeight: '500', color: '#1A1A1A' },
  concernChipTextSelected: { color: '#fff', fontWeight: '700' },
 
  subjectBox: { backgroundColor: '#F9F9F9', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 8 },
  subjectGroup: { fontSize: 10, fontWeight: '500', color: '#888', marginBottom: 4 },
 
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 52, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  nextBtn: { height: 52, borderRadius: 12, backgroundColor: colors.primary.default, alignItems: 'center', justifyContent: 'center' },
  nextBtnDisabled: { backgroundColor: '#E5E7EB' },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },
});
 