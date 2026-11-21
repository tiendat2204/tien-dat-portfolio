@AGENTS.md

# Project

Personal portfolio and shadcn component registry (https://tiendat.work). Next.js 16 App Router, React 19, TypeScript, Tailwind, GSAP, Lenis, MDX. Package manager: pnpm.

# Commands

- Dev: `pnpm dev` (a second dev server needs `-p <port>`)
- Types: `npx tsc --noEmit`
- Lint: `npx eslint <files>`. A whole-repo `eslint .` can run out of memory, so lint the files you changed; `pnpm build` runs it anyway.
- Unit tests: `pnpm test:unit`
- Build: `pnpm build`. Build and dev share `.next`; if dev starts returning 404s, `pkill -f "next dev"; rm -rf .next`.

# Registry (src/registry)

- Components are listed in `src/registry/registry-components.ts`, examples in `registry-examples.ts`. Docs live in `src/content/components/*.mdx`.
- After any registry change run `pnpm registry:build`, then `npx eslint --fix src/__registry__/index.tsx`. It rewrites the committed `public/r/*.json`, `registry.json` and `src/__registry__/*`.
- `tests/registry/public-registry.test.ts` fails when `public/r/*.json` is stale.
- Registry files must stay self-contained: no imports from the site outside `@/components/ui`, `@/lib/utils` and sibling registry files.

# Design rules (the owner insists on these)

- Square corners (no rounded), Doto dot-matrix titles, IBM Plex Mono body, `+` corner marks, full-bleed hairline rules (`screen-line-*`), hatch backdrops, zsh-style `$` prompts.
- /projects: one pinned section per project, with a CSS-only SVG diagram driven by the `--p` scroll progress variable (`src/components/projects/diagram`). Real tech logos and facts only.
- Check visual changes in a browser at 1280 and 390 wide, in both themes.

# Workflow

- Commit by pathspec. Leave untracked `AGENTS.md` and `public/icons/codex-icon.svg` / `copilot-icon.svg` alone.
- Deploy is pushing `main` (fast-forward from the feature branch) after `tsc`, `pnpm test:unit` and `pnpm build` pass.
- Lenis owns scrolling: native `window.scrollTo` smooth jumps get overwritten, use `lenis.scrollTo`. Lists inside popovers need `data-lenis-prevent`.
