import useCheckActiveNav from "@/hooks/useCheckActiveNav";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "./ui/button";

export interface SideLink extends NavLink {
  sub?: NavLink[];
}

export interface NavLink {
  title: string;
  label?: string;
  href: string;
  icon: JSX.Element;
}

interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  links: SideLink[];
  closeNav: () => void;
}

const Navbar = ({ links, className, closeNav, isCollapsed }: NavbarProps) => {
  return (
    <nav className={cn("px-2", className)}>
      {links.map((link, index) => (
        <Button
          key={index}
          asChild
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 bg-transparent text-[#F8FAFC] hover:bg-[#1E293B] hover:text-white",
            isCollapsed ? "px-2" : "px-4"
          )}
          onClick={closeNav}
        >
          <Link to={link.href} className="flex items-center gap-2">
            {link.icon}
            <span className={cn("flex-1", isCollapsed && "hidden")}>
              {link.title}
            </span>
            {link.label && (
              <span className={cn("ml-auto", isCollapsed && "hidden")}>
                {link.label}
              </span>
            )}
          </Link>
        </Button>
      ))}
    </nav>
  );
};

interface NavbarLinkProps extends SideLink {
  subLink?: boolean;
  closeNav: () => void;
}

const NavLink = ({
  subLink = false,
  title,
  icon,
  label,
  href,
  closeNav,
}: NavbarLinkProps) => {
  const { checkActiveNav } = useCheckActiveNav();

  return (
    <Link
      to={href}
      onClick={closeNav}
      className={cn(
        buttonVariants({
          variant: checkActiveNav(href) ? "secondary" : "ghost",
          size: "sm",
          className:  checkActiveNav(href) && "bg-[#3B82F6]/95 italic"
        }),
        "text-[#F8FAFC] h-12 justify-start text-wrap rounded-none px-6 relative z-0 overflow-hidden transition-all duration-500 after:absolute after:inset-0 after:-z-10 after:translate-x-[-150%] after:translate-y-[150%] after:scale-[2.5] after:rounded-[100%] after:bg-gradient-to-l from-zinc-400 after:transition-transform after:duration-1000  hover:after:translate-x-[0%] hover:after:translate-y-[0%] ",
        subLink && "h-10 w-full border-l border-l-slate-500 px-2 "
      )}
      aria-current={checkActiveNav(href) ? "page" : undefined}
    >
      <div className="mr-2">{icon}</div>
      <span className="text-[0.625rem] ">{title}</span>
      {label && (
        <div className="ml-2 rounded-lg bg-primary px-1 text-[0.625rem] text-[#F8FAFC]">
          {label}
        </div>
      )}
    </Link>
  );
};

// function NavLinkDropdown({
//   title,
//   icon,
//   label,
//   sub,
//   closeNav,
// }: NavbarLinkProps) {
//   const { checkActiveNav } = useCheckActiveNav();

//   /* Open collapsible by default
//    * if one of child element is active */
//   const isChildActive = !!sub?.find((s: NavLink) => checkActiveNav(s.href));

//   return (
//     <Collapsible defaultOpen={isChildActive}>
//       <CollapsibleTrigger
//         className={cn(
//           buttonVariants({ variant: "ghost", size: "sm" }),
//           "group h-12 w-full justify-start rounded-none px-6"
//         )}
//       >
//         <div className="mr-2 text-[#F8FAFC]">{icon}</div>
//         <span className="text-[0.625rem] text-[#F8FAFC]">{title}</span>
//         {label && (
//           <div className="ml-2 rounded-lg bg-primary px-1 text-[0.625rem] text-[#F8FAFC]">
//             {label}
//           </div>
//         )}
//         <span
//           className={cn(
//             'ml-auto transition-all group-data-[state="open"]:-rotate-180'
//           )}
//         >
//           <CaretDownIcon stroke={"1"} className="text-[#F8FAFC]" />
//         </span>
//       </CollapsibleTrigger>
//       <CollapsibleContent className="collapsibleDropdown" asChild>
//         <ul>
//           {sub?.map((link: NavLink) => (
//             <li key={link.title} className="my-1 ml-8 ">
//               <NavLink {...link} subLink closeNav={closeNav} />
//             </li>
//           ))}
//         </ul>
//       </CollapsibleContent>
//     </Collapsible>
//   );
// }

// function NavLinkIcon({ title, icon, label, href }: NavbarLinkProps) {
//   const { checkActiveNav } = useCheckActiveNav();
//   return (
//     <Tooltip delayDuration={0}>
//       <TooltipTrigger asChild>
//         <Link
//           to={href}
//           className={cn(
//             buttonVariants({
//               variant: checkActiveNav(href) ? "secondary" : "ghost",
//               size: "icon",
//             }),
//             `h-12 w-12 ${checkActiveNav(href) ? "text-[#000]" : "text-[#F8FAFC]"}`
//           )}
//         >
//           {icon}
//           <span className="sr-only">{title}</span>
//         </Link>
//       </TooltipTrigger>
//       <TooltipContent side="right" className="flex items-center gap-4">
//         {title}
//         {label && (
//           <span className="ml-auto text-muted-foreground">{label}</span>
//         )}
//       </TooltipContent>
//     </Tooltip>
//   );
// }

// function NavLinkIconDropdown({ title, icon, label, sub }: NavbarLinkProps) {
//   const { checkActiveNav } = useCheckActiveNav();

//   const isChildActive = !!sub?.find((s: NavLink) => checkActiveNav(s.href));

//   return (
//     <DropdownMenu>
//       <Tooltip delayDuration={0}>
//         <TooltipTrigger asChild>
//           <DropdownMenuTrigger asChild>
//             <Button variant={isChildActive ? "secondary" : "ghost"}>
//               {icon}
//             </Button>
//           </DropdownMenuTrigger>
//         </TooltipTrigger>
//         <TooltipContent side="right" className="flex items-center gap-4">
//           {title}{" "}
//           {label && (
//             <span className="ml-auto text-muted foreground">{label}</span>
//           )}
//           <CaretDownIcon
//             height={18}
//             className="-rotate-90 text-muted-foreground"
//           />
//         </TooltipContent>
//       </Tooltip>

//       <DropdownMenuContent side="right" align="start" sideOffset={4}>
//         <DropdownMenuLabel>
//           {title} {label ? `(${label})` : ""}
//         </DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         {sub!.map(({ title, icon, label, href }: NavLink) => (
//           <DropdownMenuItem key={`${title}-${href}`} asChild>
//             <Link
//               to={href}
//               className={`${checkActiveNav(href) ? "bg-secondary" : ""}`}
//             >
//               {icon} <span className="ml-2 max-w-52 text-wrap">{title}</span>
//               {label && <span className="ml-auto text-xs">{label}</span>}
//             </Link>
//           </DropdownMenuItem>
//         ))}
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
export default Navbar;
