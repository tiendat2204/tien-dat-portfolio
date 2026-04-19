import type { TOCItemType } from 'fumadocs-core/server'

function hasTextTitle (title: TOCItemType['title']) {
  return typeof title === 'string' ? title.trim().length > 0 : title != null
}

function isHashUrl (url: string) {
  return url.startsWith('#') && url.length > 1
}

export function filterBlogTOCItems (items: TOCItemType[]) {
  return items.filter((item) => {
    return (
      (item.depth === 2 || item.depth === 3) &&
      isHashUrl(item.url) &&
      hasTextTitle(item.title)
    )
  })
}
