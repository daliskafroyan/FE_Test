import {
  IconLayoutDashboard,
  IconSettings,
  IconUserCog,
  IconTool,
  IconPalette,
  IconNotification,
  IconBrowserCheck,
  IconCalendarStats,
  IconCar,
  IconDatabase,
} from '@tabler/icons-react'
import { Command, GalleryVerticalEnd } from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: IconLayoutDashboard,
        },
      ],
    },
    {
      title: 'Lalin',
      items: [
        {
          title: 'Laporan Lalin',
          icon: IconCar,
          items: [
            {
              title: 'Laporan Per Hari',
              url: '/laporan-lalin/laporan-per-hari',
              icon: IconCalendarStats,
            },
          ],
        },
      ],
    },
    {
      title: 'Master Data',
      items: [
        {
          title: 'Master Gerbang',
          url: '/master-gerbang',
          icon: IconDatabase,
        },
      ],
    },
  ],
}
