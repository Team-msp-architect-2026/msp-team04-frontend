import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  fetchBenefitProfile,
  recalculateBenefits,
  saveBenefitProfile,
  type BenefitProfile,
  type CaregiverAgeRange,
  type MonthlyIncomeRange,
} from '../../api/benefit';

interface BenefitProfileInputScreenProps {
  childId?: number | null;
  childName?: string;
  onBack?: () => void;
  onSaved?: () => void;
}

const SEOUL_DISTRICTS = [
  '강남구',
  '강동구',
  '강북구',
  '강서구',
  '관악구',
  '광진구',
  '구로구',
  '금천구',
  '노원구',
  '도봉구',
  '동대문구',
  '동작구',
  '마포구',
  '서대문구',
  '서초구',
  '성동구',
  '성북구',
  '송파구',
  '양천구',
  '영등포구',
  '용산구',
  '은평구',
  '종로구',
  '중구',
  '중랑구',
];

const INCOME_OPTIONS: { value: MonthlyIncomeRange; label: string; desc: string }[] = [
  { value: 'UNKNOWN', label: '잘 모르겠어요', desc: '조건 확인 혜택으로 안내해요' },
  { value: 'UNDER_200', label: '200만원 미만', desc: '월 가구 소득 기준' },
  { value: 'RANGE_200_350', label: '200만원 이상 350만원 미만', desc: '월 가구 소득 기준' },
  { value: 'RANGE_350_500', label: '350만원 이상 500만원 미만', desc: '월 가구 소득 기준' },
  { value: 'RANGE_500_700', label: '500만원 이상 700만원 미만', desc: '월 가구 소득 기준' },
  { value: 'OVER_700', label: '700만원 이상', desc: '월 가구 소득 기준' },
];

const CAREGIVER_AGE_OPTIONS: { value: CaregiverAgeRange; label: string }[] = [
  { value: 'UNKNOWN', label: '선택 안 함' },
  { value: 'UNDER_30', label: '30세 미만' },
  { value: 'RANGE_30_39', label: '30대' },
  { value: 'RANGE_40_49', label: '40대' },
  { value: 'RANGE_50_59', label: '50대' },
  { value: 'OVER_60', label: '60세 이상' },
];

const HOUSEHOLD_OPTIONS = [2, 3, 4, 5, 6];

function applyProfile(profile: BenefitProfile, setters: {
  setDistrict: (value: string) => void;
  setHouseholdSize: (value: number) => void;
  setMonthlyIncomeRange: (value: MonthlyIncomeRange) => void;
  setCaregiverAgeRange: (value: CaregiverAgeRange) => void;
  setDualIncome: (value: boolean) => void;
  setSingleParent: (value: boolean) => void;
  setMultiChildFamily: (value: boolean) => void;
  setMulticulturalFamily: (value: boolean) => void;
  setDisabledFamilyMember: (value: boolean) => void;
  setConsentAgreed: (value: boolean) => void;
}) {
  if (profile.district) setters.setDistrict(profile.district);
  if (profile.householdSize) setters.setHouseholdSize(profile.householdSize);
  if (profile.monthlyIncomeRange) setters.setMonthlyIncomeRange(profile.monthlyIncomeRange);
  if (profile.caregiverAgeRange) setters.setCaregiverAgeRange(profile.caregiverAgeRange);
  setters.setDualIncome(Boolean(profile.dualIncome));
  setters.setSingleParent(Boolean(profile.singleParent));
  setters.setMultiChildFamily(Boolean(profile.multiChildFamily));
  setters.setMulticulturalFamily(Boolean(profile.multiculturalFamily));
  setters.setDisabledFamilyMember(Boolean(profile.disabledFamilyMember));
  setters.setConsentAgreed(Boolean(profile.consentAgreed));
}

