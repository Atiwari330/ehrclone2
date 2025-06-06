'use client';

import {
  BarChart2,
  Calendar,
  CheckSquare,
  DollarSign,
  FileText,
  Home,
  Radio,
  Settings,
  Users,
} from 'lucide-react';
import type { User } from 'next-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SidebarUserNav } from '@/components/sidebar-user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';

const navItems = [
  {
    label: 'Today',
    href: '/dashboard/today',
    icon: <Home />,
  },
  {
    label: 'Clients',
    href: '/dashboard/clients',
    icon: <Users />,
  },
  {
    label: 'Calendar',
    href: '/dashboard/calendar',
    icon: <Calendar />,
  },
  {
    label: 'Live Sessions',
    href: '/dashboard/sessions',
    icon: <Radio />,
  },
  {
    label: 'Drafts',
    href: '/dashboard/drafts',
    icon: <FileText />,
  },
  {
    label: 'Supervisor',
    href: '/dashboard/supervisor',
    icon: <CheckSquare />,
    roles: ['supervisor'],
  },
  {
    label: 'Billing',
    href: '/dashboard/billing',
    icon: <DollarSign />,
    roles: ['provider', 'supervisor', 'admin'],
  },
  {
    label: 'Analytics',
    href: '/dashboard/analytics',
    icon: <BarChart2 />,
    roles: ['supervisor', 'admin'],
  },
  {
    label: 'Settings',
    href: '/dashboard/settings',
    icon: <Settings />,
  },
];

export function AppSidebar({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  // @ts-ignore: TODO: Add role to user type
  const userRole = user?.role || 'provider';

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole),
  );

  return (
    <Sidebar>
      <SidebarHeader>
        <Link
          href="/dashboard/today"
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-3 px-2 font-semibold text-lg hover:bg-muted rounded-md"
        >
          <span className="p-1 bg-primary text-primary-foreground rounded-md">
            AI
          </span>
          <span className="group-data-[collapsible=icon]:hidden">EHR</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={item.label}
                onClick={() => setOpenMobile(false)}
              >
                <Link href={item.href}>
                  {item.icon}
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.label}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
