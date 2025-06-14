export type PostMetadata = {
  title: string;
  summary: string;
  description: string;
  image?: string;
  category?: string;
  new?: boolean;
  publishedAt: string;
  tags: string[];
}

export type Post = {
  metadata: PostMetadata;
  slug: string;
  content: string;
}
