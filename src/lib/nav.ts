export function sectionHref (id: string) {
  return id === 'projects' ? '/projects' : `/#${id}`
}
