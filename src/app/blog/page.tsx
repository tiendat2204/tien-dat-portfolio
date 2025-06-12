"use client";

import { Icon } from "@/components/Icon";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA, LOGO_BASE64 } from "@/data/resume";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FlickeringGrid } from "@/components/ui/flickering-grid-hero";
import { BlurFade } from "@/components/magicui/blur-fade";
import { Icons } from "@/components/icons";
import { Footer } from "@/components/footer";

type BlogPost = {
  slug: string;
  metadata: {
    title: string;
    publishedAt: string;
    summary: string;
    image?: string;
  };
};

const BLUR_FADE_DELAY = 0.04;

const maskStyle = {
  WebkitMaskImage: `url('${LOGO_BASE64}')`,
  WebkitMaskSize: "100vw",
  WebkitMaskPosition: "center",
  WebkitMaskRepeat: "no-repeat",
  maskImage: `url('${LOGO_BASE64}')`,
  maskSize: "200px",
  maskPosition: "center",
  maskRepeat: "no-repeat",
} as const;

const GRID_CONFIG = {
  background: {
    color: "#cccccc",
    maxOpacity: 0.05,
    flickerChance: 0.08,
    squareSize: 6,
    gridGap: 6,
  },
  logo: {
    color: "#FFFFFF",
    maxOpacity: 0.95,
    flickerChance: 0.12,
    squareSize: 4,
    gridGap: 8,
  },
} as const;

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/blogs');
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main className="flex flex-col ">
      <section
        id="background"
        className="relative screen-line-before border-x"
      >
        <Icon className="absolute z-20 h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
        <Icon className="absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
        <Icon className="absolute z-20 h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
        <Icon className="absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />
        <div className="flex w-full h-[200px] justify-center items-center">
          <FlickeringGrid
            className={`absolute inset-0 z-0 [mask-image:radial-gradient(1000px_circle_at_center,white,transparent)] motion-safe:animate-pulse`}
            {...GRID_CONFIG.background}
          />
          <div
            className="absolute inset-0 z-0 motion-safe:animate-fade-in"
            style={{
              ...maskStyle,
              animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          >
            <FlickeringGrid {...GRID_CONFIG.logo} />
          </div>
        </div>
      </section>

      <section
        id="blog-header"
        className="relative screen-line-before screen-line-after "
      >
        <Icon className="absolute z-20 h-6 w-6 -bottom-3 -left-3 text-white" />
        <Icon className="absolute z-20 h-6 w-6 -bottom-3 -right-3 text-white" />
        <div className="mx-auto w-full space-y-8 border-x">
          <div className="flex items-stretch justify-center w-full min-h-[120px] ">
            <div className="flex flex-col justify-between h-full min-h-[140px] md:min-h-[170px] w-full">
              <div className="flex items-center justify-between border-y w-full">
                <BlurFadeText
                  delay={BLUR_FADE_DELAY}
                  className="text-3xl font-extrabold tracking-tight sm:text-3xl font-doto px-4"
                  yOffset={0}
                  text="Blog"
                />
                <div className="size-6 mr-4">
                  <Icons.logo />
                </div>
              </div>
              <BlurFade delay={BLUR_FADE_DELAY}>
                <p className="px-4 font-normal font-ibm text-left text-muted">
                  Thoughts, ideas, and reflections
                </p>
              </BlurFade>
            </div>
          </div>
        </div>
      </section>

      <section id="blog-posts" className="relative screen-line-after border-x">
        <Icon className="absolute z-20 h-6 w-6 -top-3 -left-3 text-white" />
        <Icon className="absolute z-20 h-6 w-6 -bottom-3 -left-3 text-white" />
        <Icon className="absolute z-20 h-6 w-6 -top-3 -right-3 text-white" />
        <Icon className="absolute z-20 h-6 w-6 -bottom-3 -right-3 text-white" />

        <div className="border-b">
          <BlurFade delay={BLUR_FADE_DELAY * 3} offset={0}>
            <h2 className="text-2xl font-extrabold px-4 font-doto">All Posts</h2>
          </BlurFade>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="border p-4 rounded-md">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                </div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4 font-ibm">
              {posts.map((post, index) => (
                <BlurFade key={post.slug} delay={BLUR_FADE_DELAY * (index + 4)} offset={0}>
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="border p-4 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                      <h3 className="text-xl font-bold mb-1">{post.metadata.title}</h3>
                      <div className="text-sm text-muted-foreground mb-2">
                        {new Date(post.metadata.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <p className="text-sm text-muted-foreground">{post.metadata.summary}</p>
                    </div>
                  </Link>
                </BlurFade>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No blog posts found.</p>
          )}
        </div>
      </section>
    </main>
  );
}
