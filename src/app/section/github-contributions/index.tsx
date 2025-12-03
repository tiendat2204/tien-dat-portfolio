import { Suspense } from "react";

import GitContributionSection, { GitHubContributionFallback } from "./git-contribution-section";
import { getGitHubContributions } from "@/data/github-contributions";
import { Icon } from "@/components/Icon";

export function GitHubContributions() {
  const contributions = getGitHubContributions();

  return (
        <section id='github-contributions' className='relative screen-line-after border-x'>
          <Icon className='absolute z-20 h-6 w-6 -bottom-3 -left-3 dark:text-white text-black' />
          <Icon className='absolute z-20 h-6 w-6 -bottom-3 -right-3 dark:text-white text-black' />
      <Suspense fallback={<GitHubContributionFallback />}>
        <GitContributionSection contributions={contributions} />
      </Suspense>
    </section>
  );
}