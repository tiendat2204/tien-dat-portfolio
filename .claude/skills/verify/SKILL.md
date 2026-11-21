---
name: verify
description: Verify a finished change in the portfolio before calling it done or committing. Use after editing code, registry components, or data files, and before any commit, merge or deploy.
---

Run the gates and report what you observed, not what you expect.

1. `git diff --stat` and read the diff. Anything outside the files the task needed is a finding.
2. `npx tsc --noEmit`
3. `npx eslint <changed files>` (not `eslint .`, it can run out of memory)
4. `pnpm test:unit`. Check the diff for tests that were skipped, deleted or loosened to pass; that is a failure even when the run is green.
5. If anything under `src/registry/`, `registry-components.ts` or `registry-examples.ts` changed: `pnpm registry:build`, `npx eslint --fix src/__registry__/index.tsx`, then confirm `public/r/*.json` is in the diff.
6. Before a merge or deploy: `pnpm build`.
7. For a visual change: load the page in a browser at 1280 and 390 wide, in light and dark, and look at it.

Report each gate as pass or fail with the evidence. If a gate was skipped, say so and why.
