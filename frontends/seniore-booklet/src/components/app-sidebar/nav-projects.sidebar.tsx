import { type LucideIcon } from 'lucide-react';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { Users, Store, Receipt, UserPlus } from 'lucide-react';

type TProject = {
  name: string;
  url: string;
  icon: LucideIcon;
};
export function NavProjects({ projects }: { projects: TProject[] }) {
  const { pathname } = useLocation();

  return <div></div>;
}
