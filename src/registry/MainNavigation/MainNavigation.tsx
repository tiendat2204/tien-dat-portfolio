'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'

interface MenuItem {
  name: string
  link: string
  target?: string
  groups: {
    name: string
    items: {
      name: string
      link: string
    }[]
  }[]
}

interface MenuContentProps {
  href: string
  nameMain: string
  items: {
    title: string
    links: {
      name: string
      href: string
    }[]
  }[]
  isActive: boolean
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
      <div className='w-[calc(100vw-5px)] max-w-[calc(100vw-1rem)] lg:w-auto lg:max-w-none'>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-8'>
          {items.map((category, index: number) => (
            <div
              key={index}
              className={`col-span-1 p-4 ${index === 0 ? 'border-r' : ''}`}
            >
              <h3 className='font-semibold mb-2 text-sm uppercase'>
                {category.title}
              </h3>
              <ul className='space-y-1.5'>
                {category.links.map((link, linkIndex: number) => (
                  <li key={linkIndex}>
                    <Link
                      className='text-sm block hover:underline font-light'
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
        <div className='border-t py-2 px-4'>
          <Link
            className='text-sm font-medium hover:underline inline-flex items-center'
            href={href}
          >
            {`Browse All ${nameMain} Collection →`}
          </Link>
        </div>
      </div>
    </NavigationMenuContent>
  )
}

interface MainNavigationProps {
  mainMenu: MenuItem[]
}

export function MainNavigation ({ mainMenu }: MainNavigationProps) {
  const [value, setValue] = useState<string>('')

  return (
    <NavigationMenu value={value} onValueChange={setValue}>
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

export { MenuContent, type MenuItem, type MenuContentProps, type MainNavigationProps }
export default MainNavigation
