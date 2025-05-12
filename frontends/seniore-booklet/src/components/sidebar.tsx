import { cn } from '@/lib/utils';
import {
  Cross1Icon,
  DashboardIcon,
  DoubleArrowLeftIcon,
  FilePlusIcon,
  FileTextIcon,
  GearIcon,
  HamburgerMenuIcon,
  HeartIcon,
  PersonIcon
} from '@radix-ui/react-icons';
import { useEffect, useState } from 'react';
import { Layout, LayoutHeader } from './layouts';
import Navbar, { SideLink } from './navbar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed: boolean;
  setIsCollapsed?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const sidelinks: SideLink[] = [
  {
    title: 'Dashboard',
    label: '',
    href: '/dashboard-app',
    icon: <DashboardIcon height={18} />
  },
  {
    title: 'User Management',
    label: '',
    href: 'user',
    icon: <PersonIcon height={18} />,
    sub: [
      {
        title: 'Manage Users',
        label: '',
        href: 'users',
        icon: <DashboardIcon height={0} />
      },
      {
        title: 'Manage Senior Citizen',
        label: '',
        href: '/trucks',
        icon: <DashboardIcon height={0} />
      }
    ]
  },
  {
    title: 'Pharmacy',
    label: '',
    href: 'pharmacy',
    icon: <FileTextIcon height={18} />
  },
  {
    title: 'Medicines Management',
    label: '',
    href: 'medicines',
    icon: <HeartIcon height={18} />
  },

  {
    title: 'Transaction',
    label: '',
    href: '/transaction',
    icon: <FilePlusIcon height={18} />
  },

  {
    title: 'Settings',
    label: '',
    href: 'settings',
    icon: <GearIcon height={18} />
  }
];

const Sidebar = ({ className, isCollapsed, setIsCollapsed }: SidebarProps) => {
  const [navOpened, setNavOpened] = useState<boolean>(false);

  useEffect(() => {
    const body = document.body.classList;

    if (navOpened) {
      body.add('overflow-hidden');
    } else {
      body.remove('overflow-hidden');
    }
  }, [navOpened]);

  return (
    <>
      <aside
        className={cn(
          `bg-[#020617] fixed left-0 right-0 top-0 z-50 w-full border-r-2 border-r-muted transition-[width] md:bottom-0 md:right-auto md:h-svh ${
            isCollapsed ? 'md:w-14' : 'md:w-72'
          }`,
          className
        )}>
        {/* Overlay in mobile */}
        <div
          onClick={() => setNavOpened(false)}
          className={`absolute inset-0 transition-[opacity] delay-100 duration-700 ${
            navOpened ? 'h-svh opacity-50' : 'h-0 opacity-0'
          } w-full bg-black md:hidden`}
        />

        <Layout>
          {/* Header */}
          <LayoutHeader className="bg-[#020617] sticky top-0 justify-between px-4 py-3 shadow md:px-4">
            <div className={`flex items-center ${!isCollapsed ? 'gap-1' : ''}`}>
              <img
                src="/logo/seni.png"
                className={`transition-all ${
                  isCollapsed ? 'h-6 w-6' : 'h-8 w-8'
                }`}
                alt=""
              />
              <div
                className={`flex flex-col justify-end truncate ${
                  isCollapsed ? 'invisible w-0' : 'visible w-auto'
                }`}>
                <span className="text-[#F8FAFC] font-medium capitalize font-extrabold">
                  Byway
                </span>
              </div>
            </div>

            {/* Toggle Button in mobile */}
            <Button
              variant="gooeyRight"
              size="icon"
              className="md:hidden"
              aria-label="Toggle Navigation"
              aria-controls="sidebar-menu"
              aria-expanded={navOpened}
              onClick={() => setNavOpened(prev => !prev)}>
              {navOpened ? <Cross1Icon /> : <HamburgerMenuIcon />}
            </Button>
          </LayoutHeader>

          {/* Navigation links */}
          <Navbar
            id="sidebar-menu"
            className={`mt-4 bg-[#020617] h-full flex-1 overflow-auto border ${
              navOpened
                ? 'max-h-screen'
                : 'max-h-0 py-0 md:max-h-screen md:py-2'
            }`}
            closeNav={() => setNavOpened(false)}
            isCollapsed={isCollapsed}
            links={sidelinks}
          />

          {/* Scrollbar width toggle button */}
          <Button
            onClick={() => setIsCollapsed?.(prev => !prev)}
            size="icon"
            variant="outline"
            className="absolute  -right-5 top-1/2 hidden rounded-full md:inline-flex"
            style={{
              height: '2rem',
              width: '2rem'
            }}>
            <DoubleArrowLeftIcon
              className={`h-3 w-3  ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </Button>

          <div
            className={`flex  m-2 items-center ${!isCollapsed ? 'gap-1' : ''}`}>
            {/* <img src="/logo/seni.png" className={`transition-all ${
                  isCollapsed ? "h-6 w-6" : "h-8 w-8"
                }`}
            alt="" />
              <div
                className={`flex flex-col justify-end truncate ${
                  isCollapsed ? "invisible w-0" : "visible w-auto"
                }`}
              >
                <span className="text-[#F8FAFC] font-medium capitalize font-extrabold">
                  Byway
                </span>
              </div> */}

            <Avatar>
              <AvatarImage src="https://api.multiavatar.com/stefan.svg" />
              <AvatarFallback>John Asis</AvatarFallback>
            </Avatar>

            <h3
              className={`text-[#F8FAFC]  ${
                isCollapsed ? 'invisible w-0' : 'visible w-auto'
              }`}>
              John Asis
            </h3>
          </div>
        </Layout>
      </aside>
    </>
  );
};

export default Sidebar;
