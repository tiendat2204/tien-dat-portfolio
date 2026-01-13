import type { Registry } from 'shadcn/registry'

export const examples: Registry['items'] = [
  {
    name: 'sticker-animation-demo',
    type: 'registry:example',
    registryDependencies: ['https://tiendatdev.me/r/sticker-animation.json'],
    files: [
      {
        path: 'examples/sticker-animation-demo.tsx',
        type: 'registry:example',
      },
    ],
  },
  {
    name: 'navigation-menu-ssr-demo',
    type: 'registry:example',
    registryDependencies: ['https://tiendatdev.me/r/navigation-menu.json'],
    files: [
      {
        path: 'examples/navigation-menu-ssr-demo.tsx',
        type: 'registry:example',
      },
    ],
  },
  {
    name: 'dynamic-color-extraction-demo',
    type: 'registry:example',
    registryDependencies: ['https://tiendatdev.me/r/dynamic-color-extraction.json'],
    files: [
      {
        path: 'examples/dynamic-color-extraction-demo.tsx',
        type: 'registry:example',
      },
    ],
  },
]
