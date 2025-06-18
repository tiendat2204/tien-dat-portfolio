'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface MenuItem {
  name: string;
  link: string;
  target?: string;
  groups: {
    name: string;
    items: {
      name: string;
      link: string;
    }[];
  }[];
}

interface MenuContentProps {
  href: string;
  nameMain: string;
  items: {
    title: string;
    links: {
      name: string;
      href: string;
    }[];
  }[];
  isActive: boolean;
}

const MenuContent = ({ href, items, isActive, nameMain }: MenuContentProps) => {
  return (
    <NavigationMenuContent
      className='w-full p-0'
      forceMount
      style={{
        display: isActive ? 'block' : 'none',
      }}
    >
      <div className='w-[500px] max-w-[90vw]'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 p-6'>
          {items.map((category, index: number) => (
            <div
              key={index}
              className={`${index === 0 ? 'lg:border-r lg:pr-6' : ''}`}
            >
              <h3 className='font-semibold mb-3 text-sm uppercase text-foreground/90'>
                {category.title}
              </h3>
              <ul className='space-y-2'>
                {category.links.map((link, linkIndex: number) => (
                  <li key={linkIndex}>
                    <Link
                      className='text-sm block hover:text-foreground transition-colors font-light text-muted-foreground'
                      href={link.href}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className='border-t bg-muted/30 py-3 px-6'>
          <Link
            className='text-sm font-medium hover:text-primary transition-colors inline-flex items-center text-foreground/80 hover:text-foreground'
            href={href}
          >
            {`Browse All ${nameMain} →`}
          </Link>
        </div>
      </div>
    </NavigationMenuContent>
  )
}

interface DesktopNavigationProps {
  mainMenu: MenuItem[];
}

function DesktopNavigation ({ mainMenu }: DesktopNavigationProps) {
  const [value, setValue] = useState<string>('')

  return (
    <NavigationMenu value={value} onValueChange={setValue} className='w-full hidden md:flex'>
      <NavigationMenuList>
        {mainMenu.map((menuItem, index) => (
          <NavigationMenuItem
            key={index}
            value={`${menuItem.name.toLowerCase()}-category`}
          >
            <Link href={menuItem.link} target={menuItem.target}>
              <NavigationMenuTrigger className='uppercase font-semibold cursor-pointer hover:text-primary transition-colors'>
                {menuItem.name}
              </NavigationMenuTrigger>
            </Link>
            <MenuContent
              href={menuItem.link}
              nameMain={menuItem.name}
              items={menuItem.groups.map((group) => ({
                title: group.name,
                links: group.items.map((item) => ({
                  name: item.name,
                  href: item.link,
                })),
              }))}
              isActive={value === `${menuItem.name.toLowerCase()}-category`}
            />
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

interface MobileNavigationProps {
  mainMenu: MenuItem[];
}

function MobileNavigation ({ mainMenu }: MobileNavigationProps) {
  const [open, setOpen] = useState(false)
  const [openSections, setOpenSections] = useState<string[]>([])

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev =>
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    )
  }

  return (
    <div className='md:hidden'>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant='ghost' size='icon' className='h-9 w-9'>
            <Menu className='h-5 w-5' />
            <span className='sr-only'>Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-80 p-0'>
          <SheetHeader className='border-b p-6'>
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <div className='overflow-y-auto h-full pb-6'>
            {mainMenu.map((menuItem, index) => (
              <div key={index} className='border-b border-border/40'>
                <Collapsible
                  open={openSections.includes(menuItem.name)}
                  onOpenChange={() => toggleSection(menuItem.name)}
                >
                  <div className='flex items-center justify-between p-4'>
                    <Link
                      href={menuItem.link}
                      target={menuItem.target}
                      className='font-semibold uppercase text-sm hover:text-primary transition-colors flex-1'
                      onClick={() => setOpen(false)}
                    >
                      {menuItem.name}
                    </Link>
                    <CollapsibleTrigger asChild>
                      <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                        <X className={`h-4 w-4 transition-transform ${
                          openSections.includes(menuItem.name) ? 'rotate-45' : 'rotate-0'
                        }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  <CollapsibleContent className='px-4 pb-4'>
                    <div className='space-y-4'>
                      {menuItem.groups.map((group, groupIndex) => (
                        <div key={groupIndex}>
                          <h4 className='font-medium text-sm mb-2 text-foreground/80 uppercase'>
                            {group.name}
                          </h4>
                          <ul className='space-y-2 ml-2'>
                            {group.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <Link
                                  href={item.link}
                                  className='text-sm text-muted-foreground hover:text-foreground transition-colors block py-1'
                                  onClick={() => setOpen(false)}
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className='pt-2 border-t border-border/40'>
                        <Link
                          href={menuItem.link}
                          className='text-sm font-medium text-primary hover:text-primary/80 transition-colors'
                          onClick={() => setOpen(false)}
                        >
                          {`Browse All ${menuItem.name} →`}
                        </Link>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

interface MainNavigationProps {
  mainMenu: MenuItem[];
}

function MainNavigation ({ mainMenu }: MainNavigationProps) {
  return (
    <div className='w-full flex items-center justify-between'>
      <div className='flex-1 flex justify-center md:justify-start'>
        <DesktopNavigation mainMenu={mainMenu} />
      </div>
      <MobileNavigation mainMenu={mainMenu} />
    </div>
  )
}

// Demo data
const demoMenuData: MenuItem[] = [
  {
    name: 'Products',
    link: '/products',
    groups: [
      {
        name: 'Web Development',
        items: [
          { name: 'React Components', link: '/products/react' },
          { name: 'Vue Components', link: '/products/vue' },
          { name: 'Angular Components', link: '/products/angular' },
          { name: 'Vanilla JS', link: '/products/vanilla' },
        ],
      },
      {
        name: 'UI Libraries',
        items: [
          { name: 'Design System', link: '/products/design-system' },
          { name: 'Component Library', link: '/products/components' },
          { name: 'Icon Library', link: '/products/icons' },
          { name: 'Animation Library', link: '/products/animations' },
        ],
      },
      {
        name: 'Tools',
        items: [
          { name: 'Build Tools', link: '/products/build-tools' },
          { name: 'Dev Tools', link: '/products/dev-tools' },
          { name: 'Testing Tools', link: '/products/testing' },
          { name: 'Deployment', link: '/products/deployment' },
        ],
      },
      {
        name: 'Resources',
        items: [
          { name: 'Documentation', link: '/products/docs' },
          { name: 'Examples', link: '/products/examples' },
          { name: 'Tutorials', link: '/products/tutorials' },
          { name: 'Community', link: '/products/community' },
        ],
      },
    ],
  },
  {
    name: 'Solutions',
    link: '/solutions',
    groups: [
      {
        name: 'Enterprise',
        items: [
          { name: 'Custom Development', link: '/solutions/custom' },
          { name: 'Consulting', link: '/solutions/consulting' },
          { name: 'Support', link: '/solutions/support' },
          { name: 'Training', link: '/solutions/training' },
        ],
      },
      {
        name: 'Startups',
        items: [
          { name: 'MVP Development', link: '/solutions/mvp' },
          { name: 'Rapid Prototyping', link: '/solutions/prototype' },
          { name: 'Technical Strategy', link: '/solutions/strategy' },
          { name: 'Team Building', link: '/solutions/team' },
        ],
      },
      {
        name: 'Industries',
        items: [
          { name: 'E-commerce', link: '/solutions/ecommerce' },
          { name: 'Healthcare', link: '/solutions/healthcare' },
          { name: 'Finance', link: '/solutions/finance' },
          { name: 'Education', link: '/solutions/education' },
        ],
      },
    ],
  },
  {
    name: 'Resources',
    link: '/resources',
    groups: [
      {
        name: 'Learning',
        items: [
          { name: 'Blog Posts', link: '/resources/blog' },
          { name: 'Video Tutorials', link: '/resources/videos' },
          { name: 'Code Examples', link: '/resources/examples' },
          { name: 'Best Practices', link: '/resources/best-practices' },
        ],
      },
      {
        name: 'Community',
        items: [
          { name: 'Discord Server', link: '/resources/discord' },
          { name: 'GitHub', link: '/resources/github' },
          { name: 'Discussions', link: '/resources/discussions' },
          { name: 'Events', link: '/resources/events' },
        ],
      },
      {
        name: 'Support',
        items: [
          { name: 'Help Center', link: '/resources/help' },
          { name: 'Contact Us', link: '/resources/contact' },
          { name: 'Feature Requests', link: '/resources/features' },
          { name: 'Bug Reports', link: '/resources/bugs' },
        ],
      },
    ],
  },
]

export default function NavigationMenuSSRDemo () {
  return (
    <div className='w-full'>
      <div className='border rounded-lg p-4 bg-background'>
        <MainNavigation mainMenu={demoMenuData} />
      </div>
    </div>
  )
}
