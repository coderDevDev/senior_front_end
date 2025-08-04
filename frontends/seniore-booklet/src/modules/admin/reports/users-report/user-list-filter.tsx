import { Spinner } from '@/components/spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useReadUsers from '../../users/hooks/useReadUsers';
import IUser from '../../users/user.interface';

type RoleColor = {
  [key in 'admin' | 'staff' | 'visitor']: string;
};

const roleColors: RoleColor = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  staff: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  visitor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

const RoleBadge = ({ role }: { role: string }) => {
  const color =
    role.toLowerCase() in roleColors
      ? roleColors[role.toLowerCase() as keyof RoleColor]
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <Badge className={`${color} capitalize`} variant="outline">
      {role}
    </Badge>
  );
};

const UserFilterList = () => {
  const navigate = useNavigate();
  const { data: users, isLoading, error } = useReadUsers();
  const [searchTerm, setSearchTerm] = useState('');

  const memoUsers = useMemo(() => {
    // Make sure we're accessing the correct data structure
    const allUsers = users?.data || [];

    console.log({ users });
    if (!searchTerm) return allUsers;

    return allUsers;
  }, [users, searchTerm]);

  const pagination = useMemo(
    () => ({
      currentPage: 1,
      totalPages: 1,
      totalDocs: users?.data?.length || 0,
      limit: 20
    }),
    [users]
  );

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-[400px] text-center">
            <Spinner className="mx-auto" />
            <span className="sr-only">Loading users...</span>
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-[400px] text-center text-red-500">
            Error loading users. Please try again later.
          </TableCell>
        </TableRow>
      );
    }

    if (!Array.isArray(memoUsers) || memoUsers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-[400px] text-center">
            No users found.
          </TableCell>
        </TableRow>
      );
    }

    return memoUsers.map((user: IUser) => (
      <TableRow key={user.id}>
        <TableCell className="hidden sm:table-cell">
          <img
            alt={`${user.firstName}'s avatar`}
            className="aspect-square rounded-md object-cover"
            height="64"
            src={(user as any).userImg || '/default-avatar.png'}
            width="64"
          />
        </TableCell>
        <TableCell className="font-light">
          <span className="text-md font-bold">
            {user.firstName} {user.lastName}
          </span>
          <br />
          <span className="text-xs">{user.email}</span>
        </TableCell>
        <TableCell className="hidden md:table-cell">
          <RoleBadge role={user.userRole || 'admin'} />
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={`Actions for ${user.email}`}
                size="icon"
                variant="ghost">
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigate(`/admin/users/update_form/${user.id}`)}>
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <div className="flex items-center p-4">
        <div className="ml-auto flex items-center gap-2">
          <div className="relative ml-auto flex-1 md:grow-0">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-full h-8 rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              placeholder="Search users..."
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#492309]">Users Report</CardTitle>
          <CardDescription>
            View and manage user information and statistics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderTableContent()}</TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Showing{' '}
            <strong>
              {(pagination.currentPage - 1) * pagination.limit + 1}-
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.totalDocs
              )}
            </strong>{' '}
            of <strong>{pagination.totalDocs}</strong> Users
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default UserFilterList;
