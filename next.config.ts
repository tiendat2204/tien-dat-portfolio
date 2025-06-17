const nextConfig = {
  webpack(config: { module: { rules: { test: RegExp; use: string[]; }[]; }; }) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    })

    return config
  },
  transpilePackages: ["next-mdx-remote"],
  async rewrites() {
    return [
      {
        source: "/blog/:slug.md",
        destination: "/blog.md/:slug",
      },
    ];
  },
  trailingSlash: true,
  images: {
    domains: [
      'assets.tiendatdev',
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