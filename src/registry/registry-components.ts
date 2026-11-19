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
        path: 'InfiniteSelect/infinite-select-types.ts',
        type: 'registry:component',
      },
      {
        path: 'InfiniteSelect/infinite-options-state.ts',
        type: 'registry:component',
      },
      {
        path: 'InfiniteSelect/use-infinite-options.ts',
        type: 'registry:component',
      },
      {
        path: 'InfiniteSelect/use-infinite-scroll-trigger.ts',
        type: 'registry:component',
      },
      {
        path: 'InfiniteSelect/infinite-list-status.tsx',
        type: 'registry:component',
      },
    ],
  },
  {
    name: 'scroll-stage',
    type: 'registry:component',
    description: 'A block that pins while the page scrolls and exposes the scroll progress as a CSS variable, with helpers to animate SVG and HTML in pure CSS.',
    dependencies: ['gsap'],
    files: [
      {
        path: 'ScrollStage/scroll-stage-plan.ts',
        type: 'registry:component',
      },
      {
        path: 'ScrollStage/scroll-progress.ts',
        type: 'registry:component',
      },
      {
        path: 'ScrollStage/use-scroll-stage.ts',
        type: 'registry:component',
      },
      {
        path: 'ScrollStage/scroll-stage.tsx',
        type: 'registry:component',
      },
    ],
  },
]
