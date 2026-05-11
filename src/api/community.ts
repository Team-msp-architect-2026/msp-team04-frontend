import client from './client';

export type PostCategory = 'REVIEW' | 'QUESTION' | 'INFO' | 'EDUCATION' | 'CARE';

export interface PostListItem {
  postId: number;
  userId: number;
  category: PostCategory;
  childAge: string | null;
  title: string;
  contentPreview: string;
  imageUrl: string | null;
  commentCount: number;
  likeCount: number;
  createdAt: string;
}

export interface PostDetail {
  postId: number;
  userId: number;
  category: PostCategory;
  childAge: string | null;
  title: string;
  content: string;
  imageUrl: string | null;
  commentCount: number;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CommentItem {
  commentId: number;
  postId: number;
  userId: number;
  content: string;
  likeCount: number;
  likedByMe: boolean;
  mine: boolean;
  createdAt: string;
}

export interface CommentLikeResult {
  commentId: number;
  likedByMe: boolean;
  likeCount: number;
}

export interface LikeResult {
  postId: number;
  liked: boolean;
  likeCount: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
}

export const communityApi = {
  getPostList: async (category?: PostCategory, page = 0, size = 10) => {
    const params: Record<string, unknown> = { page, size };
    if (category) params.category = category;
    const res = await client.get<{ data: PageResponse<PostListItem> }>(
      '/api/community',
      { params },
    );
    return res.data.data;
  },

  getPostDetail: async (postId: number) => {
    const res = await client.get<{ data: PostDetail }>(
      `/api/community/${postId}`,
    );
    return res.data.data;
  },

  createPost: async (body: {
    category: PostCategory;
    childAge?: string;
    title: string;
    content: string;
    imageUrl?: string;
  }) => {
    const res = await client.post<{ data: PostDetail }>('/api/community', body);
    return res.data.data;
  },

  updatePost: async (
    postId: number,
    body: {
      category: PostCategory;
      childAge?: string;
      title: string;
      content: string;
      imageUrl?: string;
    },
  ) => {
    const res = await client.put<{ data: PostDetail }>(
      `/api/community/${postId}`,
      body,
    );
    return res.data.data;
  },

  deletePost: async (postId: number) => {
    await client.delete(`/api/community/${postId}`);
  },

  getCommentList: async (postId: number) => {
    const res = await client.get<{ data: CommentItem[] }>(
      `/api/community/${postId}/comments`,
    );
    return res.data.data;
  },

  createComment: async (postId: number, content: string) => {
    const res = await client.post<{ data: CommentItem }>(
      `/api/community/${postId}/comments`,
      { content },
    );
    return res.data.data;
  },

  deleteComment: async (postId: number, commentId: number) => {
    await client.delete(`/api/community/${postId}/comments/${commentId}`);
  },

  toggleCommentLike: async (postId: number, commentId: number) => {
    const res = await client.post<{ data: CommentLikeResult }>(
      `/api/community/${postId}/comments/${commentId}/like`,
    );
    return res.data.data;
  },

  toggleLike: async (postId: number) => {
    const res = await client.post<{ data: LikeResult }>(
      `/api/community/${postId}/like`,
    );
    return res.data.data;
  },
};
