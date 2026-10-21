const nextConfig = {
  webpack(config: { module: { rules: { test: RegExp; use: string[]; }[]; }; }) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    })

    return config
  },
  transpilePackages: ["next-mdx-remote"],
  trailingSlash: true,
  // These component docs used to live under /blog; keep old links and rankings working.
  async redirects() {
    return ['dynamic-color-extraction', 'navigation-menu-ssr', 'sticker-animation'].map((slug) => ({
      source: `/blog/${slug}`,
      destination: `/components/${slug}/`,
      permanent: true,
    }))
  },
  images: {
    domains: [
      'github.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'raw.githubusercontent.com',
      "api.microlink.io",

    ],
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
}
export default nextConfig;