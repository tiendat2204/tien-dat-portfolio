import { Icons } from '@/components/icons'
import { GitHub } from '@/components/icons/github-icon'
import { Facebook } from '@/components/icons/facebook-icon'
import { LinkedIn } from '@/components/icons/linked-icon'
import { CpuIcon, FolderIcon, NotebookIcon } from 'lucide-react'
import { Zalo } from '@/components/icons/zalo-icon'

export const DATA = {
  name: 'Tien Dat',
  initials: 'TD',
  url: 'https://tiendat.work/',
  location:
    '106/02/07 Quang Trung Street, Go Vap District, Ho Chi Minh City, Vietnam',
  locationLink:
    'https://www.google.com/maps/search/?api=1&query=106%2F02%2F07+Quang+Trung,+Go+Vap,+Ho+Chi+Minh+City,+Vietnam',
  description:
    'Fullstack developer with a strong focus on frontend development and a passion for building scalable, user-centric web applications. I have experience in React, Next.js, Typescript, Node.js, Python, and more. I love to build products that solve real-world problems and help people achieve their goals.',
  summary:
    'I am a fullstack developer with a strong focus on frontend development and a passion for building scalable, user-centric web applications. I have experience in React, Next.js, Typescript, Node.js, Python, and more. I love to build products that solve real-world problems and help people achieve their goals. I am always looking for new challenges and opportunities to learn and grow.',
  avatarUrl: '/me.jpg',
  avatarLineArtUrl: '/me-lineart.svg?v=11',
  avatarLineArtDarkUrl: '/me-lineart-dark.svg?v=3',
  skills: {
    // Grouped like the CV. Icons live in /public/icons; `iconDark` is used in dark mode when set.
    languages: [
      { name: 'TypeScript', icon: 'skills/typescript.svg' },
      { name: 'JavaScript', icon: 'skills/javascript.svg' },
      { name: 'Python', icon: 'skills/python.svg' },
      { name: 'Dart', icon: 'skills/dart.svg' },
      { name: 'HTML', icon: 'skills/html.svg' },
      { name: 'CSS', icon: 'skills/css.svg' },
    ],
    frontend: [
      { name: 'React', icon: 'skills/react.svg', iconDark: 'skills/react-dark.svg' },
      { name: 'Next.js', icon: 'skills/nextjs.svg', iconDark: 'skills/nextjs-dark.svg' },
      { name: 'TanStack Router · Query · Table', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' },
      { name: 'Zustand' },
      { name: 'Redux', icon: 'skills/redux.svg' },
      { name: 'Tailwind CSS', icon: 'skills/tailwindcss.svg' },
      { name: 'shadcn/ui', icon: 'skills/shadcn.svg', iconDark: 'skills/shadcn-dark.svg' },
      { name: 'React Hook Form', icon: 'react-hook-form-icon.svg' },
      { name: 'Zod', icon: 'skills/zod.svg' },
      { name: 'Vite', icon: 'skills/vite.svg' },
      { name: 'Motion', icon: 'skills/motion.svg', iconDark: 'skills/motion-dark.svg' },
      { name: 'Leaflet / MapLibre', icon: 'leaflet-icon.svg' },
    ],
    mobile: [
      { name: 'Flutter', icon: 'skills/flutter.svg' },
      { name: 'React Native', icon: 'skills/react.svg', iconDark: 'skills/react-dark.svg' },
      { name: 'Riverpod', icon: 'skills/riverpod.svg' },
    ],
    backend: [
      { name: 'Node.js', icon: 'skills/nodejs.svg' },
      { name: 'NestJS', icon: 'skills/nestjs.svg' },
      { name: 'Express', icon: 'skills/express.svg', iconDark: 'skills/express-dark.svg' },
      { name: 'Django REST Framework', icon: 'skills/django.svg' },
      { name: 'Prisma', icon: 'skills/prisma.svg', iconDark: 'skills/prisma-dark.svg' },
      { name: 'Drizzle', icon: 'skills/drizzle.svg', iconDark: 'skills/drizzle-dark.svg' },
      { name: 'Better Auth', icon: 'skills/better-auth.svg', iconDark: 'skills/better-auth-dark.svg' },
      { name: 'Cloudinary', icon: 'skills/cloudinary.svg' },
    ],
    database: [
      { name: 'PostgreSQL', icon: 'skills/postgresql.svg' },
      { name: 'MySQL', icon: 'skills/mysql.svg', iconDark: 'skills/mysql-dark.svg' },
      { name: 'MongoDB', icon: 'skills/mongodb.svg', iconDark: 'skills/mongodb-dark.svg' },
      { name: 'SQLite', icon: 'skills/sqlite.svg' },
    ],
    testingDevOps: [
      { name: 'Playwright', icon: 'skills/playwright.svg' },
      { name: 'Vitest', icon: 'skills/vitest.svg' },
      { name: 'axe-core' },
      { name: 'Docker', icon: 'skills/docker.svg' },
      { name: 'GitHub Actions', icon: 'skills/github.svg', iconDark: 'skills/github-dark.svg' },
      { name: 'Git', icon: 'skills/git.svg' },
      { name: 'Nginx', icon: 'skills/nginx.svg' },
    ],
    aiTools: [
      { name: 'Claude Code', icon: 'skills/claude.svg' },
      { name: 'Codex', icon: 'skills/openai.svg', iconDark: 'skills/openai-dark.svg' },
      { name: 'GitHub Copilot', icon: 'skills/copilot.svg', iconDark: 'skills/copilot-dark.svg' },
    ],
    tools: [
      { name: 'WebStorm', icon: 'skills/webstorm.svg' },
      { name: 'VS Code', icon: 'skills/vscode.svg' },
      { name: 'Postman', icon: 'skills/postman.svg' },
      { name: 'Figma', icon: 'skills/figma.svg' },
      { name: 'Photoshop', icon: 'skills/photoshop.svg' },
    ],
    platforms: [
      { name: 'GitHub', icon: 'skills/github.svg', iconDark: 'skills/github-dark.svg' },
      { name: 'Netlify', icon: 'skills/netlify.svg' },
      { name: 'Vercel', icon: 'skills/vercel.svg', iconDark: 'skills/vercel-dark.svg' },
    ],
  },
  navbar: [
    // { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/projects', icon: FolderIcon, label: 'Projects' },
    { href: '/blog', icon: NotebookIcon, label: 'Blog' },
    { href: '/uses', icon: CpuIcon, label: 'Uses' },
  ],
  contact: {
    email: 'tiendat220404@gmail.com',
    tel: '035 4411 541',
    social: {
      GitHub: {
        name: 'GitHub',
        icon: GitHub,
        url: 'https://github.com/tiendat2204',
        image:
          'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
        navbar: true,
      },
      LinkedIn: {
        name: 'LinkedIn',
        icon: LinkedIn,
        url: 'https://www.linkedin.com/in/ttd-7796b5341/',
        image:
          'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
        navbar: true,
      },
      Facebook: {
        name: 'Facebook',
        url: 'https://www.facebook.com/tien.at.761069/',
        icon: Facebook,
        image:
          'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
        navbar: true,
      },
      Zalo: {
        name: 'Zalo',
        url: 'https://zalo.me/0354411541',
        icon: Zalo,
        image:
          'https://upload.wikimedia.org/wikipedia/commons/d/d6/Logo_Zalo.png',
        navbar: true,
      },
    },
  },
  work: [
    {
      company: 'TA Consultant',
      href: '#',
      location: 'Ho Chi Minh City, Vietnam',
      logoUrl: '/LogoTA.svg',
      positions: [
        {
          title: 'Fullstack Developer',
          badges: ['Frontend', 'Full Stack'],
          start: 'Jun 2025',
          end: 'Present',
          isExpanded: true,
          description: [
            'AGRITA - Agricultural Cooperative SaaS Platform: owning UI/UX design and frontend for 3 connected apps (admin console, farm management, public marketplace) from BA requirements',
            'Won the Consolation Prize and Most Favorite Project Award at HUIT Startup 2026 (Business Track, city-level, 244 entries) with AGRITA',
            'Built a shared design system (semantic tokens, data tables, permission-aware screens, loading, empty and error states) reused across all three apps',
            'Delivered map-based plot management for cooperatives, drawing and editing field boundaries with Leaflet/MapLibre',
            'Built the marketplace buyer journey: storefronts, product pages, cart, checkout and QR origin tracing',
            'Built AgriTA Mobile, the Flutter client for field workers: cultivation journal with camera photos, harvests, tasks and an offline outbox',
            'Added Playwright E2E and axe-core accessibility tests',
            'E-Office Workflow (separate client): built business workflow features and secure APIs, reducing approval workflow time by 70% with an automated system',
            'Digital Library for a Pagoda: developed and maintained a full-stack system with book catalog management, borrowing records and role-based access control, managing 40,000+ books for 1,000+ active users',
            'Developing advanced document editing applications with React.js, TipTap and Redux for Word, Excel, and PDF formats',
            'Building interactive document editors with real-time collaboration features',
            'Implementing file conversion and processing capabilities for multiple document formats',
            'Creating responsive user interfaces with Vite and TailwindCSS for optimal performance',
            'Developing efficient data management solutions using TanStack Query for document operations',
            'Building custom hooks and components for document manipulation and viewing',
            'Optimizing application performance for handling large documents and complex editing operations',
          ],
          technologies: [
            { name: 'React.js', icon: 'skills/react.svg', iconDark: 'skills/react-dark.svg' },
            { name: 'Next.js', icon: 'skills/nextjs.svg', iconDark: 'skills/nextjs-dark.svg' },
            { name: 'TypeScript', icon: 'skills/typescript.svg' },
            { name: 'TailwindCSS', icon: 'skills/tailwindcss.svg' },
            { name: 'TanStack Query', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' },
            { name: 'TanStack Router & Table', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' },
            { name: 'Shadcn UI', icon: 'skills/shadcn.svg', iconDark: 'skills/shadcn-dark.svg' },
            { name: 'Leaflet/MapLibre', icon: 'leaflet-icon.svg' },
            { name: 'React Hook Form', icon: 'react-hook-form-icon.svg' },
            { name: 'Zod', icon: 'skills/zod.svg' },
            { name: 'Redux', icon: 'skills/redux.svg' },
            { name: 'Playwright', icon: 'skills/playwright.svg' },
            { name: 'Vitest', icon: 'skills/vitest.svg' },
          ],
        },
      ],
    },
    {
      company: 'VietDev Studio',
      href: 'https://www.facebook.com/vietdevstudio/',
      location: 'Ho Chi Minh City, Vietnam',
      logoUrl: '/vietdev-logo.jpg',
      positions: [
        {
          title: 'Fullstack Developer',
          badges: ['Frontend Lead', 'Full Stack'],
          start: 'Sep 2024',
          end: 'Jun 2025',
          isExpanded: true,
          description: [
            'Led frontend development for a story community platform using Next.js SSR to optimize performance and SEO',
            'Built and maintained a story community forum with over 10,000 users, supporting reading, community interaction and content sharing',
            'Built responsive interfaces with Shadcn UI and Tailwind CSS, with efficient data fetching and server-state management using TanStack Query',
            'Developed secure authentication and authorization with JWT and Django REST Framework',
            'Set up CI/CD pipelines with GitHub Actions for automated testing and deployment',
            'Created reusable UI components and custom React hooks to keep the interface consistent',
          ],
          technologies: [
            { name: 'Next.js', icon: 'skills/nextjs.svg', iconDark: 'skills/nextjs-dark.svg' },
            { name: 'React', icon: 'skills/react.svg', iconDark: 'skills/react-dark.svg' },
            { name: 'TypeScript', icon: 'skills/typescript.svg' },
            { name: 'Shadcn UI', icon: 'skills/shadcn.svg', iconDark: 'skills/shadcn-dark.svg' },
            { name: 'TailwindCSS', icon: 'skills/tailwindcss.svg' },
            { name: 'TanStack Query', icon: 'skills/tanstack.svg', iconDark: 'skills/tanstack-dark.svg' },
            { name: 'Django', icon: 'skills/django.svg' },
            { name: 'PostgreSQL', icon: 'skills/postgresql.svg' },
            { name: 'Python', icon: 'skills/python.svg' },
            { name: 'JWT Authentication', icon: 'auth-icon.svg' },
          ],
        },
      ],
    },
    {
      company: 'Freelance',
      href: '#',
      location: 'Remote',
      logoUrl: '/freelancer.jpeg',
      positions: [
        {
          title: 'Frontend Developer - Freelance',
          badges: ['Frontend', 'Web Development'],
          start: 'Jan 2024',
          end: 'Jun 2024',
          isExpanded: false,
          description: [
            'Developed a shoe cleaning service booking application with user-friendly scheduling interface',
            'Built responsive landing pages and booking workflows with vanilla JavaScript and custom CSS',
            'Implemented secure user authentication system with JWT for customer accounts',
            'Created intuitive calendar-based appointment scheduling with real-time availability checking',
            'Designed mobile-first UI/UX focused on simplicity and ease of use for customers',
            'Integrated payment gateway for secure online transactions',
            'Collaborated with backend developer on RESTful API integration and data flow optimization',
          ],
          technologies: [
            { name: 'JavaScript', icon: 'skills/javascript.svg' },
            { name: 'HTML', icon: 'skills/html.svg' },
            { name: 'CSS', icon: 'skills/css.svg' },
            { name: 'Node.js', icon: 'skills/nodejs.svg' },
            { name: 'Express.js', icon: 'skills/express.svg', iconDark: 'skills/express-dark.svg' },
            { name: 'JWT Authentication', icon: 'auth-icon.svg' },
            { name: 'MongoDB', icon: 'skills/mongodb.svg', iconDark: 'skills/mongodb-dark.svg' },
          ],
        },
      ],
    },
  ],
  education: [
    {
      school: 'FPT Polytechnic College',
      href: 'https://fpt.edu.vn',
      degree: 'Associate Degree (College Diploma) in Web Development',
      logoUrl: '/fpt-logo.svg',
      start: 'Aug 2022',
      end: 'May 2024',
      isExpanded: true,
      description: [
        'Studied modern software development methodologies and practices',
        <span key='js-talent'>
          Achieved{' '}
          {/* Photos live on the award card below; a hover preview here duplicated them and never opened on touch. */}
          <a href='#awards' className='font-bold underline'>
            3rd place in JS Talent competition
          </a>{' '}
          for front-end development skills
        </span>,
        <span key='golden-bee'>
          Awarded{' '}
          <a href='#awards' className='font-bold underline'>
            Golden Bee Award (6th edition)
          </a>{' '}
          for academic excellence
        </span>,
        'Built applications with React, Next.js and Node.js',
        'Worked on real-world projects with industry partners',
        'Developed strong fundamentals in algorithms and data structures',
      ],
      technologies: [
        { name: 'JavaScript', icon: 'skills/javascript.svg' },
        { name: 'TypeScript', icon: 'skills/typescript.svg' },
        { name: 'React', icon: 'skills/react.svg', iconDark: 'skills/react-dark.svg' },
        { name: 'Next.js', icon: 'skills/nextjs.svg', iconDark: 'skills/nextjs-dark.svg' },
        { name: 'Node.js', icon: 'skills/nodejs.svg' },
        { name: 'PostgreSQL', icon: 'skills/postgresql.svg' },
        { name: 'TailwindCSS', icon: 'skills/tailwindcss.svg' },
        { name: 'Django', icon: 'skills/django.svg' },
        { name: 'Python', icon: 'skills/python.svg' },
        { name: 'GitHub', icon: 'skills/github.svg', iconDark: 'skills/github-dark.svg' },
        { name: 'Figma', icon: 'skills/figma.svg' },
        { name: 'Postman', icon: 'skills/postman.svg' },
        { name: 'VSCode', icon: 'skills/vscode.svg' },
      ],
    },
    {
      school: 'Nguyen Viet Xuan High School',
      href: '#',
      degree: 'High School',
      logoUrl: '',
      start: '2020',
      end: '2023',
      isExpanded: false,
      description: [
        'Graduated with good academic standing in mathematics',
        'Developed foundation in computer science fundamentals',
        'Completed basic web development projects',
      ],
    },
  ],
  projects: [
    {
      title: 'Tien Dat Portfolio',
      href: 'https://tiendat.work/',
      logoUrl: '/project-logo.png',
      positions: [
        {
          title: 'Personal Project',
          badges: ['Active'],
          start: 'June 2024',
          end: 'Present',
          isExpanded: true,
          description: [
            'Built a modern portfolio and blog platform to showcase my projects and technical writing',
            'Created a component library with reusable UI elements for future projects and demonstrations',
            'Implemented dynamic content rendering with MDX for rich, interactive blog posts',
            'Developed a custom theming system with light/dark mode support',
            'Optimized performance with Next.js Image optimization and static site generation',
            'Designed mobile-first responsive layouts with clean animations and transitions',
            'Set up analytics to track user engagement and content performance',
          ],
          technologies: [
            { name: 'Next.js', icon: 'skills/nextjs.svg', iconDark: 'skills/nextjs-dark.svg' },
            { name: 'TypeScript', icon: 'skills/typescript.svg' },
            { name: 'TailwindCSS', icon: 'skills/tailwindcss.svg' },
            { name: 'Shadcn UI', icon: 'skills/shadcn.svg', iconDark: 'skills/shadcn-dark.svg' },
            { name: 'Framer Motion', icon: 'skills/motion.svg', iconDark: 'skills/motion-dark.svg' },
            { name: 'Vercel', icon: 'skills/vercel.svg', iconDark: 'skills/vercel-dark.svg' },
            { name: 'GitHub', icon: 'skills/github.svg', iconDark: 'skills/github-dark.svg' },
            { name: 'React', icon: 'skills/react.svg', iconDark: 'skills/react-dark.svg' },
            { name: 'JavaScript', icon: 'skills/javascript.svg' },
            { name: 'Figma', icon: 'skills/figma.svg' },
            { name: 'Postman', icon: 'skills/postman.svg' },
            { name: 'VSCode', icon: 'skills/vscode.svg' },
            { name: 'WebStorm', icon: 'skills/webstorm.svg' },
          ],
        },
      ],
      links: [
        {
          type: 'Website',
          href: 'https://tiendat.work/',
          icon: <Icons.Globe className='size-3' />,
        },
        {
          type: 'Source',
          href: 'https://github.com/tiendat2204/tien-dat-portfolio',
          icon: <Icons.Github className='size-3' />,
        },
      ],
      image: '/logo.svg',
      invertInLight: true,
    },
    {
      title: 'E-booking Healthcare',
      href: 'https://e-booking-healthcare-git-main-tiendat224s-projects.vercel.app/',
      logoUrl: '/project-logo.png',
      positions: [
        {
          title: 'Frontend Developer',
          badges: ['Active'],
          start: 'Feb 2024',
          end: 'Oct 2024',
          isExpanded: true,
          description: [
            'Developed a comprehensive online booking system for Diamond Medical Clinic to streamline appointment scheduling process',
            'Implemented secure online payment gateway for patients to pay consultation fees in advance',
            'Created admin dashboard for clinic staff to manage multiple branch locations, doctors, schedules, and appointments',
            'Built patient portal allowing users to view medical history, upcoming appointments, and receive reminders',
            'Integrated real-time availability checking to prevent double-booking of medical resources',
          ],
          technologies: [
            { name: 'React.js', icon: 'skills/react.svg', iconDark: 'skills/react-dark.svg' },
            { name: 'Node.js', icon: 'skills/nodejs.svg' },
            { name: 'Express.js', icon: 'skills/express.svg', iconDark: 'skills/express-dark.svg' },
            { name: 'Laravel', icon: 'laravel-icon.svg' },
            { name: 'MySQL', icon: 'skills/mysql.svg', iconDark: 'skills/mysql-dark.svg' },
            { name: 'TailwindCSS', icon: 'skills/tailwindcss.svg' },
            { name: 'Shadcn UI', icon: 'skills/shadcn.svg', iconDark: 'skills/shadcn-dark.svg' },
          ],
        },
      ],
      links: [
        {
          type: 'Website',
          href: 'https://e-booking-healthcare-git-main-tiendat224s-projects.vercel.app/',
          icon: <Icons.Globe className='size-3' />,
        },
        {
          type: 'Source',
          href: 'https://github.com/tiendat2204/E-booking-Healthcare',
          icon: <Icons.Github className='size-3' />,
        },
      ],
      image: '/projects/healthcare-booking.png',
    },
    {
      title: 'WeUI Clone',
      href: 'https://weui-clone.vercel.app',
      logoUrl: '/project-logo.png',
      positions: [
        {
          title: 'Frontend Developer',
          badges: ['Active'],
          start: 'May 2024',
          end: 'June 2024',
          isExpanded: false,
          description: [
            'Created a pixel-perfect clone of WeUI interface components from scratch using React and TailwindCSS',
            'Implemented responsive design principles to ensure compatibility across all device sizes',
            'Built reusable UI components following the WeUI design language without using external component libraries',
            'Developed interactive animations and transitions to match the native WeUI experience',
            'Optimized performance using React best practices and code splitting techniques',
          ],
          technologies: [
            { name: 'React', icon: 'skills/react.svg', iconDark: 'skills/react-dark.svg' },
            { name: 'Vite', icon: 'skills/vite.svg' },
            { name: 'TailwindCSS', icon: 'skills/tailwindcss.svg' },
            { name: 'JavaScript', icon: 'skills/javascript.svg' },
            { name: 'CSS', icon: 'skills/css.svg' },
          ],
        },
      ],
      links: [
        {
          type: 'Demo',
          href: 'https://test-intern-tiendat224s-projects.vercel.app/',
          icon: <Icons.Globe className='size-3' />,
        },
        {
          type: 'Source',
          href: 'https://github.com/tiendat2204/clone-we-ui',
          icon: <Icons.Github className='size-3' />,
        },
      ],
      image: '/projects/wechat.png',
    },
    {
      title: 'Coi Shop',
      href: 'https://coi-shop.vercel.app/',
      logoUrl: '/project-logo.png',
      positions: [
        {
          title: 'Full Stack Developer',
          badges: ['Active'],
          start: 'February 2024',
          end: 'May 2024',
          isExpanded: false,
          description: [
            'Built a complete e-commerce platform from scratch with product catalog, shopping cart, and checkout functionality',
            'Implemented user authentication system with JWT and role-based access control for customers and admins',
            'Designed responsive UI with TailwindCSS ensuring optimal user experience across all device sizes',
            'Created admin dashboard for product management, order processing, and inventory tracking',
            'Developed RESTful API with Express.js for seamless communication between frontend and backend',
            'Set up MongoDB database with optimized schemas for efficient data storage and retrieval',
            'Integrated payment processing system with secure checkout flow',
          ],
          technologies: [
            { name: 'React', icon: 'skills/react.svg', iconDark: 'skills/react-dark.svg' },
            { name: 'Vite', icon: 'skills/vite.svg' },
            { name: 'TailwindCSS', icon: 'skills/tailwindcss.svg' },
            { name: 'Node.js', icon: 'skills/nodejs.svg' },
            { name: 'Express.js', icon: 'skills/express.svg', iconDark: 'skills/express-dark.svg' },
            { name: 'MongoDB', icon: 'skills/mongodb.svg', iconDark: 'skills/mongodb-dark.svg' },
            { name: 'JWT Authentication', icon: 'auth-icon.svg' },
            { name: 'JavaScript', icon: 'skills/javascript.svg' },
          ],
        },
      ],
      links: [
        {
          type: 'Demo',
          href: 'https://coishop.vercel.app',
          icon: <Icons.Globe className='size-3' />,
        },
        {
          type: 'Source',
          href: 'https://github.com/tiendat2204/Coi-Shop',
          icon: <Icons.Github className='size-3' />,
        },
      ],
      image: '/projects/coi-shop.png',
    },
    {
      title: 'Memory Game',
      href: 'https://memory-game-tiendat.vercel.app',
      logoUrl: '/project-logo.png',
      positions: [
        {
          title: 'Game Developer',
          badges: ['Competition'],
          start: 'October 2023',
          end: 'November 2023',
          isExpanded: false,
          description: [
            "Developed an interactive memory card matching game for FPT Polytechnic College's Game Development Competition",
            'Implemented core game mechanics including card flipping, matching logic, and scoring system',
            'Created responsive design with CSS animations for engaging user experience across devices',
            'Built timer functionality and difficulty levels to enhance gameplay challenge',
            'Optimized performance with vanilla JavaScript without relying on external libraries',
            'Incorporated sound effects and visual feedback to improve player engagement',
          ],
          technologies: [
            { name: 'HTML', icon: 'skills/html.svg' },
            { name: 'CSS', icon: 'skills/css.svg' },
            { name: 'JavaScript', icon: 'skills/javascript.svg' },
            { name: 'Local Storage' },
          ],
        },
      ],
      links: [
        {
          type: 'Source',
          href: 'https://github.com/ngchinhdev/memory-game',
          icon: <Icons.Github className='size-3' />,
        },
      ],
    },
    {
      title: 'Sticker Animation',
      href: 'https://sticker-animation.vercel.app',
      logoUrl: '/project-logo.png',
      positions: [
        {
          title: 'Frontend Developer',
          badges: ['Side Project'],
          start: 'March 2024',
          end: 'April 2024',
          isExpanded: false,
          description: [
            'Developed a Facebook-like sticker animation system for modern web applications',
            'Implemented fluid animations using Framer Motion for natural-feeling sticker interactions',
            'Created custom emoji reactions with dynamic flight paths and physics-based movements',
            'Built responsive design that works seamlessly on both desktop and mobile devices',
            "Engineered optimized rendering with React's useMemo and useCallback hooks for smooth performance",
            'Developed a reusable component library for easy integration into other projects',
          ],
          technologies: [
            { name: 'Next.js', icon: 'skills/nextjs.svg', iconDark: 'skills/nextjs-dark.svg' },
            { name: 'TypeScript', icon: 'skills/typescript.svg' },
            { name: 'TailwindCSS', icon: 'skills/tailwindcss.svg' },
            { name: 'Framer Motion', icon: 'skills/motion.svg', iconDark: 'skills/motion-dark.svg' },
            { name: 'React', icon: 'skills/react.svg', iconDark: 'skills/react-dark.svg' },
          ],
        },
      ],
      links: [
        {
          type: 'Demo',
          href: 'https://sticker-animation-umber.vercel.app/',
          icon: <Icons.Globe className='size-3' />,
        },
        {
          type: 'Source',
          href: 'https://github.com/tiendat2204/StickerAnimation',
          icon: <Icons.Github className='size-3' />,
        },
      ],
      image: '/blog/sticker-animation.png',
    },
  ],
  awards: [
    {
      title: 'Consolation Prize & Most Favorite Project Award - HUIT Startup 2026',
      dates: 'October 18, 2026',
      location: 'Ho Chi Minh City University of Industry and Trade (HUIT)',
      description:
        'AGRITA, the agricultural cooperative SaaS platform built at TA Consultant, won the Consolation Prize and the Most Favorite Project Award in the Business Track of the 7th HUIT Startup competition (city-level), which drew 244 projects and over 1,000 contestants, with 37 finalists.',
      image: '/huit-startup-2026.jpg',
      images: ['/huit-startup-2026.jpg', '/huit-startup-2026-stage.jpg'],
      logo: '/huit-startup-logo.png',
      links: [
        {
          title: 'Diễn đàn Doanh nghiệp',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://diendandoanhnghiep.vn/huit-startup-2026-ket-noi-nguon-luc-mo-duong-ra-thi-truong-10186204.html',
        },
        {
          title: 'Công Thương',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://congthuong.vn/tim-ra-quan-quan-cuoc-thi-huit-startup-lan-thu-vii-nam-2026-477503.html',
        },
        {
          title: 'Giáo dục Thời đại',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://giaoducthoidai.vn/244-du-an-tranh-tai-tai-huit-startup-2026-tong-gia-tri-ho-tro-5-ty-dong-post796532.html',
        },
      ],
    },
    {
      title: 'AI Fluency for Creative Work Certificate',
      dates: 'November 27, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the AI Fluency for creative work course with a perfect quiz score (9 of 9): the Creative Value and Production lenses, the 4D Framework as two nested loops, the five roles AI can take in a piece of work, and a personal AI use policy.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/0027dc77d2c22d26f7c9d4ed5f17edbc',
        },
      ],
    },
    {
      title: 'AI Fluency: Framework and Foundations Certificate',
      dates: 'November 27, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the AI Fluency: Framework and foundations course with a perfect quiz score (10 of 10): effective, efficient, ethical and safe collaboration with AI, and the 4D competencies (Delegation, Description, Discernment, Diligence) with their components.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/e9412a0f6ed266e156d318e0f9567fac',
        },
      ],
    },
    {
      title: 'AI Capabilities and Limitations Certificate',
      dates: 'November 27, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the AI capabilities and limitations course with a perfect quiz score (10 of 10): next-token prediction, knowledge cutoffs, working memory and context limits, steerability, and how these properties combine into the failures seen in practice.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/7d46893068ac882e489b04e7a1f03f82',
        },
      ],
    },
    {
      title: 'AI Fluency for Builders Certificate',
      dates: 'November 26, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the AI Fluency for builders course with a perfect quiz score (8 of 8): the 4D Framework (Delegation, Description, Discernment, Diligence), the builder\'s toolkit, acceptance tests as a shared definition of done, the Description Chain, and the five lenses for judging AI-built code.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/28cd7f9f0a0d3b7072df00b63d5120fb',
        },
      ],
    },
    {
      title: 'Model Context Protocol: Advanced Topics Certificate',
      dates: 'November 26, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the Model Context Protocol advanced topics course with a perfect assessment score (10 of 10): roots, sampling, stdio and StreamableHTTP transports, server-sent events, JSON responses, and the connection initialization sequence.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/4283583c1e15b53a0a8090a4ee3a3fc9',
        },
      ],
    },
    {
      title: 'Introduction to Model Context Protocol Certificate',
      dates: 'November 26, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the Introduction to Model Context Protocol course with a perfect final assessment (7 of 7): why MCP, tools, resources and prompts, building servers and clients with the Python SDK, and testing with the MCP Inspector.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/10ad29b6b5363dc5273c679ad61e0cca',
        },
      ],
    },
    {
      title: 'Introduction to Claude Tag Certificate',
      dates: 'November 25, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the Introduction to Claude Tag course with a perfect quiz score (10 of 10): proactive replies, channel memory versus instructions, giving Claude ownership of a task, steering a running task, and choosing the right channel or DM.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/22241453120a53fa1bdad957cf013a87',
        },
      ],
    },
    {
      title: 'Introduction to Claude Cowork Certificate',
      dates: 'November 25, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the Introduction to Claude Cowork course with a perfect quiz score (10 of 10): global and project instructions, working folders and permissions, writing good prompts, skills and plugins, Claude in Chrome, and scheduled tasks.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/13fbd30c8564dcac57580be90dbf69cd',
        },
      ],
    },
    {
      title: 'Claude 101 Certificate',
      dates: 'November 25, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the Claude 101 course with a perfect quiz score (10 of 10): prompting, projects, artifacts, skills, connectors, enterprise search, research, and which Claude product fits which job.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/0e7e8da56d83ca0423b32810ff1cf770',
        },
      ],
    },
    {
      title: 'Claude Code in Action Certificate',
      dates: 'November 23, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the Claude Code in action course with a perfect quiz score (8 of 8): steering long sessions, a CLAUDE.md that Claude follows, verification skills, permission modes, hooks, scheduled and headless runs, GitHub Actions and code review, verifying unattended runs, and plugins.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/913c5777434c0df9a2f581a64f2354cb',
        },
      ],
    },
    {
      title: 'Tool Use with the Messages API Certificate',
      dates: 'November 23, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the Tool use with the Messages API course with a perfect quiz score (12 of 12): writing tool descriptions Claude picks, strict tool use, parallel and streamed tool calls, code execution, web search, computer use, and cutting the cost of tool-heavy workflows.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/3bb4a138e99fa3abcd04147245d9a67f',
        },
      ],
    },
    {
      title: 'Claude Platform 101 Certificate',
      dates: 'November 23, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the Claude Platform 101 course with a perfect quiz score (5 of 5): the first API call, choosing a model, the agent loop, tool use, thinking, built-in tools, skills, MCP, context management and managed agents.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/92976e9e93c737259d5065c08a1664e0',
        },
      ],
    },
    {
      title: 'Claude Code 101 Certificate',
      dates: 'November 21, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the Claude Code 101 course and passed its quiz: the agentic loop, context management, the Explore, Plan, Code, Commit workflow, CLAUDE.md, subagents, skills, MCP and hooks.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/1792694c11ad213162fb37c4981aeba0',
        },
      ],
    },
    {
      title: 'Introduction to Evals Certificate',
      dates: 'November 21, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the Introduction to evals course with a perfect quiz score (12 of 12): choosing a model by measurement, building a minimum viable eval, iterating the prompt before upgrading the model, and running evals in CI and against production drift.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/be8f17ba0fb937329ed935797204842b',
        },
      ],
    },
    {
      title: 'Building Effective Human-Agent Teams Certificate',
      dates: 'November 21, 2026',
      location: 'Claude Academy (Anthropic)',
      logo: '/icons/skills/claude.svg',
      description:
        'Completed the Building effective human-agent teams (beta) course on moving from single-player to multiplayer AI and preparing a team for the shift.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Globe className='h-4 w-4' />,
          href: 'https://academy.claude.com/verify/e1b156bb58ce7918bcd4ac665cdb70cc',
        },
      ],
    },
    {
      title: 'Gemini Certified Educator',
      dates: 'January 30, 2026',
      location: 'Google for Education',
      description:
    'Earned Gemini Certified Educator qualification for demonstrating the knowledge, skills, and basic competencies needed to use Google AI in education. Certificate valid through January 30, 2029.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Google className='h-4 w-4' />,
          href: 'https://edu.google.accredible.com/80df331f-3095-420b-afed-694d2ad17f92#acc.Oidue54E',
        },
      ],
    },
    {
      title: 'Google AI for K12 Educators Certificate',
      dates: 'January 30, 2026',
      location: 'Google for Education',
      description:
    'Completed the Google AI for K12 Educators course with a perfect score of 100. Demonstrated proficiency in using Google AI tools to boost productivity and enhance work as an education professional.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Google className='h-4 w-4' />,
          href: '#',
        },
      ],
    },

    {
      title: 'Next.js SEO Fundamentals Certificate',
      dates: 'June 14, 2024',
      location: 'Next.js Learn Platform',
      description:
        'Completed the Next.js SEO Fundamentals course, mastering search engine optimization techniques for Next.js applications including meta tags, structured data, performance optimization, and best practices for improving website visibility and ranking.',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Vercel className='h-4 w-4' />,
          href: 'https://nextjs.org/learn/certificate?course=dashboard-app&user=70757&certId=dashboard-app-70757-1749911006822',
        },
      ],
    },
    {
      title: '3rd Place in JS Talent Competition',
      dates: '2023',
      location: 'FPT Polytechnic College HCM',
      logo: '/fpt-logo.svg',
      description:
        'Won 3rd place in the 2023 JS Talent competition organized by FPT Polytechnic College, demonstrating advanced front-end development skills and creating innovative web applications.',
      image: '/js-talent.jpg',
      links: [],
    },
    {
      title: 'Golden Bee Award (6th Edition)',
      dates: 'December, 2023',
      location: 'FPT Polytechnic College HCM',
      logo: '/fpt-logo.svg',
      description:
        "Received the prestigious Golden Bee Award (6th edition) for academic excellence and active contributions to the college's academic activities and community.",
      image: '/gold-bee.jpg',
      links: [],
    },
    {
      title: 'Distinguished Graduate',
      dates: '2023 - 2024',
      location: 'FPT Polytechnic College HCM',
      logo: '/fpt-logo.svg',
      description:
        'Graduated with distinction in Web Development with a GPA of 3.61/4.0, recognized for exceptional web development skills and comprehensive knowledge in information technology.',
      links: [],
    },
    {
      title: 'High School Honor Student',
      dates: '2020 - 2023',
      location: 'Nguyen Viet Xuan High School',
      description:
        'Maintained honor student status throughout three years at Nguyen Viet Xuan High School, with excellent academic performance across all subjects, particularly excelling in Mathematics and Computer Science.',
      links: [],
    },
  ],
  footer: {
    logo: '/logo.svg',
    brandName: 'Tien Dat',
    tagline: 'Open to full-stack roles',
    inspiredBy: [
      { name: 'shadcn/ui', url: 'https://ui.shadcn.com' },
      { name: 'Magic UI', url: 'https://magicui.design' },
      { name: 'Kibo UI', url: 'https://www.kibo-ui.com' },
      { name: 'Fumadocs', url: 'https://fumadocs.dev' },
      { name: 'Tailwind CSS', url: 'https://tailwindcss.com' },
      { name: 'Vercel', url: 'https://vercel.com' },
    ],
    socialLinks: [
      {
        name: 'GitHub',
        url: 'https://github.com/tiendat2204',
        icon: <Icons.Github className='h-5 w-5' />,
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/ttd-7796b5341/',
        icon: <Icons.Linkedin className='h-5 w-5' />,
      },
    ],
    mainLinks: [
      { name: 'Home', href: '/' },
      { name: 'Projects', href: '/#projects' },
      { name: 'Experience', href: '/#work' },
      { name: 'Education', href: '/#education' },
      { name: 'Awards', href: '/#awards' },
      { name: 'Uses', href: '/uses' },
    ],
    legalLinks: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    copyright: `© ${new Date().getFullYear()} Tien Dat. All rights reserved.`,
  },
} as const
export const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b',
}
