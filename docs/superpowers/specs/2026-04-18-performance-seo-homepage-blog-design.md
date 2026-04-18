# Performance + SEO Design for Homepage and Blog Detail Pages

## 1. Problem Statement

The current portfolio should improve both runtime performance and technical SEO on two scoped surfaces:

- Homepage
- Blog detail pages

The approved success target for the first iteration is:

- Lighthouse Performance >= 90
- Lighthouse SEO >= 95

Constraints:

- Keep visible UX changes minimal
- Prefer existing stack and project patterns (no new dependencies unless absolutely required)

## 2. Scope and Non-Goals

### In Scope

- Performance and SEO improvements for homepage and blog detail routes
- Metadata hardening (canonical, OG/Twitter, robots, structured data consistency)
- Rendering/data-delivery optimizations using App Router-compatible static/cached boundaries
- Asset and hydration optimizations that reduce first-load cost with minimal behavior change

### Out of Scope

- Full-site redesign
- Broad refactors unrelated to homepage/blog-detail performance or SEO
- Large behavior/UI rewrites

## 3. Selected Approach (Hybrid A+B)

Use a hybrid of:

1. Route-level hardening for SEO and delivery primitives
2. Rendering strategy improvements for higher cacheability and lower runtime/hydration overhead

Why this approach:

- Delivers strong short-term gains with moderate implementation risk
- Preserves the current structure and user experience
- Creates a clean foundation for later budget enforcement without forcing intrusive changes now

## 4. Architecture

### 4.1 Route Strategy

- Keep current Next.js App Router structure
- Homepage remains highly cacheable with minimal above-the-fold client hydration
- Blog detail pages prefer static/cached output with deterministic revalidation boundaries

### 4.2 SEO Strategy

Introduce/standardize reusable metadata generation for scoped pages:

- Canonical URL generation
- Title/description conventions
- OG/Twitter defaults and fallbacks
- Robots behavior per route state
- Structured data consistency for blog detail content

### 4.3 Delivery Strategy

- Tighten image sizing and loading strategy (priority for critical media, lazy for non-critical)
- Optimize font loading to reduce render-blocking impact
- Add/adjust safe resource hints where beneficial (for example preconnect)

## 5. Component and Data-Flow Design

### 5.1 SEO Layer

- Central metadata builder utilities for homepage/blog pages
- Explicit defaults for missing optional fields
- Predictable output across build/runtime contexts

### 5.2 Rendering and Content Layer

- Homepage data served in a mostly static/cached manner where feasible
- Blog detail content delivered through static/cached route output plus controlled revalidation
- Keep slug/content lookup deterministic and compatible with not-found handling

### 5.3 Hydration Boundary Layer

- Keep client components narrowly scoped to interaction-only islands
- Avoid wrapping large route regions in client boundaries unless necessary
- Defer non-critical client work until after initial render stability

### 5.4 Media and Motion Layer

- Ensure stable image dimensions to avoid layout shift
- Limit first-paint animation/motion cost, deferring non-critical effects
- Preserve current visual identity while reducing initial runtime load

## 6. Error Handling and Fallback Behavior

- No silent failure paths for SEO or route metadata
- Missing metadata inputs use explicit, deterministic defaults
- Invalid blog slug/content returns clear not-found behavior with crawl-safe metadata handling
- Missing media falls back to known placeholders with stable dimensions
- Optimization toggles default to behavior-safe settings to avoid noticeable UX regressions

## 7. Validation Plan and Acceptance Criteria

### 7.1 Primary Acceptance Thresholds

- Homepage: Lighthouse Performance >= 90, SEO >= 95
- Representative blog detail pages: Lighthouse Performance >= 90, SEO >= 95

### 7.2 Checks

- Metadata correctness: canonical, OG/Twitter, robots, schema consistency
- Crawlability and indexability posture for blog detail pages
- JS/hydration reductions where changes are introduced
- Image loading behavior and layout stability
- No obvious UX drift versus baseline interaction/visual behavior

### 7.3 Measurement Method

- Capture before/after Lighthouse reports for scoped routes
- Use representative blog detail pages, not only one favorable case
- Keep only changes that improve metrics while preserving user-facing behavior

## 8. Implementation Notes for Next Phase

- Follow existing codebase patterns and utilities
- Keep edits focused on homepage/blog-detail performance and SEO surfaces
- Prefer small, reversible changes with clear per-route impact

