/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  FileIcon,
  LayoutDashboard,
  PillIcon,
  ScanBarcodeIcon,
  UserIcon
} from 'lucide-react';
import * as React from 'react';

import { NavProjects } from '@/components/app-sidebar/nav-projects.sidebar';
import { NavUser } from '@/components/app-sidebar/nav-user.sidebar';
import { NavMain } from '@/components/app-sidebar/navbar-main.sidebar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import useCurrentUser from '@/modules/authentication/hooks/useCurrentUser';

const data = {
  user: {
    name: 'Byway',
    email: 'byway@site.medicine',
    avatar: '/avatars/shadcn.jpg'
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard-app',
      icon: LayoutDashboard
    },
    {
      title: 'Manage Users',
      url: 'users',
      icon: UserIcon,
      items: [
        {
          title: 'User',
          url: 'users'
        },
        {
          title: 'Senior Citizen',
          url: 'senior-citizen'
        }
      ]
    },

    // {
    //   title: "Content Management",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Museums",
    //       url: "museums",
    //     },
    //     {
    //       title: "Exhibits",
    //       url: "exhibits_mgm",
    //     },
    //     {
    //       title: "Site Editor",
    //       url: "page_editor",
    //     }
    //   ],
    // },

    {
      title: 'Pharmacy Management',
      url: 'pharmacy',
      icon: PillIcon
    },
    // {
    //   title: 'Medicine Management',
    //   url: 'medicines',
    //   icon: BriefcaseMedicalIcon
    // },
    {
      title: 'Transaction Management',
      url: 'transaction',
      icon: ScanBarcodeIcon
    },
    {
      title: 'Reports',
      url: 'users-report',
      icon: FileIcon,
      items: [
        // {
        //   title: 'Medicine Report',
        //   url: 'medicine-report'
        // },
        {
          title: 'Users Report',
          url: 'users-report'
        },
        {
          title: 'Pharmacy Report',
          url: 'pharmacy-report'
        },
        {
          title: 'Transaction Report',
          url: 'transaction-report'
        },
        {
          title: 'Senior Citizen Report',
          url: 'senior-report'
        }
      ]
    }
  ],
  projects: [
    // {
    //   name: "Events",
    //   url: "events",
    //   icon: Frame,
    // },
    // {
    //   name: "Feedback",
    //   url: "#",
    //   icon: FolderEditIcon,
    // },
  ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useCurrentUser();

  console.log('user from sidebar', user);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
                  <img
                    src="/logo/seni.png"
                    className={`transition-all `}
                    alt=""
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Senior Citizen</span>
                  <span className="truncate text-xs">E-Booklet System</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user as any} />
      </SidebarFooter>
    </Sidebar>
  );
}
