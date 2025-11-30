export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export interface Post {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  description?: string;
  status: PostStatus;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  views: number;
  createdAt: string;
}

export interface PostDetail extends Post {
  content: object; // Nội dung bài viết ở định dạng JSON của Tiptap
  publishedAt?: string;
  tags: string[];
}
