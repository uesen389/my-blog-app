export interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
  sha?: string; // GitHub SHA for updates/deletions
  published?: boolean;
  category?: string; // Added based on design
  excerpt?: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  sha?: string;
  published?: boolean;
  category?: string;
  excerpt?: string;
}

export interface Comment {
  id: string;
  postSlug: string;
  author: string;
  content: string;
  date: string;
  reply?: string;
  isRead: boolean;
}
