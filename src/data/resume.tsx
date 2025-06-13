import { Icons } from '@/components/icons'
import { LinkPreview } from '@/components/ui/link-preview'
import { HomeIcon, NotebookIcon } from 'lucide-react'

export const DATA = {
  name: 'Tien Dat',
  initials: 'TD',
  url: 'https://tiendatdev.me/',
  location:
    '256 Duong Quang Ham Street, Go Vap District, Ho Chi Minh City, Vietnam',
  locationLink:
    'https://www.google.com/maps/place/256+Duong+Quang+Ham,+Phuong+7,+Quan+Go+Vap,+Thanh+Pho+Ho+Chi+Minh,+Vietnam/@10.848634,106.688626,17z/data=!3m1!4b1!4m6!3m5!1s0x31752f2c8d9e2a7b:0x5d6f8c8e9f8c8e9f!8m2!3d10.848634!4d106.6908147!16s%2Fg%2F11c1qv_5j',
  description:
    'Fullstack developer with a strong focus on frontend development and a passion for building scalable, user-centric web applications. I have experience in React, Next.js, Typescript, Node.js, Python, and more. I love to build products that solve real-world problems and help people achieve their goals.',
  summary:
    'I am a fullstack developer with a strong focus on frontend development and a passion for building scalable, user-centric web applications. I have experience in React, Next.js, Typescript, Node.js, Python, and more. I love to build products that solve real-world problems and help people achieve their goals. I am always looking for new challenges and opportunities to learn and grow.',
  avatarUrl: '/me.jpg',
  skills: {
    mainStack: {
      framework: {
        name: 'Next.js',
        icon: 'nextjs-icon.svg',
      },
      styling: {
        name: 'TailwindCSS',
        icon: 'tailwindcss-icon.svg',
      },
      database: {
        name: 'Postgres',
        icon: 'postgresql-icon.svg',
      },
      deployment: {
        name: 'Nginx',
        icon: 'nginx-icon.svg',
      },
      orm: {
        name: 'Django',
        icon: 'django-icon.svg',
      },
      databaseTool: {
        name: 'SQL',
        icon: 'sqlite-icon.svg',
      },
      ide: {
        name: 'Vscode',
        icon: 'vscode-icon.svg',
      },
    },
    languages: [
      { name: 'JavaScript', icon: 'javascript-icon.svg' },
      { name: 'TypeScript', icon: 'typescript-icon.svg' },
      { name: 'Python', icon: 'python-icon.svg' },
      { name: 'HTML', icon: 'html-icon.svg' },
      { name: 'CSS', icon: 'css-icon.svg' },
      { name: 'Node.js', icon: 'nodejs-icon.svg' },
      { name: 'Postgres', icon: 'postgresql-icon.svg' },
      { name: 'MongoDB', icon: 'mongodb-icon.svg' },
      { name: 'SVG Animation', icon: 'svg-icon.svg' },
    ],
    frameworks: [
      { name: 'Django', icon: 'django-icon.svg' },
      { name: 'React', icon: 'react-icon.svg' },
      { name: 'Next.js', icon: 'nextjs-icon.svg' },
      { name: 'ExpressJS', icon: 'expressjs-icon.svg' },
      { name: 'TailwindCSS', icon: 'tailwindcss-icon.svg' },
      { name: 'TankStack Query', icon: 'tanstack-icon.svg' },
      { name: 'Motion.dev', icon: 'motiondev-icon.svg' },
      { name: 'BetterAuth', icon: 'betterauth-icon.svg' },
    ],
    tools: [{ name: 'Nginx', icon: 'nginx-icon.svg' }],
    platforms: [
      { name: 'GitHub', icon: 'github-icon.svg' },
      { name: 'Vercel', icon: 'vercel-icon.svg' },
    ],
    softwares: [
      { name: 'VSCode', icon: 'vscode-icon.svg' },
      { name: 'Python', icon: 'python-icon.svg' },
      { name: 'Postman', icon: 'postman-icon.svg' },
      { name: 'Figma', icon: 'figma-icon.svg' },
      { name: 'Photoshop', icon: 'photoshop-icon.svg' },
    ],
    devOps: [
      { name: 'GitHub Actions (CI/CD)', icon: 'github-icon.svg' },
      { name: 'Authentication (OAuth, JWT)', icon: 'auth-icon.svg' },
    ],
  },
  navbar: [
    { href: '/', icon: HomeIcon, label: 'Home' },
    { href: '/blog', icon: NotebookIcon, label: 'Blog' }
  ],
  contact: {
    email: 'tiendat220404@gmail.com',
    tel: '035 4411 541',
    social: {
      GitHub: {
        name: 'GitHub',
        icon: 'github-icon.svg',
        url: 'https://tiendatdev.me/',
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg',
        navbar: true,
      },
      LinkedIn: {
        name: 'LinkedIn',
        icon: 'linkedin-icon.svg',
        url: 'https://www.linkedin.com/in/ttd-7796b5341/',
        image: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png',
        navbar: true,
      },
      Instagram: {
        name: 'Instagram',
        url: 'https://www.instagram.com/tiendat_224/?igsh=OXh2MmN4YjhsY3h6&utm_source=qr#',
        icon: 'instagram-icon.svg',
        image: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png',
        navbar: false,
      },
      Facebook: {
        name: 'Facebook',
        url: 'https://www.facebook.com/tien.at.761069/',
        icon: 'facebook-icon.svg',
        image: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
        navbar: true,
      },
      Zalo: {
        name: 'Zalo',
        url: 'https://zalo.me/0354411541',
        icon: 'zalo-icon.svg',
        image: 'https://upload.wikimedia.org/wikipedia/commons/d/d6/Logo_Zalo.png',
        navbar: true,
      }
    },
  },
  work: [
    {
      company: 'VietDev Studio',
      href: 'https://www.facebook.com/vietdevstudio/',
      location: 'Ho Chi Minh City, Vietnam',
      logoUrl: '/vietdev-logo.jpg',
      positions: [
        {
          title: 'Fresher - Frontend Developer',
          badges: ['Frontend Lead', 'Full Stack'],
          start: 'Jan 2024',
          end: 'Present',
          isExpanded: true,
          description: [
            'Leading frontend development for POD Wedding platform using Next.js SSR for optimal performance and SEO',
            'Implementing modern UI components with ShadcnUI and TailwindCSS for responsive design',
            'Building efficient data fetching patterns with TanStack Query',
            'Developing secure authentication system with JWT tokens and Django Rest Framework',
            'Creating scalable e-commerce solutions with PostgreSQL database integration',
            'Implementing CI/CD workflows with GitHub Actions for automated testing and deployment',
            'Building reusable UI components and custom hooks for consistent user experience'
          ],
          technologies: [
            { name: 'Next.js', icon: 'nextjs-icon.svg' },
            { name: 'TypeScript', icon: 'typescript-icon.svg' },
            { name: 'React', icon: 'react-icon.svg' },
            { name: 'TailwindCSS', icon: 'tailwindcss-icon.svg' },
            { name: 'TanStack Query', icon: 'tanstack-icon.svg' },
            { name: 'Django', icon: 'django-icon.svg' },
            { name: 'PostgreSQL', icon: 'postgresql-icon.svg' },
            { name: 'JWT Authentication', icon: 'auth-icon.svg' }
          ]
        },
        {
          title: 'Intern - Frontend Developer',
          badges: ['Frontend Lead', 'Social Media'],
          start: 'Sep 2023',
          end: 'Jan 2024',
          isExpanded: false,
          description: [
            'Developed a social media platform focused on storytelling and novel sharing',
            'Built with Next.js SSR for optimal SEO performance and initial page load',
            'Implemented consistent design system with ShadcnUI and custom components',
            'Created efficient data fetching strategies with TanStack Query for caching and prefetching',
            'Integrated real-time features using WebSockets for notifications and messages',
            'Developed user engagement systems including liking, sharing, and commenting functionality',
            'Implemented responsive layouts for mobile and desktop experiences'
          ],
          technologies: [
            { name: 'Next.js', icon: 'nextjs-icon.svg' },
            { name: 'TypeScript', icon: 'typescript-icon.svg' },
            { name: 'React', icon: 'react-icon.svg' },
            { name: 'TailwindCSS', icon: 'tailwindcss-icon.svg' },
            { name: 'TanStack Query', icon: 'tanstack-icon.svg' },
            { name: 'Vercel', icon: 'vercel-icon.svg' },
          ]
        }
      ]
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
            'Collaborated with backend developer on RESTful API integration and data flow optimization'
          ],
          technologies: [
            { name: 'JavaScript', icon: 'javascript-icon.svg' },
            { name: 'HTML', icon: 'html-icon.svg' },
            { name: 'CSS', icon: 'css-icon.svg' },
            { name: 'Node.js', icon: 'nodejs-icon.svg' },
            { name: 'Express.js', icon: 'expressjs-icon.svg' },
            { name: 'JWT Authentication', icon: 'auth-icon.svg' },
            { name: 'MongoDB', icon: 'mongodb-icon.svg' },
          ]
        }
      ]
    }
  ],
  education: [
    {
      school: 'FPT College',
      href: 'https://fpt.edu.vn',
      degree: 'Software Engineering',
      logoUrl: '/fpt-logo.png',
      start: '2023',
      end: '2024',
      isExpanded: true,
      description: [
        'Studying modern software development methodologies and practices',
        <span key='js-talent' title='JS Talent Competition'>
          Achieved
          <LinkPreview height={50} width={500} url='#' isStatic imageSrc='/js-talent.jpg' className='font-bold underline'>
            3rd place in JS Talent competition
          </LinkPreview>{' '}
          for front-end development skills
        </span>,
        <span key='golden-bee' title='Golden Bee Award'>
          Awarded
          <LinkPreview url='#' height={50} width={500} isStatic imageSrc='/gold-bee.jpg' className='font-bold underline'>
            Golden Bee Award (6th edition)
          </LinkPreview>{' '}
          for academic excellence
        </span>,
        'Building applications with React, Next.js and Node.js',
        'Working on real-world projects with industry partners',
        'Developing strong fundamentals in algorithms and data structures'
      ],
      technologies: [
        { name: 'JavaScript', icon: 'javascript-icon.svg' },
        { name: 'TypeScript', icon: 'typescript-icon.svg' },
        { name: 'React', icon: 'react-icon.svg' },
        { name: 'Next.js', icon: 'nextjs-icon.svg' },
        { name: 'Node.js', icon: 'nodejs-icon.svg' },
        { name: 'PostgreSQL', icon: 'postgresql-icon.svg' },
        { name: 'TailwindCSS', icon: 'tailwindcss-icon.svg' },
        { name: 'Django', icon: 'django-icon.svg' },
        { name: 'Python', icon: 'python-icon.svg' },
        { name: 'GitHub', icon: 'github-icon.svg' },
        { name: 'Figma', icon: 'figma-icon.svg' },
        { name: 'Postman', icon: 'postman-icon.svg' },
        { name: 'VSCode', icon: 'vscode-icon.svg' },
      ]
    },
    {
      school: 'Nguyen Viet Xuan High School',
      href: '#',
      degree: 'High School',
      logoUrl: '/fpt-logo.png',
      start: '2020',
      end: '2023',
      isExpanded: false,
      description: [
        'Graduated with good academic standing in mathematics',
        'Developed foundation in computer science fundamentals',
        'Completed basic web development projects',
      ]
    },
  ],
  projects: [
    {
      title: 'Tien Dat Portfolio',
      href: 'https://tiendatdev.me/',
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
            'Set up analytics to track user engagement and content performance'
          ],
          technologies: [
            { name: 'Next.js', icon: 'nextjs-icon.svg' },
            { name: 'TypeScript', icon: 'typescript-icon.svg' },
            { name: 'TailwindCSS', icon: 'tailwindcss-icon.svg' },
            { name: 'Shadcn UI', icon: 'shadcn-icon.svg' },
            { name: 'Framer Motion', icon: 'framer-icon.svg' },
            { name: 'Vercel', icon: 'vercel-icon.svg' },
            { name: 'GitHub', icon: 'github-icon.svg' },
            { name: 'React', icon: 'react-icon.svg' },
            { name: 'JavaScript', icon: 'javascript-icon.svg' },
            { name: 'Figma', icon: 'figma-icon.svg' },
            { name: 'Postman', icon: 'postman-icon.svg' },
            { name: 'VSCode', icon: 'vscode-icon.svg' },
            { name: 'WebStorm', icon: 'webstorm-icon.svg' },

          ]
        }
      ],
      links: [
        {
          type: 'Website',
          href: 'https://tiendatdev.me/',
          icon: <Icons.Globe className='size-3' />
        },
        {
          type: 'Source',
          href: 'https://github.com/tiendat2204/tien-dat-portfolio',
          icon: <Icons.Github className='size-3' />
        }
      ],
      image: '/projects/portfolio.png'
    },
    {
      title: 'E-booking Healthcare',
      href: 'https://e-booking-healthcare-git-main-tiendat224s-projects.vercel.app/',
      logoUrl: '/project-logo.png',
      positions: [
        {
          title: 'Frontend Developer',
          badges: ['Active'],
          start: 'Mar 2024',
          end: 'Jun 2024',
          isExpanded: true,
          description: [
            'Developed a comprehensive online booking system for Diamond Medical Clinic to streamline appointment scheduling process',
            'Implemented secure online payment gateway for patients to pay consultation fees in advance',
            'Created admin dashboard for clinic staff to manage multiple branch locations, doctors, schedules, and appointments',
            'Built patient portal allowing users to view medical history, upcoming appointments, and receive reminders',
            'Integrated real-time availability checking to prevent double-booking of medical resources'
          ],
          technologies: [
            { name: 'React.js', icon: 'react-icon.svg' },
            { name: 'Node.js', icon: 'nodejs-icon.svg' },
            { name: 'Express.js', icon: 'expressjs-icon.svg' },
            { name: 'Laravel', icon: 'laravel-icon.svg' },
            { name: 'MySQL', icon: 'mysql-icon.svg' },
            { name: 'TailwindCSS', icon: 'tailwindcss-icon.svg' },
            { name: 'Shadcn UI', icon: 'shadcn-icon.svg' }
          ]
        }
      ],
      links: [
        {
          type: 'Website',
          href: 'https://e-booking-healthcare-git-main-tiendat224s-projects.vercel.app/',
          icon: <Icons.Globe className='size-3' />
        },
        {
          type: 'Source',
          href: 'https://github.com/tiendat2204/E-booking-Healthcare',
          icon: <Icons.Github className='size-3' />
        },
      ],
      image: '/projects/healthcare-booking.png'
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
            'Optimized performance using React best practices and code splitting techniques'
          ],
          technologies: [
            { name: 'React', icon: 'react-icon.svg' },
            { name: 'Vite', icon: 'vite-icon.svg' },
            { name: 'TailwindCSS', icon: 'tailwindcss-icon.svg' },
            { name: 'JavaScript', icon: 'javascript-icon.svg' },
            { name: 'CSS', icon: 'css-icon.svg' }
          ]
        }
      ],
      links: [
        {
          type: 'Demo',
          href: 'https://test-intern-tiendat224s-projects.vercel.app/',
          icon: <Icons.Globe className='size-3' />
        },
        {
          type: 'Source',
          href: 'https://github.com/tiendat2204/clone-we-ui',
          icon: <Icons.Github className='size-3' />
        }
      ],
      image: '/projects/wechat.png'
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
            'Integrated payment processing system with secure checkout flow'
          ],
          technologies: [
            { name: 'React', icon: 'react-icon.svg' },
            { name: 'Vite', icon: 'vite-icon.svg' },
            { name: 'TailwindCSS', icon: 'tailwindcss-icon.svg' },
            { name: 'Node.js', icon: 'nodejs-icon.svg' },
            { name: 'Express.js', icon: 'expressjs-icon.svg' },
            { name: 'MongoDB', icon: 'mongodb-icon.svg' },
            { name: 'JWT Authentication', icon: 'auth-icon.svg' },
            { name: 'JavaScript', icon: 'javascript-icon.svg' }
          ]
        },

      ],
      links: [
        {
          type: 'Demo',
          href: 'https://coishop.vercel.app',
          icon: <Icons.Globe className='size-3' />
        },
        {
          type: 'Source',
          href: 'https://github.com/tiendat2204/Coi-Shop',
          icon: <Icons.Github className='size-3' />
        }
      ],
      image: '/projects/coi-shop.png'
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
            "Developed an interactive memory card matching game for FPT College's Game Development Competition",
            'Implemented core game mechanics including card flipping, matching logic, and scoring system',
            'Created responsive design with CSS animations for engaging user experience across devices',
            'Built timer functionality and difficulty levels to enhance gameplay challenge',
            'Optimized performance with vanilla JavaScript without relying on external libraries',
            'Incorporated sound effects and visual feedback to improve player engagement'
          ],
          technologies: [
            { name: 'HTML', icon: 'html-icon.svg' },
            { name: 'CSS', icon: 'css-icon.svg' },
            { name: 'JavaScript', icon: 'javascript-icon.svg' },
            { name: 'Local Storage', icon: 'storage-icon.svg' }
          ]
        }
      ],
      links: [
        {
          type: 'Source',
          href: 'https://github.com/ngchinhdev/memory-game',
          icon: <Icons.Github className='size-3' />
        }
      ],
      image: '/projects/memory-game.png'
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
            'Developed a reusable component library for easy integration into other projects'
          ],
          technologies: [
            { name: 'Next.js', icon: 'nextjs-icon.svg' },
            { name: 'TypeScript', icon: 'typescript-icon.svg' },
            { name: 'TailwindCSS', icon: 'tailwindcss-icon.svg' },
            { name: 'Framer Motion', icon: 'framer-icon.svg' },
            { name: 'React', icon: 'react-icon.svg' }
          ]
        }
      ],
      links: [
        {
          type: 'Demo',
          href: 'https://sticker-animation-umber.vercel.app/',
          icon: <Icons.Globe className='size-3' />
        },
        {
          type: 'Source',
          href: 'https://github.com/tiendat2204/StickerAnimation',
          icon: <Icons.Github className='size-3' />
        }
      ],
      image: '/projects/sticker-animation.png'
    },

  ],
  awards: [
    {
      title: '3rd Place in JS Talent Competition',
      dates: 'March, 2024',
      location: 'FPT College HCM',
      description:
          'Won 3rd place in the 2024 JS Talent competition organized by FPT College, demonstrating advanced front-end development skills and creating innovative web applications.',
      image: '/awards/js-talent.jpg',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Medal className='h-4 w-4' />,
          href: '#',
        }
      ],
    },
    {
      title: 'Golden Bee Award (6th Edition)',
      dates: 'December, 2023',
      location: 'FPT College HCM',
      description:
          "Received the prestigious Golden Bee Award (6th edition) for academic excellence and active contributions to the college's academic activities and community.",
      image: '/awards/gold-bee.jpg',
      links: [
        {
          title: 'Certificate',
          icon: <Icons.Medal className='h-4 w-4' />,
          href: '#',
        }
      ],
    },
    {
      title: 'Distinguished Graduate',
      dates: '2023 - 2024',
      location: 'FPT College HCM',
      description:
          'Graduated with distinction in Web Development with a GPA of 3.61/4.0, recognized for exceptional web development skills and comprehensive knowledge in information technology.',
      image: '/awards/graduation.jpg',
      links: [
        {
          title: 'Diploma',
          icon: <Icons.Bookmark className='h-4 w-4' />,
          href: '#',
        }
      ],
    },
    {
      title: 'High School Honor Student',
      dates: '2020 - 2023',
      location: 'Nguyen Viet Xuan High School',
      description:
          'Maintained honor student status throughout three years at Nguyen Viet Xuan High School, with excellent academic performance across all subjects, particularly excelling in Mathematics and Computer Science.',
      image: '/awards/highschool.jpg',
      links: []
    },
  ],
  footer: {
    logo: '/logo.svg',
    brandName: 'Tien Dat',
    socialLinks: [
      {
        name: 'GitHub',
        url: 'https://github.com/tiendat2204',
        icon: <Icons.Github className='h-5 w-5' />
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/ttd-7796b5341/',
        icon: <Icons.Linkedin className='h-5 w-5' />
      },
    ],
    mainLinks: [
      { name: 'Home', href: '/' },
      { name: 'Projects', href: '#projects' },
      { name: 'Experience', href: '#experience' },
      { name: 'Education', href: '#education' },
      { name: 'Awards', href: '#awards' }
    ],
    legalLinks: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' }
    ],
    copyright: `© ${new Date().getFullYear()} Tien Dat. All rights reserved.`
  }
} as const
export const LOGO_BASE64 =
  'data:image/svg+xml;base64,CiAgICAgIDxzdmcgZGF0YS1sb2dvPSJsb2dvIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NCAyNyI+CiAgICAgICAgPGcgaWQ9ImxvZ29ncmFtIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLCAxMy41KSByb3RhdGUoMCkiPjwvZz4KICAgICAgICA8ZyBpZD0ibG9nb3R5cGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDAsIDEpIj48cGF0aCBmaWxsPSIjMTExMTExIiBkPSJNMTIuMjkgNi44N0wxMi4yOSAyNC40NFExMi4yOSAyNS4xNCA4LjgyIDI1LjE0UTUuMzYgMjUuMTQgNS4zNiAyNC40NEw1LjM2IDI0LjQ0TDUuMzYgNi44N0wxLjE2IDYuODdRMC41NiA2Ljg3IDAuMzIgNS4yNkwwLjMyIDUuMjZRMC4yMSA0LjQ5IDAuMjEgMy42OFEwLjIxIDIuODggMC4zMiAyLjExTDAuMzIgMi4xMVEwLjU2IDAuNTAgMS4xNiAwLjUwTDEuMTYgMC41MEwxNi4zOCAwLjUwUTE2Ljk4IDAuNTAgMTcuMjIgMi4xMUwxNy4yMiAyLjExUTE3LjMzIDIuODggMTcuMzMgMy42OFExNy4zMyA0LjQ5IDE3LjIyIDUuMjZMMTcuMjIgNS4yNlExNi45OCA2Ljg3IDE2LjM4IDYuODdMMTYuMzggNi44N0wxMi4yOSA2Ljg3Wk0yMy44NyAyMy4zOUwyMy44NyAyMy4zOUwyMy44NyAyLjM5UTIzLjg3IDEuNTEgMjQuMzEgMS4wMVEyNC43NSAwLjUwIDI1LjQ1IDAuNTBMMjUuNDUgMC41MEwzMS4yOSAwLjUwUTM2Ljg2IDAuNTAgMzkuNzQgMy4zMFE0Mi42MyA2LjEwIDQyLjYzIDEyLjEyTDQyLjYzIDEyLjEyUTQyLjYzIDI1IDMxLjY0IDI1TDMxLjY0IDI1TDI1LjY2IDI1UTIzLjg3IDI1IDIzLjg3IDIzLjM5Wk0zMC45NCA3LjE1TDMwLjU5IDcuMTVMMzAuNTkgMTcuNjFRMzAuNTkgMTguMzUgMzAuNzAgMTguNTRRMzAuODAgMTguNzMgMzEuMzMgMTguNzNMMzEuMzMgMTguNzNRMzMuMjUgMTguNzMgMzQuMjUgMTcuMzBRMzUuMjUgMTUuODYgMzUuMjUgMTIuNTJRMzUuMjUgOS4xOCAzNC4yMSA4LjE2UTMzLjE4IDcuMTUgMzAuOTQgNy4xNUwzMC45NCA3LjE1WiIvPjwvZz4KICAgICAgICAKICAgICAgPC9zdmc+CiAgICA='
