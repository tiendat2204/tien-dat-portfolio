import { cn as baseCn } from '@/lib/utils'

export const cn = (...inputs: Parameters<typeof baseCn>) => {
  return baseCn(...inputs)
}
