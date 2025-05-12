/* eslint-disable @typescript-eslint/no-unused-expressions */
import { cn } from "@/lib/utils";
import {
  Cross1Icon,
  DashboardIcon,
  FilePlusIcon,
  GearIcon,
  HamburgerMenuIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout, LayoutHeader } from "./layouts";
import Navbar, { SideLink } from "./navbar";
import { SidebarProps } from "./sidebar";
import { Button } from "./ui/button";

export const sidelinks: SideLink[] = [
  { title: "Dashboard", href: "/senior-app", icon: <DashboardIcon height={20} /> },
  { title: "Transaction History", href: "transaction-history", icon: <FilePlusIcon height={20} /> },
  { title: "My Profile", href: "my-profile", icon: <GearIcon height={20} /> },
];

const SeniorSidebar = ({ className, isCollapsed }: SidebarProps) => {
  const [navOpened, setNavOpened] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const body = document.body.classList;
    navOpened ? body.add("overflow-hidden") : body.remove("overflow-hidden");
  }, [navOpened]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          `bg-[#020617] fixed left-0 top-0 z-50 w-full md:w-72 transition-[width] border-r-2 border-r-muted md:bottom-0 md:right-auto md:h-screen ${
            isCollapsed ? "md:w-14" : "md:w-72"
          } hidden md:block`,
          className
        )}
      >
        <Layout>
          <LayoutHeader className="bg-[#020617] sticky top-0 px-4 py-3 shadow md:px-4 flex justify-between">
            <div className="flex items-center gap-1">
              <img src="/logo/seni.png" className="h-8 w-8" alt="Logo" />
              <span className={`text-[#F8FAFC] font-extrabold ${isCollapsed ? 'hidden' : 'block'}`}>
                Byway
              </span>
            </div>
            <Button 
              variant="ghost" 
              className="md:hidden" 
              onClick={() => setNavOpened(!navOpened)}
            >
              {navOpened ? <Cross1Icon /> : <HamburgerMenuIcon />}
            </Button>
          </LayoutHeader>

          <Navbar 
            links={sidelinks} 
            closeNav={() => setNavOpened(false)} 
            isCollapsed={isCollapsed} 
          />
        </Layout>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#020617] border-t border-t-[#1E293B] shadow-md md:hidden">
        <div className="grid grid-cols-3 gap-1 p-2">
          {sidelinks.map((link, index) => (
            <Button 
              key={index} 
              variant="ghost" 
              className={cn(
                "flex flex-col items-center py-2 text-[#F8FAFC] hover:bg-[#1E293B]",
                location.pathname === link.href && "text-primary bg-[#1E293B]"
              )}
              asChild
            >
              <Link to={link.href}>
                {link.icon}
                <span className="text-xs mt-1">{link.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default SeniorSidebar;
