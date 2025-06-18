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
        path: 'NavigationMenu/MainNavigation.tsx',
        type: 'registry:component',
      },
    ],
  },
]
