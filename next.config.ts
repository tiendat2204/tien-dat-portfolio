const nextConfig = {
  webpack(config: { module: { rules: { test: RegExp; use: string[]; }[]; }; }) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    })

    return config
  },
  trailingSlash: true,
  images: {
    domains: [
      'assets.aceternity.com',
      'cdn.cosmos.so',
      'github.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'res.cloudinary.com',
      'images.unsplash.com',
      'fakeimg.pl',
      'media-aztm-django.vnscdn.com',
      'static-aztm-django.vnscdn.com',
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