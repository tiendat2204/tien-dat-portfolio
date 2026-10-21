import type { Activity } from '@/components/kibo-ui/contribution-graph'
import { GITHUB_USERNAME } from './config'

type GitHubContributionsResponse = {
  contributions: Activity[];
}

// Third-party API: a timeout or bad response must not take the homepage down, so failures resolve to null.
export async function getGitHubContributions (): Promise<Activity[] | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
      {
        next: { revalidate: 86400 }, // Cache for 1 day (86400 seconds)
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) return null
    const data = (await res.json()) as GitHubContributionsResponse
    return data.contributions?.length ? data.contributions : null
  } catch {
    return null
  }
}
