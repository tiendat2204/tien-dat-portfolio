export type PostMetadata = {
  title: string;
  summary: string;
  description: string;
  image?: string;
  category?: string;
  // shadcn registry item name, served at /r/<registry>.json
  registry?: string;
  new?: boolean;
  publishedAt: string;
  tags: string[];
}

export type Post = {
  metadata: PostMetadata;
  slug: string;
  content: string;
}
