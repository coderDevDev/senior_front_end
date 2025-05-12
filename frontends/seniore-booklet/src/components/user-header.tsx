import { Button } from '@/components/ui/button';
import { useBag } from '@/context/bag-context';
import { ShoppingBag, User } from 'lucide-react';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import useCurrentUser from '@/modules/authentication/hooks/useCurrentUser';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTab } from '@/context/tab-context';
import { useLogout } from '@/modules/authentication/hooks/useLogout';

const UserHeader = ({ headerName }: { headerName?: ReactNode | string }) => {
  return (
    <>
      <p className="font-bold text-sm md:text-1xl">{headerName}</p>
    </>
  );
};

export function UserNav() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { setActiveTab } = useTab();

  const handleProfileClick = () => {
    setActiveTab('profile');
    // If we're not already in the senior app, navigate there
    if (!window.location.pathname.includes('/senior-app')) {
      navigate('/senior-app');
    }
  };

  const {
    logout,
    confirmLogout,
    cancelLogout,
    showConfirmDialog,
    isLoggingOut
  } = useLogout({
    redirectTo: '/login',
    onLogoutSuccess: () => {
      // Additional cleanup specific to your app (if needed)
      console.log('Logged out successfully');
    }
  });

  return (
    <div className="flex items-center gap-2">
      <div className="text-right">
        <p className="text-sm font-medium leading-none dark:text-white truncate max-w-[120px] sm:max-w-none">
          {user?.user_metadata?.firstName || 'Senior Citizen'}
        </p>
        <p className="text-xs text-muted-foreground hidden sm:block">
          {user?.user_metadata?.seniorCitizenId ||
            'Senior Citizen ID: SC-123456'}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-primary/20 flex-shrink-0">
            <User className="h-6 w-6 sm:h-8 sm:w-8" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.user_metadata?.firstName} {user?.user_metadata?.lastName}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick}>
            Profile
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => confirmLogout()}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function CashierNav() {
  const { items } = useBag();
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => navigate('/senior-app/checkout')}>
        <ShoppingBag className="h-6 w-6" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {items.length}
          </span>
        )}
      </Button>
      <div className="text-right">
        <p className="text-sm font-medium leading-none dark:text-white truncate max-w-[120px] sm:max-w-none">
          Juan Dela Cruz
        </p>
        <p className="text-xs text-muted-foreground hidden sm:block">
          Cashier ID: SC-123456
        </p>
      </div>
      <Button
        variant="ghost"
        className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-primary/20 flex-shrink-0">
        <User className="h-6 w-6 sm:h-8 sm:w-8" />
      </Button>
    </div>
  );
}

export { UserHeader };
