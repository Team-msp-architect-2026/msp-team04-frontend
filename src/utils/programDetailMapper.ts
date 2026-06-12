import type { ProgramDetailItem } from '../api/programApi';
import type { ProgramDetail } from '../screens/program/ProgramDetailScreen';

type ProgramType = ProgramDetail['type'];

function decodeHtml(value: string): string {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, decimal) =>
      String.fromCharCode(Number.parseInt(decimal, 10)),
    )
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function cleanText(value: string | null | undefined): string | null {
  if (!value || !value.trim()) {
    return null;
  }

  const cleaned = decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|tr|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t\f\r\u00A0]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return cleaned || null;
}

function containsOnline(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }

  const lowerValue = value.toLowerCase();

  return (
    value.includes('온라인') ||
    value.includes('비대면') ||
    lowerValue.includes('online')
  );
}

function resolveProgramType(item: ProgramDetailItem, fallback: ProgramDetail): ProgramType {
  if (containsOnline(item.classType) || containsOnline(item.name)) {
    return 'online';
  }

  if (item.category === 'BENEFIT' || item.programType === 'GOVERNMENT') {
    return 'government';
  }

  if (item.programType === 'PRIVATE') {
    return 'private';
  }

  if (item.isPublic || item.programType === 'PUBLIC') {
    return 'public';
  }

  return fallback.type;
}

function formatPrice(item: ProgramDetailItem, fallback: ProgramDetail): string {
  if (item.isFree || item.price === 0) {
    return '무료';
  }

  if (item.price != null && item.price > 0) {
    return `${item.price.toLocaleString()}원`;
  }

  return fallback.price || '가격 확인 필요';
}

function formatAgeRange(
  minAge: number | null,
  maxAge: number | null,
  fallback: string,
): string {
  if (minAge != null && maxAge != null) {
    return `${minAge}~${maxAge}세`;
  }

  if (minAge != null) {
    return `${minAge}세 이상`;
  }

  if (maxAge != null) {
    return `${maxAge}세 이하`;
  }

  return fallback || '대상 연령 확인 필요';
}

function formatDate(value: string | null | undefined, fallback: string): string {
  if (!value) {
    return fallback;
  }

  return value.replace(/-/g, '.');
}

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  fallback: string,
): string {
  if (start && end) {
    return `${formatDate(start, start)} ~ ${formatDate(end, end)}`;
  }

  if (start) {
    return `${formatDate(start, start)}부터`;
  }

  if (end) {
    return `${formatDate(end, end)}까지`;
  }

  return fallback;
}

function formatSchedule(item: ProgramDetailItem, fallback: string): string {
  const classType = cleanText(item.classType);
  const classTime = cleanText(item.classTime);

  if (classType && classTime) {
    return `${classType} · ${classTime}`;
  }

  if (classTime) {
    return classTime;
  }

  if (classType) {
    return classType;
  }

  return formatDateRange(item.operationStart, item.operationEnd, fallback || '운영 일정 확인 필요');
}

function resolveAddress(
  detailAddress: string | null | undefined,
  institutionName: string | null | undefined,
  region: string | null | undefined,
  fallbackAddress: string,
): string {
  const cleanedDetailAddress = cleanText(detailAddress);

  if (cleanedDetailAddress) {
    return cleanedDetailAddress;
  }

  const cleanedInstitutionName = cleanText(institutionName);

  if (cleanedInstitutionName) {
    const parts = cleanedInstitutionName
      .split('>')
      .map(part => part.trim())
      .filter(Boolean);

    if (parts.length > 1) {
      return parts[parts.length - 1];
    }

    return cleanedInstitutionName;
  }

  return cleanText(region) ?? fallbackAddress ?? '주소 확인 필요';
}

function splitCurriculum(value: string | null | undefined, fallback: string[]): string[] {
  const cleaned = cleanText(value);

  if (!cleaned) {
    return fallback.length > 0
      ? fallback
      : ['상세 커리큘럼은 프로그램 상세 정보를 확인해 주세요.'];
  }

  const items = cleaned
    .split(/\r?\n|\|/)
    .map(item => item.trim())
    .filter(Boolean);

  return items.length > 0
    ? items
    : ['상세 커리큘럼은 프로그램 상세 정보를 확인해 주세요.'];
}

export function mapProgramDetailItemToProgramDetail(
  item: ProgramDetailItem,
  fallback: ProgramDetail,
): ProgramDetail {
  const capacity = item.maxCapacity ?? fallback.capacity ?? 0;
  const remainCapacity = item.remainCapacity;
  const enrolled =
    capacity > 0 && remainCapacity != null
      ? Math.max(capacity - remainCapacity, 0)
      : fallback.enrolled ?? 0;
  const tags = (item.tags ?? [])
    .map(tag => cleanText(tag))
    .filter((tag): tag is string => Boolean(tag));

  const title = cleanText(item.name) ?? fallback.title;
  const organization = cleanText(item.institutionName) ?? fallback.organization;
  const location = cleanText(item.region) ?? fallback.location;
  const address = resolveAddress(
    item.detailAddress,
    item.institutionName,
    item.region,
    fallback.address,
  );
  const description =
    cleanText(item.description) ??
    fallback.description ??
    `${organization}에서 운영하는 ${title} 프로그램입니다.`;

  return {
    ...fallback,
    id: item.id,
    title,
    organization,
    type: resolveProgramType(item, fallback),
    location,
    address,
    distance: location,
    price: formatPrice(item, fallback),
    priceValue: item.price ?? fallback.priceValue ?? 0,
    rating: item.ratingAvg ?? fallback.rating ?? 0,
    reviewCount: item.reviewCount ?? fallback.reviewCount ?? 0,
    ageRange: formatAgeRange(item.targetAgeMin, item.targetAgeMax, fallback.ageRange),
    schedule: formatSchedule(item, fallback.schedule),
    isOpen: item.isRecruiting,
    tags: tags.length > 0 ? tags : fallback.tags,
    description,
    curriculum: splitCurriculum(item.curriculum, fallback.curriculum),
    contact: cleanText(item.contactPhone) ?? fallback.contact ?? '문의처 확인 필요',
    website: cleanText(item.contactUrl) ?? fallback.website,
    capacity,
    enrolled,
    startDate: formatDate(item.operationStart, fallback.startDate),
    endDate: formatDate(
      item.operationEnd ?? item.deadlineDate,
      fallback.endDate,
    ),
    imageUrl: cleanText(item.imageUrl) ?? fallback.imageUrl ?? null,
  };
}
