import Link from 'next/link'
import Image from 'next/image'
import { ArrowRightIcon } from '@radix-ui/react-icons'
import { Badge } from '@/components/ui/badge'
import { BlurFade } from '@/components/magicui/blur-fade'
import type { Post } from '@/types/blog'

// One row per open-source component; shared by the homepage section and /components.
export function ComponentList ({ components, delay }: { components: Post[]; delay: number }) {
  return (
    <ul className='divide-y divide-dashed font-ibm'>
      {components.map((component, index) => (
        <BlurFade key={component.slug} delay={delay + index * 0.05}>
          <li>
            <Link
              href={`/components/${component.slug}`}
              className='group flex items-center gap-4 p-4 transition-colors hover:bg-muted/30'
            >
              {component.metadata.image && (
                <div className='relative size-16 shrink-0 overflow-hidden border border-dashed bg-card'>
                  <Image
                    src={component.metadata.image}
                    alt={component.metadata.title}
                    fill
                    sizes='64px'
                    className='object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                </div>
              )}
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <h3 className='truncate text-sm font-semibold'>{component.metadata.title}</h3>
                  {component.metadata.new && (
                    <Badge variant='default' className='h-4.5 px-1.5 text-[10px]'>NEW</Badge>
                  )}
                </div>
                <p className='mt-1 text-xs text-muted-foreground text-pretty'>
                  {component.metadata.description}
                </p>
                {component.metadata.tags?.length > 0 && (
                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {component.metadata.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} variant='outline' className='px-1.5 text-[10px] font-normal'>
                        # {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <ArrowRightIcon className='size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground' />
            </Link>
          </li>
        </BlurFade>
      ))}
    </ul>
  )
}
