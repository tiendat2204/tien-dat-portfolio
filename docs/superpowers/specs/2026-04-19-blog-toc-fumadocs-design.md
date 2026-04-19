# Blog Detail TOC (Fumadocs) Design

## Problem

Integrate a Fumadocs-based Table of Contents into blog detail pages so the TOC stays on the right side and remains sticky with `top-[var(--doc-cols-top,0px)]`.

## Confirmed requirements

- Use Fumadocs TOC behavior.
- Show TOC on **desktop + tablet**, hide on mobile.
- Remove the current inline TOC from blog detail pages.
- TOC includes only **H2 + H3** headings.
- If no H2/H3 headings exist, hide TOC entirely.
- Active heading should be highlighted while scrolling.

## Approach options considered

1. **Chosen:** Build a dedicated right-rail TOC component using `fumadocs-core/toc` primitives (`AnchorProvider`, `ScrollProvider`, `TOCItem`) and existing `getTableOfContents`.
2. Add `fumadocs-ui` and adapt a built-in TOC component (extra dependency and styling integration cost).
3. Rework existing inline TOC and implement custom active-state logic (more custom logic, less Fumadocs-native behavior).

Chosen approach gives active-anchor behavior without introducing new packages.

## Architecture

- Keep blog page (`src/app/blog/[slug]/page.tsx`) as the server composition layer.
- Continue generating TOC from post MDX via `getTableOfContents(post.content)`.
- Filter TOC entries to depth 2 and 3.
- Render content in a two-column layout for tablet/desktop:
  - Main article column
  - Right TOC aside column
- TOC aside uses sticky position with `top-[var(--doc-cols-top,0px)]`.
- On mobile, TOC is hidden and article renders in single-column flow.

## Components and responsibilities

- **`src/app/blog/[slug]/page.tsx` (server):**
  - Fetch post
  - Generate and filter TOC data
  - Conditionally render TOC column when filtered list is non-empty
  - Remove existing `InlineTOC` usage from blog detail
- **New `src/components/blog-toc.tsx` (client):**
  - Receive filtered TOC items
  - Use `AnchorProvider` for active-anchor tracking
  - Use `ScrollProvider` + `TOCItem` for active state and container scrolling
  - Render hierarchical links with depth-based indentation
  - Apply active/inactive styles via `data-active`

## Data flow

1. Post content is loaded on the server.
2. Server builds TOC entries via `getTableOfContents`.
3. Server filters entries to H2/H3 and valid links/titles.
4. Server passes filtered TOC to client TOC component.
5. Client observes visible headings and updates active TOC item while scrolling.
6. Clicking TOC link jumps to matching heading anchor.

## Error handling and edge cases

- Invalid TOC entries (missing title/url) are filtered out before render.
- Empty TOC after filtering means no TOC column is rendered.
- Keep existing heading ID generation behavior (no new slug mutation logic in this scope).

## Testing strategy

- Add/extend unit tests for TOC filtering logic:
  - includes only depth 2/3
  - excludes invalid items
  - returns empty when no eligible headings
- Validate layout behavior:
  - TOC visible on tablet/desktop, hidden on mobile
  - TOC sticky offset uses `top-[var(--doc-cols-top,0px)]`
  - Active TOC item updates while scrolling

## Scope boundaries

Out of scope for this spec:

- Global docs-layout refactor beyond blog detail page
- Custom heading slug algorithm changes
- New external TOC UI package adoption

## Acceptance criteria

- Blog detail page shows right-rail TOC on tablet/desktop only.
- TOC is sticky with the required top offset variable expression.
- TOC entries represent only H2/H3 headings.
- Active section highlighting updates during scroll.
- TOC is omitted when content has no H2/H3 headings.
