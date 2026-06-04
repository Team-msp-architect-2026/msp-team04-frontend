import client from './client';

export interface ProfileImagePresignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  objectKey: string;
  method: string;
  contentType: string;
  expiresInSeconds: number;
  maxFileSizeBytes: number;
}

export interface UploadedProfileImage {
  fileUrl: string;
  objectKey: string;
}

const resolveContentType = (uri: string) => {
  const lowerUri = uri.toLowerCase();

  if (lowerUri.endsWith('.png')) {
    return 'image/png';
  }

  return 'image/jpeg';
};

export const uploadProfileImage = async (
  localUri: string,
): Promise<UploadedProfileImage> => {
  const contentType = resolveContentType(localUri);

  const response = await client.get('/api/uploads/profile/presigned-url', {
    params: { contentType },
  });

  let rawData = response.data;

  if (typeof rawData === 'string') {
    const trimmed = rawData.trim();

    console.log('프로필 이미지 presigned 문자열 응답:', {
      status: response.status,
      contentType: response.headers?.['content-type'],
      startsWithHtml: trimmed.startsWith('<'),
      preview: trimmed.slice(0, 120),
    });

    if (trimmed.startsWith('<')) {
      throw new Error('프로필 이미지 업로드 URL API가 JSON이 아니라 HTML을 반환했습니다.');
    }

    rawData = JSON.parse(trimmed);
  }

  const presigned: ProfileImagePresignedUrlResponse =
    rawData?.data ?? rawData;

  console.log('프로필 이미지 presigned 응답 구조:', {
    status: response.status,
    contentType: response.headers?.['content-type'],
    responseKeys: Object.keys(rawData ?? {}),
    dataKeys: Object.keys(rawData?.data ?? {}),
    hasUploadUrl: Boolean(presigned?.uploadUrl),
    hasFileUrl: Boolean(presigned?.fileUrl),
    hasObjectKey: Boolean(presigned?.objectKey),
  });

  if (!presigned?.uploadUrl || !presigned?.fileUrl) {
    throw new Error('프로필 이미지 업로드 URL 응답이 올바르지 않습니다.');
  }

  const fileResponse = await fetch(localUri);
  const blob = await fileResponse.blob();

  if (blob.size > presigned.maxFileSizeBytes) {
    throw new Error('프로필 이미지 파일 크기가 허용 범위를 초과했습니다.');
  }

  const uploadResponse = await fetch(presigned.uploadUrl, {
    method: presigned.method || 'PUT',
    headers: {
      'Content-Type': presigned.contentType || contentType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    const errorBody = await uploadResponse.text();

    console.log('프로필 이미지 S3 업로드 실패 응답:', {
      status: uploadResponse.status,
      contentType: uploadResponse.headers?.get?.('content-type'),
      bodyPreview: errorBody.slice(0, 500),
    });

    throw new Error(`프로필 이미지 S3 업로드 실패: ${uploadResponse.status}`);
  }

  return {
    fileUrl: presigned.fileUrl,
    objectKey: presigned.objectKey,
  };
};
