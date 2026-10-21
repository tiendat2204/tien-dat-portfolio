import type { Registry } from 'shadcn/schema'

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
    // Imports @/components/ui/navigation-menu from shadcn/ui.
    registryDependencies: ['navigation-menu'],
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
    dependencies: ['framer-motion'],
    files: [
      {
        path: 'DynamicColorExtraction/ProductCardClient.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'infinite-select',
    type: 'registry:component',
    description: 'Single and multiple selects with cursor-paged infinite scroll, debounced server search and selected-item preloading.',
    dependencies: ['lucide-react'],
    registryDependencies: ['popover', 'command', 'badge', 'button', 'skeleton'],
    files: [
      {
        path: 'InfiniteSelect/select-single-infinite-scroll.tsx',
        type: 'registry:component',
      },
      {
        path: 'InfiniteSelect/select-multiple-infinite-scroll.tsx',
        type: 'registry:component',
      },
      {
        path: 'InfiniteSelect/use-infinite-options.ts',
        type: 'registry:component',
      },
    ],
  },
]