export default function BenefitProfileInputScreen({
  childId,
  childName = '아이',
  onBack,
  onSaved,
}: BenefitProfileInputScreenProps) {
  const insets = useSafeAreaInsets();

  const [district, setDistrict] = useState('강동구');
  const [householdSize, setHouseholdSize] = useState(3);
  const [monthlyIncomeRange, setMonthlyIncomeRange] =
    useState<MonthlyIncomeRange>('UNKNOWN');
  const [caregiverAgeRange, setCaregiverAgeRange] =
    useState<CaregiverAgeRange>('UNKNOWN');

  const [dualIncome, setDualIncome] = useState(false);
  const [singleParent, setSingleParent] = useState(false);
  const [multiChildFamily, setMultiChildFamily] = useState(false);
  const [multiculturalFamily, setMulticulturalFamily] = useState(false);
  const [disabledFamilyMember, setDisabledFamilyMember] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const unknownIncome = monthlyIncomeRange === 'UNKNOWN';

  const canSubmit = useMemo(() => {
    return Boolean(district) && householdSize >= 1 && consentAgreed && !saving;
  }, [district, householdSize, consentAgreed, saving]);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setErrorMessage('');

        const profile = await fetchBenefitProfile();

        if (!mounted) return;

        applyProfile(profile, {
          setDistrict,
          setHouseholdSize,
          setMonthlyIncomeRange,
          setCaregiverAgeRange,
          setDualIncome,
          setSingleParent,
          setMultiChildFamily,
          setMulticulturalFamily,
          setDisabledFamilyMember,
          setConsentAgreed,
        });
      } catch (error) {
        console.error('지원금 진단 정보 조회 실패', error);
        if (mounted) {
          setErrorMessage('기존 진단 정보를 불러오지 못했어요.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit() {
    if (!canSubmit) {
      Alert.alert('확인 필요', '거주 자치구와 정보 활용 동의를 확인해주세요.');
      return;
    }

    try {
      setSaving(true);
      setErrorMessage('');

      await saveBenefitProfile({
        region: '서울특별시',
        district,
        householdSize,
        monthlyIncomeRange,
        caregiverAgeRange,
        dualIncome,
        singleParent,
        multiChildFamily,
        multiculturalFamily,
        disabledFamilyMember,
        unknownIncome,
        consentAgreed: true,
      });

      if (childId) {
        await recalculateBenefits(childId);
      }

      onSaved?.();
    } catch (error) {
      console.error('지원금 진단 정보 저장 실패', error);
      setErrorMessage('지원금 진단 정보를 저장하지 못했어요. 입력값을 다시 확인해주세요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>지원금 진단 입력</Text>
          <Text style={styles.headerSub}>
            {childName}에게 맞는 지원 혜택을 찾기 위한 정보예요
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#FFD93D" />
          <Text style={styles.loadingText}>진단 정보를 불러오는 중...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.noticeCard}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#2563EB" />
            <Text style={styles.noticeText}>
              입력한 정보는 지원금 매칭에만 사용돼요. 정확하지 않은 항목은 잘 모르겠어요를 선택해도 됩니다.
            </Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <Text style={styles.sectionTitle}>거주 지역</Text>
          <View style={styles.optionGrid}>
            {SEOUL_DISTRICTS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, district === item && styles.chipActive]}
                onPress={() => setDistrict(item)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, district === item && styles.chipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>가구원 수</Text>
          <View style={styles.householdGrid}>
            {HOUSEHOLD_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.numberChip, householdSize === item && styles.chipActive]}
                onPress={() => setHouseholdSize(item)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, householdSize === item && styles.chipTextActive]}>
                  {item >= 6 ? '6명 이상' : `${item}명`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>월 가구 소득</Text>
          <View style={styles.cardList}>
            {INCOME_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.selectCard,
                  monthlyIncomeRange === item.value && styles.selectCardActive,
                ]}
                onPress={() => setMonthlyIncomeRange(item.value)}
                activeOpacity={0.75}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.selectTitle,
                      monthlyIncomeRange === item.value && styles.selectTitleActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text style={styles.selectDesc}>{item.desc}</Text>
                </View>
                {monthlyIncomeRange === item.value && (
                  <Ionicons name="checkmark-circle" size={20} color="#D97706" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>보호자 연령대</Text>
          <View style={styles.caregiverGrid}>
            {CAREGIVER_AGE_OPTIONS.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[styles.caregiverChip, caregiverAgeRange === item.value && styles.chipActive]}
                onPress={() => setCaregiverAgeRange(item.value)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.chipText,
                    caregiverAgeRange === item.value && styles.chipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>가구 조건</Text>
          <View style={styles.toggleCard}>
            <ToggleRow label="맞벌이 가구예요" value={dualIncome} onValueChange={setDualIncome} />
            <ToggleRow label="한부모 가정이에요" value={singleParent} onValueChange={setSingleParent} />
            <ToggleRow label="다자녀 가정이에요" value={multiChildFamily} onValueChange={setMultiChildFamily} />
            <ToggleRow label="다문화 가정이에요" value={multiculturalFamily} onValueChange={setMulticulturalFamily} />
            <ToggleRow
              label="가족 중 장애 구성원이 있어요"
              value={disabledFamilyMember}
              onValueChange={setDisabledFamilyMember}
              isLast
            />
          </View>

          <TouchableOpacity
            style={[styles.consentCard, consentAgreed && styles.consentCardActive]}
            onPress={() => setConsentAgreed((prev) => !prev)}
            activeOpacity={0.75}
          >
            <Ionicons
              name={consentAgreed ? 'checkmark-circle' : 'ellipse-outline'}
              size={22}
              color={consentAgreed ? '#D97706' : '#9CA3AF'}
            />
            <Text style={styles.consentText}>
              지원금 진단을 위해 입력 정보를 활용하는 것에 동의합니다.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <Text style={styles.submitText}>진단 정보 저장하고 혜택 찾기</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 36 }} />
        </ScrollView>
      )}
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
  isLast = false,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, !isLast && styles.toggleBorder]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        style={styles.toggleSwitch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F3F5',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerRight: { width: 36 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  headerSub: { marginTop: 3, fontSize: 11, color: '#6B7280', textAlign: 'center' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: '#6B7280', fontWeight: '700' },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
    backgroundColor: '#FFFFFF',
  },
  noticeCard: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#F7FAFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 19, color: '#1D4ED8', fontWeight: '700' },
  errorCard: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: { flex: 1, fontSize: 13, color: '#B91C1C', fontWeight: '700' },
  sectionTitle: {
    marginTop: 40,
    marginBottom: 18,
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  fixedRegionCard: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F3E7B3',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 10,
    rowGap: 12,
  },
  householdGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 10,
    rowGap: 12,
  },
  chip: {
    minWidth: 67,
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  numberChip: {
    width: '31%',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: { backgroundColor: '#FFF4BF', borderColor: '#FACC15' },
  caregiverGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: 10,
    rowGap: 12,
  },
  caregiverChip: {
    width: '31%',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipText: { fontSize: 13, fontWeight: '800', color: '#4B5563' },
  chipTextActive: { color: '#92400E' },
  cardList: { gap: 12 },
  selectCard: {
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectCardActive: { backgroundColor: '#FFF8D6', borderColor: '#FACC15' },
  selectTitle: { fontSize: 14, fontWeight: '900', color: '#111827' },
  selectTitleActive: { color: '#92400E' },
  selectDesc: { marginTop: 3, fontSize: 12, color: '#6B7280', fontWeight: '600' },
  toggleCard: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  toggleRow: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  toggleLabel: { flex: 1, fontSize: 14, color: '#111827', fontWeight: '800' },
  toggleSwitch: {
    transform: [{ translateY: 4 }],
  },
  consentCard: {
    marginTop: 38,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  consentCardActive: { backgroundColor: '#FFF8D6', borderColor: '#FACC15' },
  consentText: { flex: 1, fontSize: 13, lineHeight: 18, color: '#374151', fontWeight: '800' },
  submitBtn: {
    marginTop: 24,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD93D',
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitText: { fontSize: 15, color: '#111827', fontWeight: '900' },
});
