import type { Registry } from 'shadcn/registry'

import { components } from './registry-components'
import { examples } from './registry-examples'
import { hook } from './registry-hook'
import { lib } from './registry-lib'

const registry = {
  name: 'ttdat',
  homepage: 'https://tiendatdev.me',
  items: [
    ...lib,
    ...hook,
    ...components,

    // Chỉ sử dụng nội bộ
    ...examples,
  ],
} satisfies Registry

export default registry
