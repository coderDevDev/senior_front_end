/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { MoreHorizontalIcon, PlusCircleIcon, SearchIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import IUser from './user.interface';

import { Spinner } from '@/components/spinner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useEffect, useMemo, useState } from 'react';
import { useArchiveUser, useUnarchiveUser } from './hooks/useArchiveUser';
import useReadUsers from './hooks/useReadUsers';
import UserContentForm from './user-content-form';

type RoleColor = {
  [key in 'admin' | 'staff' | 'visitor']: string;
};

const roleColors: RoleColor = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  staff: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  visitor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

const StatusBadge = ({ status }: { status?: string }) => {
  const statusMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    archived: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    suspended:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  };

  const displayStatus = status || 'active';
  const color = statusMap[displayStatus] || statusMap.active;

  return (
    <Badge className={`${color} capitalize`} variant="outline">
      {displayStatus}
    </Badge>
  );
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

const UsersList = () => {
  const { data: usersData, isLoading, error, refetch } = useReadUsers();

  console.log({ usersData });
  const { archiveUserHandler, isPending: isStatusUpdating } = useArchiveUser();
  const { UnarchiveUserHandler, isPending: isUnarchiveUpdating } =
    useUnarchiveUser();
  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | Record<string, any>>(
    {}
  );
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<IUser | null>(null);
  const [isArchiving, setIsArchiving] = useState(true); // true for archive, false for unarchive
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'archived'
  >('all');

  const handleAddUser = () => {
    setEditingUser({});
    setFormOpen(true);
  };

  const handleEditUser = (user: IUser) => {
    setEditingUser(user);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    console.log('handleFormClose called', { formOpen, editingUser, open });
    setFormOpen(open);
    setEditingUser({});
    // Force reset pointer-events on body
    document.body.style.pointerEvents = 'auto';
    // Refetch users after form closes
    refetch();
  };

  const handleStatusClick = (user: IUser, archive: boolean) => {
    setUserToUpdate(user);
    setIsArchiving(archive);
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!userToUpdate) return;

    let success;
    if (isArchiving) {
      success = await archiveUserHandler(userToUpdate);
    } else {
      success = await UnarchiveUserHandler(userToUpdate);
    }

    if (success) {
      refetch(); // Refresh the user list after successful status update
    }

    // Reset pointer-events on body element to ensure UI remains clickable
    document.body.style.pointerEvents = 'auto';

    // Close dialog and reset state
    setStatusDialogOpen(false);
    setUserToUpdate(null);
  };

  const filteredUsers = useMemo(() => {
    const users = usersData || [];

    console.log({ users });
    return users
      .filter((user: IUser) => {
        // Apply status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'active' && user.status === 'archived')
            return false;
          if (
            statusFilter === 'archived' &&
            (!user.status || user.status === 'active')
          )
            return false;
        }

        // Apply search filter if there's a search term
        if (!searchTerm) return true;

        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        const term = searchTerm.toLowerCase();

        return fullName.includes(term) || email.includes(term);
      })
      .filter(u => ['admin', 'cashier'].includes(u.userRole));
  }, [usersData, searchTerm, statusFilter]);

  // Count users by status
  const userCounts = useMemo(() => {
    const users = usersData || [];
    return {
      all: users.length,
      active: users.filter(
        (user: IUser) => !user.status || user.status === 'active'
      ).length,
      archived: users.filter((user: IUser) => user.status === 'archived').length
    };
  }, [usersData]);

  useEffect(() => {
    // Reset pointer-events whenever modal states change
    console.log('Modal state changed, resetting pointer-events');
    document.body.style.pointerEvents = 'auto';
  }, [formOpen, statusDialogOpen]);

  const pagination = useMemo(
    () => ({
      currentPage: 1,
      totalPages: 1,
      totalDocs: usersData?.data?.length || 0,
      limit: 20
    }),
    [usersData]
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

    if (!filteredUsers || filteredUsers.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-[400px] text-center">
            No users found matching your criteria.
            {searchTerm && (
              <div className="mt-2">Try changing your search term.</div>
            )}
            {statusFilter !== 'all' && (
              <div className="mt-2">Try changing the status filter.</div>
            )}
          </TableCell>
        </TableRow>
      );
    }

    return filteredUsers.map((user: IUser) => (
      <TableRow
        key={user.id}
        className={user.status === 'archived' ? 'opacity-60' : ''}>
        <TableCell className="font-light">
          <span className="text-md font-bold">
            {user.firstName} {user.lastName}
          </span>{' '}
          <br />
          <span className="text-xs">{user.email}</span>
        </TableCell>
        <TableCell>
          <StatusBadge status={user.status} />
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
                onClick={() => handleEditUser(user)}
                disabled={user.status === 'archived'}>
                Edit
              </DropdownMenuItem>

              {user.status === 'archived' ? (
                <DropdownMenuItem
                  onClick={() => handleStatusClick(user, false)}
                  className="text-green-600 focus:text-green-600">
                  Unarchive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleStatusClick(user, true)}
                  className="text-red-600 focus:text-red-600">
                  Archive
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            className={`h-8 ${statusFilter === 'all' ? 'bg-[#0B0400]' : ''}`}
            onClick={() => setStatusFilter('all')}
            size="sm">
            All ({userCounts.all})
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            className={`h-8 ${statusFilter === 'active' ? 'bg-green-600' : ''}`}
            onClick={() => setStatusFilter('active')}
            size="sm">
            Active ({userCounts.active})
          </Button>
          <Button
            variant={statusFilter === 'archived' ? 'default' : 'outline'}
            className={`h-8 ${
              statusFilter === 'archived' ? 'bg-gray-600' : ''
            }`}
            onClick={() => setStatusFilter('archived')}
            size="sm">
            Archived ({userCounts.archived})
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 w-full">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-full h-8 rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              placeholder="Search user..."
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <Button
            className="h-8 gap-1 bg-[#0B0400] text-white"
            size="sm"
            variant="default"
            onClick={handleAddUser}>
            <PlusCircleIcon className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Add User
            </span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#492309]">Users</CardTitle>
          <CardDescription>
            Manage your Users and view their profile.
            {statusFilter !== 'all' && (
              <span className="ml-2 capitalize">
                Currently viewing <strong>{statusFilter}</strong> users.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Role</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{renderTableContent()}</TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Showing{' '}
            <strong>
              {filteredUsers.length > 0
                ? Math.min(
                    filteredUsers.length,
                    (pagination.currentPage - 1) * pagination.limit + 1
                  )
                : 0}
              -
              {Math.min(
                pagination.currentPage * pagination.limit,
                filteredUsers.length
              )}
            </strong>{' '}
            of <strong>{filteredUsers.length}</strong> Users
          </div>
          <div className="text-sm text-muted-foreground">
            Filter: <strong className="capitalize">{statusFilter}</strong> |
            Total Users: <strong>{usersData?.length || 0}</strong>
          </div>
        </CardFooter>
      </Card>

      {/* Edit User Form Dialog */}
      {formOpen && (
        <UserContentForm
          user={editingUser}
          open={formOpen}
          onOpenChange={handleFormClose}
        />
      )}

      {/* Status Update Confirmation Dialog */}
      <AlertDialog
        open={statusDialogOpen}
        onOpenChange={(open: boolean | ((prevState: boolean) => boolean)) => {
          setStatusDialogOpen(open);
          // Force reset pointer-events when dialog closes
          if (!open) {
            document.body.style.pointerEvents = 'auto';
          }
        }}>
        <AlertDialogContent className="z-50">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {isArchiving ? (
                <>
                  This will archive the user "{userToUpdate?.firstName}{' '}
                  {userToUpdate?.lastName}". Archived users will no longer have
                  access to the system but their data will be preserved.
                </>
              ) : (
                <>
                  This will unarchive the user "{userToUpdate?.firstName}{' '}
                  {userToUpdate?.lastName}". The user will regain access to the
                  system.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isStatusUpdating || isUnarchiveUpdating}
              onClick={() => {
                document.body.style.pointerEvents = 'auto';
                setStatusDialogOpen(false);
                setUserToUpdate(null);
              }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e: { preventDefault: () => void }) => {
                e.preventDefault(); // Prevent default to handle it ourselves
                confirmStatusUpdate();
              }}
              disabled={isStatusUpdating || isUnarchiveUpdating}
              className={
                isArchiving
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }>
              {isStatusUpdating || isUnarchiveUpdating ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : null}
              {isArchiving ? 'Archive User' : 'Unarchive User'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UsersList;
