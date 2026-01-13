import type { Registry } from 'shadcn/registry'

export const components: Registry['items'] = [
  {
    name: 'sticker-animation',
    type: 'registry:component',
    files: [
      {
        path: 'StickerCop/StickerCop.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'navigation-menu',
    type: 'registry:component',
    files: [
      {
        path: 'MainNavigation/MainNavigation.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'dynamic-color-extraction',
    type: 'registry:component',
    files: [
      {
        path: 'DynamicColorExtraction/ProductCardClient.tsx',
        type: 'registry:component',
      },
    ],
  },
]
