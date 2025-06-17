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
]
