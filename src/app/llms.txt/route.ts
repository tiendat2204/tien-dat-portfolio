import { getAllPosts } from '@/data/blog'
import { SITE_INFO } from '@/data/config'
import { DATA } from '@/data/resume'

// llms.txt (https://llmstxt.org): a plain-text summary of the site for AI agents,
// generated from the same data the pages render.
export const dynamic = 'force-static'

const strings = (items: readonly unknown[]) => items.filter((i): i is string => typeof i === 'string')

export function GET () {
  const base = SITE_INFO.url.replace(/\/$/, '')
  const skills = DATA.skills
  const lines: string[] = [
    `# ${DATA.name} (Trieu Tien Dat)`,
    '',
    `> ${DATA.description}`,
    '',
    `Location: Ho Chi Minh City, Vietnam. Email: ${DATA.contact.email}. Resume: ${base}/TrieuTienDatCV.pdf`,
    '',
    '## Pages',
    `- [Home](${base}/): profile, skills, experience, projects and awards`,
    `- [Blog](${base}/blog): articles on frontend work and life as a developer`,
    `- [Uses](${base}/uses): how I build with AI coding agents (Claude Code, Codex, GitHub Copilot) and my tools`,
    '',
    '## Experience',
    ...DATA.work.flatMap((company) =>
      company.positions.map((p) => {
        const highlights = strings(p.description).slice(0, 4).map((d) => `  - ${d}`)
        const where = company.company === 'Freelance' ? '' : ` at ${company.company}`
        return [`- ${p.title}${where} (${p.start} - ${p.end ?? 'Present'})`, ...highlights].join('\n')
      })
    ),
    '',
    '## Skills',
    `- Languages: ${skills.languages.map((s) => s.name).join(', ')}`,
    `- Frontend: ${skills.frontend.map((s) => s.name).join(', ')}`,
    `- Backend: ${skills.backend.map((s) => s.name).join(', ')}`,
    `- Database: ${skills.database.map((s) => s.name).join(', ')}`,
    `- Testing & DevOps: ${skills.testingDevOps.map((s) => s.name).join(', ')}`,
    `- AI-assisted development: ${skills.aiTools.map((s) => s.name).join(', ')}`,
    '',
    '## Awards',
    ...DATA.awards.map((a) => `- ${a.title} (${a.dates}, ${a.location})`),
    '',
    '## Blog posts',
    ...getAllPosts().map((p) => `- [${p.metadata.title}](${base}/blog/${p.slug}): ${p.metadata.description ?? ''}`.trimEnd()),
    '',
    '## Links',
    ...Object.values(DATA.contact.social).map((s) => `- [${s.name}](${s.url})`),
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
