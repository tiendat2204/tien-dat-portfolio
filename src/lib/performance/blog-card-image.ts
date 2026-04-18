export function getBlogCardImageProps () {
  return {
    loading: 'lazy' as const,
    sizes: '(max-width: 768px) 100vw, 50vw',
  }
}
