import type { MDXRemoteProps } from 'next-mdx-remote/rsc'
import { MDXRemote } from 'next-mdx-remote/rsc'
import rehypeExternalLinks from 'rehype-external-links'
import type { LineElement } from 'rehype-pretty-code'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'

import { ComponentPreview } from '@/components/component-preview'
import { ComponentSource } from '@/components/component-source'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Heading } from '@/components/ui/typography'
import { rehypeAddQueryParams } from '@/lib/rehype-add-query-params'
import { rehypeComponent } from '@/lib/rehype-component'
import { rehypeNpmCommand } from '@/lib/rehype-npm-command'
import { remarkCodeImport } from '@/lib/remark-code-import'
import { cn } from '@/lib/utils'
import type { NpmCommands } from '@/types/unist'

import { CodeBlockCommand } from './code-block-command'
import { CodeTabs } from './code-tabs'
import { CopyButton } from './copy-button'
import { getIconForLanguageExtension, Icons } from './icons'
import { UTM_PARAMS } from '@/data/config'
import { ImageZoom } from './zoomable-image'

const components: MDXRemoteProps['components'] = {
  h1: (props: React.ComponentProps<'h1'>) => <Heading as='h1' {...props} />,
  h2: (props: React.ComponentProps<'h2'>) => <Heading as='h2' {...props} />,
  h3: (props: React.ComponentProps<'h3'>) => <Heading as='h3' {...props} />,
  h4: (props: React.ComponentProps<'h4'>) => <Heading as='h4' {...props} />,
  h5: (props: React.ComponentProps<'h5'>) => <Heading as='h5' {...props} />,
  h6: (props: React.ComponentProps<'h6'>) => <Heading as='h6' {...props} />,
  table: Table,
  thead: TableHeader,
  tbody: TableBody,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
  img: ({ src, alt, className, width, height, ...props }: React.ComponentProps<'img'>) => {
    if (!src || typeof src !== 'string') return <img {...props} />

    return (
      <ImageZoom
        src={src}
        alt={alt || ''}
        className={cn(
          'rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md',
          className
        )}
        width={typeof width === 'string' ? parseInt(width) || 800 : width || 800}
        height={typeof height === 'string' ? parseInt(height) || 600 : height || 600}
        {...props}
      />
    )
  },
  figure ({ className, ...props }: React.ComponentProps<'figure'>) {
    const hasPrettyCode = 'data-rehype-pretty-code-figure' in props

    return (
      <figure
        className={cn(hasPrettyCode && 'not-prose', className)}
        {...props}
      />
    )
  },
  figcaption: ({ children, ...props }: React.ComponentProps<'figcaption'>) => {
    const iconExtension =
        'data-language' in props && typeof props['data-language'] === 'string'
          ? getIconForLanguageExtension(props['data-language'])
          : null

    return (
      <figcaption {...props}>
        {iconExtension}
        {children}
      </figcaption>
    )
  },
  pre ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    __withMeta__,
    __rawString__,

    __pnpm__,
    __yarn__,
    __npm__,
    __bun__,

    ...props
  }: React.ComponentProps<'pre'> & {
    __withMeta__?: boolean;
    __rawString__?: string;
  } & NpmCommands) {
    const isNpmCommand = __pnpm__ && __yarn__ && __npm__ && __bun__

    if (isNpmCommand) {
      return (
        <CodeBlockCommand
          __pnpm__={__pnpm__}
          __yarn__={__yarn__}
          __npm__={__npm__}
          __bun__={__bun__}
        />
      )
    }

    return (
      <>
        <pre {...props} />

        {__rawString__ && (
          <CopyButton
            className='absolute top-2 right-2'
            value={__rawString__}
          />
        )}
      </>
    )
  },
  code: Code,
  ComponentPreview,
  ComponentSource,
  CodeTabs,
  Steps: (props) => (
    <div
      className=' prose-h3:text-wrap'
      {...props}
    />
  ),
  Step: ({ className, ...props }: React.ComponentProps<'h3'>) => (
    <h3 className={cn('step', className)} {...props} />
  ),
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsTriggerShadcnCLI: () => (
    <TabsTrigger value='cli'>
      <Icons.ShadcnUI className='fill-background' />
      shadcn CLI
    </TabsTrigger>
  ),
}

const options: MDXRemoteProps['options'] = {
  mdxOptions: {
    remarkPlugins: [remarkGfm, remarkCodeImport],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { target: '_blank', rel: 'nofollow noopener noreferrer' },
      ],
      rehypeSlug,
      rehypeComponent,
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === 'element' && node?.tagName === 'pre') {
            const [codeEl] = node.children
            if (codeEl.tagName !== 'code') {
              return
            }

            node.__rawString__ = codeEl.children?.[0].value
          }
        })
      },
      [
        rehypePrettyCode,
        {
          theme: {
            dark: 'github-dark',
            light: 'github-light',
          },
          keepBackground: false,
          onVisitLine (node: LineElement) {
            // Prevent lines from collapsing in `display: grid` mode, and allow empty
            // lines to be copy/pasted
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }]
            }
          },
        },
      ],
      () => (tree) => {
        visit(tree, (node) => {
          if (node?.type === 'element' && node?.tagName === 'figure') {
            if (!('data-rehype-pretty-code-figure' in node.properties)) {
              return
            }

            const preElement = node.children.at(-1)
            if (preElement.tagName !== 'pre') {
              return
            }

            preElement.properties['__withMeta__'] =
                node.children.at(0).tagName === 'figcaption'
            preElement.properties['__rawString__'] = node.__rawString__
          }
        })
      },
      rehypeNpmCommand,
      [rehypeAddQueryParams, UTM_PARAMS],
    ],
  },
}

export function MDX ({ code }: { code: string }) {
  return <MDXRemote source={code} components={components} options={options} />
}
