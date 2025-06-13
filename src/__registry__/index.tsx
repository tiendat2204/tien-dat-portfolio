import React from 'react'

export const Index: Record<string, any> = {
  'sticker-animation': {
    name: 'sticker-animation',
    description: '',
    type: 'registry:component',
    files: [{
      path: 'src/registry/StickerCop/StickerCop.tsx',
      type: 'registry:component',
    }],
  },
  'sticker-animation-demo': {
    name: 'sticker-animation-demo',
    description: '',
    type: 'registry:example',
    files: [{
      path: 'src/registry/examples/sticker-animation-demo.tsx',
      type: 'registry:example',
    }],
    component: React.lazy(() => import('@/registry/examples/sticker-animation-demo')),
  }
}
