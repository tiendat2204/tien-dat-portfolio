"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/Icon";
import { LinesPatternCard, LinesPatternCardBody } from "@/components/ui/card-with-lines-patter";

interface BlogPost {
  title: string;
  slug: string;
  publishedAt: string;
  summary: string;
  tags: string[];
}

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blogs");
        if (response.ok) {
          const data = await response.json();
          // Ensure posts have the required structure
          const formattedPosts = data.map((post: any) => ({
            title: post.title || "Untitled",
            slug: post.slug || "",
            publishedAt: post.publishedAt || "",
            summary: post.summary || "",
            tags: post.tags || ["general"],
          }));
          setPosts(formattedPosts);
        }
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Use empty array as fallback if posts is undefined
  const featuredPosts = posts?.slice(0, 3) || [];

  return (
    <section id="blog" className="relative  screen-line-after ">
      <Icon className="absolute z-20 h-6 w-6 -bottom-3 -left-3 text-white" />
      <Icon className="absolute z-20 h-6 w-6 -bottom-3 -right-3 text-white" />

      <div className="mx-auto w-full space-y-8 border-x p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Articles</h2>
          <Link
            href="/blog"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
              // Loading skeleton
              Array(3)
                  .fill(0)
                  .map((_, index) => (
                      <div
                          key={index}
                          className="rounded-lg border bg-background p-4 animate-pulse h-64"
                      >
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                  ))
          ) : featuredPosts.length > 0 ? (
              featuredPosts.map((post, index) => (
                  <motion.div
                      key={post.slug || index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className="h-full dark:bg-muted/50 bg-muted/90 backdrop-blur-lg p-1.5 rounded-2xl"
                  >
                    <LinesPatternCard className="group relative flex flex-col overflow-hidden rounded-xl border bg-background  h-full">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 z-10" />
                      <LinesPatternCardBody className="relative z-20 md:p-4 p-3 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-sm text-muted-foreground">
                            {post.publishedAt && formatDate(post.publishedAt)}
                          </p>
                          {post.tags && post.tags.length > 0 && (
                              <Badge variant="outline" className="bg-primary/10">
                                {post.tags[0]}
                              </Badge>
                          )}
                        </div>

                        <Link href={`/blog/${post.slug}`}>
                          <h3 className="text-lg font-semibold mb-2 group-hover:underline transition-colors">
                            {post.title}
                          </h3>
                        </Link>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {post.summary}
                        </p>

                        <div className="mt-auto pt-2 flex items-center">
                          <Link
                              href={`/blog/${post.slug}`}
                              className="text-sm font-medium text-primary flex items-center"
                          >
                            Read more
                            <ArrowRightIcon className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </LinesPatternCardBody>
                    </LinesPatternCard>
                  </motion.div>
              ))
          ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-muted-foreground">No blog posts found.</p>
              </div>
          )}
        </div>
      </div>
    </section>
  );
}