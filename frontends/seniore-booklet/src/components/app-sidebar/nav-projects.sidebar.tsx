
import {
  type LucideIcon
} from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"

type TProject = {
    name: string
    url: string
    icon: LucideIcon
}
export function NavProjects({
  projects,
}: {
  projects: TProject[]
}) {

  const { pathname } = useLocation();

 
 
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = item.url === pathname.split('/')[2];


          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link to={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
