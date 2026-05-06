import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { colors } from '../constants';

const KAKAO_JS_KEY = '260b293407a3946a42717dad31416426';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Program {
  id: number;
  title: string;
  category: string;
  distance: string;
  distanceMin: number; // 정렬용 (분 단위)
  price: string;
  priceNum: number;    // 정렬용 (원 단위)
  rating: number;
  match: number;
  emoji: string;
  type: 'private' | 'public' | 'government';
  isOpen: boolean;
  lat: number;
  lng: number;
}

type SortKey = 'distance' | 'rating' | 'price';
type PriceFilter = 'all' | 'free' | 'under10' | 'under15';
type ViewMode = 'map' | 'list';

interface ConditionChip {
  label: string;
  value: string;
}

interface MapScreenProps {
  onBack: () => void;
  onSelectProgram?: (id?: number) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NEARBY: Program[] = [
  {
    id: 1,
    title: '창의력 쑥쑥 미술 놀이',
    category: '미술',
    distance: '도보 8분',
    distanceMin: 8,
    price: '월 9만원',
    priceNum: 90000,
    rating: 4.9,
    match: 97,
    emoji: '🎨',
    type: 'private',
    isOpen: true,
    lat: 37.5012,
    lng: 127.0396,
  },
  {
    id: 2,
    title: '오감 발달 음악 교실',
    category: '음악',
    distance: '도보 12분',
    distanceMin: 12,
    price: '월 11만원',
    priceNum: 110000,
    rating: 4.8,
    match: 91,
    emoji: '🎵',
    type: 'public',
    isOpen: true,
    lat: 37.5025,
    lng: 127.0410,
  },
  {
    id: 3,
    title: '한글 떼기 독서 클래스',
    category: '독서',
    distance: '차량 5분',
    distanceMin: 5,
    price: '월 8만원',
    priceNum: 80000,
    rating: 4.7,
    match: 87,
    emoji: '📚',
    type: 'private',
    isOpen: false,
    lat: 37.4998,
    lng: 127.0380,
  },
  {
    id: 4,
    title: '신나는 축구 교실',
    category: '체육',
    distance: '도보 15분',
    distanceMin: 15,
    price: '무료',
    priceNum: 0,
    rating: 4.6,
    match: 80,
    emoji: '⚽',
    type: 'government',
    isOpen: true,
    lat: 37.5005,
    lng: 127.0420,
  },
];

const CATEGORIES = ['전체', '미술', '음악', '체육', '영어', '독서'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPinColor(type: Program['type'], isOpen: boolean) {
  if (!isOpen) return '#9CA3AF';
  if (type === 'public') return '#3B82F6';
  if (type === 'government') return '#10B981';
  return '#F97316';
}

function buildKakaoMapHTML(programs: Program[]) {
  const markersJS = programs.map(p => {
    const color = getPinColor(p.type, p.isOpen);
    return `
      (function() {
        var pos = new kakao.maps.LatLng(${p.lat}, ${p.lng});
        var el = document.createElement('div');
        el.style.cssText = [
          'background:${color}','color:#fff','padding:5px 10px',
          'border-radius:20px','font-size:11px','font-weight:700',
          'white-space:nowrap','box-shadow:0 2px 6px rgba(0,0,0,0.25)',
          'cursor:pointer','border:2px solid #fff',
        ].join(';');
        el.innerText = '${p.category} ${p.price}';
        var overlay = new kakao.maps.CustomOverlay({ position: pos, content: el, yAnchor: 1 });
        overlay.setMap(map);
        el.addEventListener('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerClick', id: ${p.id} }));
        });
      })();
    `;
  }).join('\n');

  const centerLat = programs.reduce((s, p) => s + p.lat, 0) / programs.length;
  const centerLng = programs.reduce((s, p) => s + p.lng, 0) / programs.length;

  return `
<!DOCTYPE html><html><head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no"/>
  <style>* { margin:0;padding:0;box-sizing:border-box } html,body,#map { width:100%;height:100% }</style>
</head><body>
  <div id="map"></div>
  <script src="//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&autoload=false"></script>
  <script>
    kakao.maps.load(function() {
      var map = new kakao.maps.Map(document.getElementById('map'), {
        center: new kakao.maps.LatLng(${centerLat}, ${centerLng}), level: 4
      });
      var dot = document.createElement('div');
      dot.style.cssText = 'width:14px;height:14px;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.25)';
      new kakao.maps.CustomOverlay({ position: new kakao.maps.LatLng(${centerLat},${centerLng}), content: dot, yAnchor: 0.5 }).setMap(map);
      ${markersJS}
    });
  </script>
</body></html>`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface ProgramCardProps {
  program: Program;
  isSelected: boolean;
  isLiked: boolean;
  onPress: () => void;
  onLike: () => void;
  onDetail: () => void;
}

function ProgramCard({ program: p, isSelected, isLiked, onPress, onLike, onDetail }: ProgramCardProps) {
  return (
    <TouchableOpacity
      style={[s.card, isSelected && s.cardSelected]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* 찜 버튼 */}
      <TouchableOpacity style={s.likeBtn} onPress={onLike} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={18}
          color={isLiked ? '#F43F5E' : '#CBD5E0'}
        />
      </TouchableOpacity>

      <View style={s.cardImage}>
        <Text style={{ fontSize: 32 }}>{p.emoji}</Text>
      </View>

      <View style={s.cardContent}>
        {/* 배지 행 */}
        <View style={s.cardTopRow}>
          <View style={s.categoryBadge}>
            <Text style={s.categoryBadgeText}>{p.category}</Text>
          </View>
          <View style={s.matchBadge}>
            <Text style={s.matchBadgeText}>✦ {p.match}%</Text>
          </View>
          {!p.isOpen && (
            <View style={s.closedBadge}>
              <Text style={s.closedBadgeText}>마감</Text>
            </View>
          )}
        </View>

        <Text style={s.cardTitle} numberOfLines={1}>{p.title}</Text>
        <Text style={s.cardDistance}>🚶 {p.distance}</Text>

        <View style={s.cardBottom}>
          <Text style={s.cardPrice}>{p.price}</Text>
          <View style={s.ratingRow}>
            <Text style={{ fontSize: 11, color: '#F9A825' }}>★</Text>
            <Text style={s.ratingText}>{p.rating}</Text>
          </View>
        </View>

        {/* 상세보기 버튼 */}
        <TouchableOpacity style={s.detailBtn} onPress={onDetail}>
          <Text style={s.detailBtnText}>상세보기</Text>
          <Ionicons name="arrow-forward" size={12} color="#F97316" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Filter Modal ──────────────────────────────────────────────────────────────

interface FilterModalProps {
  visible: boolean;
  sortKey: SortKey;
  priceFilter: PriceFilter;
  onChangeSortKey: (k: SortKey) => void;
  onChangePriceFilter: (f: PriceFilter) => void;
  onClose: () => void;
  onReset: () => void;
}

function FilterModal({ visible, sortKey, priceFilter, onChangeSortKey, onChangePriceFilter, onClose, onReset }: FilterModalProps) {
  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'distance', label: '거리순' },
    { key: 'rating', label: '별점순' },
    { key: 'price', label: '가격순' },
  ];
  const PRICE_OPTIONS: { key: PriceFilter; label: string }[] = [
    { key: 'all', label: '전체' },
    { key: 'free', label: '무료' },
    { key: 'under10', label: '10만원 이하' },
    { key: 'under15', label: '15만원 이하' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={s.modalOverlay} onPress={onClose}>
        <Pressable style={s.modalSheet} onPress={() => {}}>
          {/* 핸들 */}
          <View style={s.modalHandle} />
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>필터 / 정렬</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#1A1A1A" />
            </TouchableOpacity>
          </View>

          {/* 정렬 */}
          <Text style={s.modalSection}>정렬 기준</Text>
          <View style={s.optionRow}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[s.optionChip, sortKey === opt.key && s.optionChipActive]}
                onPress={() => onChangeSortKey(opt.key)}
              >
                <Text style={[s.optionChipText, sortKey === opt.key && s.optionChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 가격대 */}
          <Text style={s.modalSection}>가격대</Text>
          <View style={s.optionRow}>
            {PRICE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[s.optionChip, priceFilter === opt.key && s.optionChipActive]}
                onPress={() => onChangePriceFilter(opt.key)}
              >
                <Text style={[s.optionChipText, priceFilter === opt.key && s.optionChipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 버튼 */}
          <View style={s.modalFooter}>
            <TouchableOpacity style={s.resetBtn} onPress={onReset}>
              <Text style={s.resetBtnText}>초기화</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.applyBtn} onPress={onClose}>
              <Text style={s.applyBtnText}>적용하기</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <View style={s.emptyContainer}>
      <Text style={s.emptyEmoji}>🔍</Text>
      <Text style={s.emptyTitle}>조건에 맞는 프로그램이 없어요</Text>
      <Text style={s.emptyDesc}>필터나 카테고리를 바꿔보세요</Text>
      <TouchableOpacity style={s.emptyResetBtn} onPress={onReset}>
        <Text style={s.emptyResetText}>필터 초기화</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function MapScreen({ onBack, onSelectProgram}: MapScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [activeCategory, setActiveCategory] = useState('전체');
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [likedPrograms, setLikedPrograms] = useState<Set<number>>(new Set());
  const [filterVisible, setFilterVisible] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('distance');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('all');

  // 필터링 + 정렬
  const filtered = useMemo(() => {
    let list = NEARBY.filter(p => activeCategory === '전체' || p.category === activeCategory);

    // 가격 필터
    if (priceFilter === 'free')    list = list.filter(p => p.priceNum === 0);
    if (priceFilter === 'under10') list = list.filter(p => p.priceNum <= 100000);
    if (priceFilter === 'under15') list = list.filter(p => p.priceNum <= 150000);

    // 정렬
    return [...list].sort((a, b) => {
      if (sortKey === 'distance') return a.distanceMin - b.distanceMin;
      if (sortKey === 'rating')   return b.rating - a.rating;
      if (sortKey === 'price')    return a.priceNum - b.priceNum;
      return 0;
    });
  }, [activeCategory, sortKey, priceFilter]);

  const handleLike = (id: number) => {
    setLikedPrograms(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDetail = (id: number) => {
    setSelectedProgram(id);
    onSelectProgram?.(id);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick') handleDetail(data.id);
    } catch {}
  };

  const resetFilters = () => {
    setActiveCategory('전체');
    setSortKey('distance');
    setPriceFilter('all');
  };

  // 활성 필터 개수 (배지 표시용)
  const activeFilterCount = (sortKey !== 'distance' ? 1 : 0) + (priceFilter !== 'all' ? 1 : 0);

  const mapHTML = useMemo(() => buildKakaoMapHTML(NEARBY), []);

  return (
    <SafeAreaView style={s.root}>
      {/* ── 헤더 ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>지도 보기</Text>
        {/* 필터 버튼 */}
        <TouchableOpacity style={s.filterIconBtn} onPress={() => setFilterVisible(true)}>
          <Ionicons name="options-outline" size={20} color="#1A1A1A" />
          {activeFilterCount > 0 && (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── 지도/리스트 뷰 토글 ── */}
      <View style={s.viewToggleRow}>
        <TouchableOpacity
          style={[s.viewToggleBtn, viewMode === 'map' && s.viewToggleBtnActive]}
          onPress={() => setViewMode('map')}
        >
          <Ionicons name="map-outline" size={14} color={viewMode === 'map' ? '#7B5E00' : '#718096'} />
          <Text style={[s.viewToggleText, viewMode === 'map' && s.viewToggleTextActive]}>지도 보기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.viewToggleBtn, viewMode === 'list' && s.viewToggleBtnActive]}
          onPress={() => setViewMode('list')}
        >
          <Ionicons name="list-outline" size={14} color={viewMode === 'list' ? '#7B5E00' : '#718096'} />
          <Text style={[s.viewToggleText, viewMode === 'list' && s.viewToggleTextActive]}>리스트 보기</Text>
        </TouchableOpacity>
      </View>


      {/* ── 카테고리 필터 ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.categoryScroll}
        contentContainerStyle={s.categoryContent}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[s.categoryBtn, activeCategory === cat && s.categoryBtnActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[s.categoryBtnText, activeCategory === cat && s.categoryBtnTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── 본문 ── */}
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* 지도 뷰일 때만 지도 표시 */}
        {viewMode === 'map' && (
          <>
            <View style={s.mapContainer}>
              <WebView
                source={{ html: mapHTML, baseUrl: 'http://192.168.0.16' }}
                style={s.map}
                scrollEnabled={false}
                onMessage={handleWebViewMessage}
                javaScriptEnabled
                domStorageEnabled
                originWhitelist={['*']}
                mixedContentMode="always"
                allowUniversalAccessFromFileURLs
                allowFileAccessFromFileURLs
              />
              <View style={s.nearbyCount}>
                <Text style={s.nearbyCountText}>주변 {NEARBY.length}개 프로그램</Text>
              </View>
            </View>

            {/* 범례 */}
            <View style={s.legend}>
              {[
                { color: '#3B82F6', label: '공공' },
                { color: '#F97316', label: '민간' },
                { color: '#10B981', label: '정부지원' },
                { color: '#9CA3AF', label: '마감' },
              ].map(item => (
                <View key={item.label} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: item.color }]} />
                  <Text style={s.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* 리스트 제목 + 결과 수 */}
        <View style={s.listTitleRow}>
          <Text style={s.listTitle}>
            {viewMode === 'map' ? '내 주변 프로그램' : '전체 프로그램'}
          </Text>
          <Text style={s.listCount}>{filtered.length}개</Text>
        </View>

        {/* 빈 상태 or 카드 목록 */}
        {filtered.length === 0 ? (
          <EmptyState onReset={resetFilters} />
        ) : (
          <View style={s.list}>
            {filtered.map(p => (
              <ProgramCard
                key={p.id}
                program={p}
                isSelected={selectedProgram === p.id}
                isLiked={likedPrograms.has(p.id)}
                onPress={() => setSelectedProgram(p.id)}
                onLike={() => handleLike(p.id)}
                onDetail={() => handleDetail(p.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── 필터 모달 ── */}
      <FilterModal
        visible={filterVisible}
        sortKey={sortKey}
        priceFilter={priceFilter}
        onChangeSortKey={setSortKey}
        onChangePriceFilter={setPriceFilter}
        onClose={() => setFilterVisible(false)}
        onReset={resetFilters}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  // 헤더
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    height: 56, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
  filterIconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  filterBadge: {
    position: 'absolute', top: 6, right: 4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },

  // 뷰 전환 토글
  viewToggleRow: {
    flexDirection: 'row', margin: 12, marginBottom: 0,
    backgroundColor: '#F3F4F6', borderRadius: 12, padding: 3,
  },
  viewToggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 8, borderRadius: 10,
  },
  viewToggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  viewToggleText: { fontSize: 13, fontWeight: '600', color: '#718096' },
  viewToggleTextActive: { color: '#7B5E00' },

  // 조건 요약 칩
  chipScroll: { flexGrow: 0, flexShrink: 0, maxHeight: 44, marginTop: 10 },
  chipContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  conditionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FFF9E6', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, borderColor: '#FFE082',
  },
  conditionChipLabel: { fontSize: 11, color: '#9E7A00' },
  conditionChipValue: { fontSize: 11, fontWeight: '700', color: '#7B5E00' },

  // 카테고리
  categoryScroll: { flexGrow: 0, flexShrink: 0, height: 52 },
  categoryContent: { paddingHorizontal: 16, paddingVertical: 8, gap: 8, alignItems: 'center' },
  categoryBtn: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0',
  },
  categoryBtnActive: { backgroundColor: '#FFE082', borderColor: '#F9A825' },
  categoryBtnText: { fontSize: 13, fontWeight: '600', color: '#718096' },
  categoryBtnTextActive: { color: '#7B5E00' },

  scroll: { padding: 16, paddingBottom: 40 },

  // 지도
  mapContainer: {
    height: 280, borderRadius: 16, overflow: 'hidden',
    marginBottom: 10, position: 'relative',
  },
  map: { flex: 1 },
  nearbyCount: {
    position: 'absolute', bottom: 12, left: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  nearbyCountText: { fontSize: 11, fontWeight: '700', color: '#2D3748' },

  // 범례
  legend: { flexDirection: 'row', gap: 12, marginBottom: 16, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#718096' },

  // 리스트 제목
  listTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#1A1A1A' },
  listCount: { fontSize: 12, color: '#9CA3AF' },
  list: { gap: 10 },

  // 카드
  card: {
    flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: '#F0F0F0',
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
    position: 'relative',
  },
  cardSelected: { borderColor: '#FFE082', shadowColor: '#F9A825', shadowOpacity: 0.2 },
  cardImage: {
    width: 64, height: 64, borderRadius: 12, backgroundColor: '#FFF9E6',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardContent: { flex: 1, gap: 4 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  categoryBadge: { backgroundColor: '#FFF3CD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  categoryBadgeText: { fontSize: 10, fontWeight: '700', color: '#F9A825' },
  matchBadge: {
    backgroundColor: '#FFFBEB', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 20, borderWidth: 1, borderColor: '#FFE082',
  },
  matchBadgeText: { fontSize: 10, fontWeight: '700', color: '#b8860b' },
  closedBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  closedBadgeText: { fontSize: 10, fontWeight: '700', color: '#9CA3AF' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#1A202C' },
  cardDistance: { fontSize: 11, color: '#718096' },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  cardPrice: { fontSize: 13, fontWeight: '700', color: '#1A202C' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingText: { fontSize: 11, fontWeight: '600', color: '#2D3748' },

  // 찜 버튼
  likeBtn: { position: 'absolute', top: 12, right: 12 },

  // 상세보기 버튼
  detailBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    alignSelf: 'flex-start', marginTop: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, backgroundColor: '#FFF4EB',
    borderWidth: 1, borderColor: '#FED7AA',
  },
  detailBtnText: { fontSize: 11, fontWeight: '700', color: '#F97316' },

  // 필터 모달
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
  },
  modalHandle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0',
    alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  modalSection: { fontSize: 12, fontWeight: '600', color: '#718096', marginBottom: 10 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  optionChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: 'transparent',
  },
  optionChipActive: { backgroundColor: '#FFF9E6', borderColor: '#F9A825' },
  optionChipText: { fontSize: 13, fontWeight: '600', color: '#718096' },
  optionChipTextActive: { color: '#7B5E00' },
  modalFooter: { flexDirection: 'row', gap: 10, marginTop: 4 },
  resetBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#F3F4F6', alignItems: 'center',
  },
  resetBtnText: { fontSize: 14, fontWeight: '700', color: '#718096' },
  applyBtn: {
    flex: 2, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#F9A825', alignItems: 'center',
  },
  applyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // 빈 상태
  emptyContainer: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  emptyEmoji: { fontSize: 40, marginBottom: 4 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#2D3748' },
  emptyDesc: { fontSize: 13, color: '#9CA3AF', marginBottom: 8 },
  emptyResetBtn: {
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20,
    backgroundColor: '#FFF9E6', borderWidth: 1, borderColor: '#FFE082',
  },
  emptyResetText: { fontSize: 13, fontWeight: '700', color: '#7B5E00' },
});