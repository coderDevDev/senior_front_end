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
import { MoreHorizontalIcon, SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

import { Spinner } from '@/components/spinner';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import useReadSeniorCitizens from './profiles/hooks/useReadSeniorCitizen';
import { SeniorCitizenFormValues } from './senior-citizen-content-form';
import { useArchiveSenior, useUnarchiveSenior } from './hooks/useArchiveSenior';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import UpdateSeniorForm from './update-form.page';
import { useQuery } from '@tanstack/react-query';
import MedicalHistoryForm from './medical-history/medical-history-form';
import { cn } from '@/lib/utils';
import supabase from '@/shared/supabase';

type HealthStatusColor = {
  [key in 'excellent' | 'good' | 'fair' | 'poor']: string;
};

const healthStatusColors: HealthStatusColor = {
  excellent:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  good: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  fair: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  poor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const HealthStatusBadge = ({
  status
}: {
  status: string | null | undefined;
}) => {
  const safeStatus = status?.toLowerCase() || 'unknown';
  const color =
    safeStatus in healthStatusColors
      ? healthStatusColors[safeStatus as keyof HealthStatusColor]
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <Badge className={`${color} capitalize`} variant="outline">
      {safeStatus}
    </Badge>
  );
};

const SeniorCitizenList = () => {
  const navigate = useNavigate();
  const {
    data: seniorCitizensData,
    isLoading,
    error
  } = useReadSeniorCitizens();

  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'archived'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [seniorToUpdate, setSeniorToUpdate] = useState<any | null>(null);
  const [isArchiving, setIsArchiving] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSenior, setSelectedSenior] = useState<any>(null);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [selectedSeniorForMedical, setSelectedSeniorForMedical] =
    useState<any>(null);

  const { archiveSeniorHandler, isPending: isStatusUpdating } =
    useArchiveSenior();
  const { UnarchiveSeniorHandler, isPending: isUnarchiveUpdating } =
    useUnarchiveSenior();

  const { data: medicalRecord } = useQuery({
    queryKey: ['medical_records', selectedSeniorForMedical?.id],
    queryFn: async () => {
      if (!selectedSeniorForMedical) return null;
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('senior_id', selectedSeniorForMedical.id)
        .order('date', { ascending: false })
        .limit(1);

      if (error) throw error;
      return data[0] || null;
    },
    enabled: !!selectedSeniorForMedical
  });

  const memoSeniorCitizens = useMemo(() => {
    const seniors = seniorCitizensData?.data?.data?.seniorCitizens || [];

    return seniors.filter((senior: any) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && senior.is_archived) return false;
        if (statusFilter === 'archived' && !senior.is_archived) return false;
      }

      if (!searchTerm) return true;

      const fullName = `${senior.firstName} ${senior.lastName}`.toLowerCase();
      const email = senior.email.toLowerCase();
      const term = searchTerm.toLowerCase();

      return fullName.includes(term) || email.includes(term);
    });
  }, [seniorCitizensData, searchTerm, statusFilter]);

  const seniorCounts = useMemo(() => {
    const seniors = seniorCitizensData?.data?.data?.seniorCitizens || [];
    return {
      all: seniors.length,
      active: seniors.filter((senior: any) => !senior.is_archived).length,
      archived: seniors.filter((senior: any) => senior.is_archived).length
    };
  }, [seniorCitizensData]);

  const pagination = useMemo(
    () => ({
      currentPage: seniorCitizensData?.data?.data?.currentPage?.page || 1,
      totalPages: seniorCitizensData?.data?.data?.totalPages || 1,
      totalDocs: seniorCitizensData?.data?.data?.totalDocs || 0,
      limit: seniorCitizensData?.data?.data?.currentPage?.limit || 20
    }),
    [seniorCitizensData]
  );

  const handleStatusClick = (senior: any, archive: boolean) => {
    setSeniorToUpdate(senior);
    setIsArchiving(archive);
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!seniorToUpdate) return;

    try {
      if (isArchiving) {
        await archiveSeniorHandler(seniorToUpdate);
      } else {
        await UnarchiveSeniorHandler(seniorToUpdate);
      }
      setStatusDialogOpen(false);
      setSeniorToUpdate(null);
    } catch (error) {
      console.error('Error updating senior status:', error);
    }
  };

  const handleEditSenior = (seniorCitizen: any) => {
    setSelectedSenior(seniorCitizen);
    setIsEditModalOpen(true);
  };

  const handleViewMedicalHistory = (seniorCitizen: any) => {
    setSelectedSeniorForMedical(seniorCitizen);
    setShowMedicalModal(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedSenior(null);
  };

  const handleRowClick = (seniorCitizen: any) => {
    if (seniorCitizen.is_archived) return;
    handleViewMedicalHistory(seniorCitizen);
  };

  const handleMedicalModalClose = () => {
    setShowMedicalModal(false);
    setSelectedSeniorForMedical(null);
  };

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-[400px] text-center">
            <Spinner className="mx-auto" />
            <span className="sr-only">Loading senior citizens...</span>
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-[400px] text-center text-red-500">
            Error loading senior citizens. Please try again later.
          </TableCell>
        </TableRow>
      );
    }

    if (!memoSeniorCitizens || memoSeniorCitizens.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-[400px] text-center">
            No senior citizens found.
          </TableCell>
        </TableRow>
      );
    }

    return memoSeniorCitizens.map((seniorCitizen: any) => (
      <TableRow
        key={seniorCitizen.id}
        onClick={() => handleRowClick(seniorCitizen)}
        className={cn(
          'cursor-pointer hover:bg-muted/50',
          seniorCitizen.is_archived && 'opacity-50 pointer-events-none'
        )}>
        <TableCell className="hidden sm:table-cell">
          <img
            alt={`${seniorCitizen.firstName}'s avatar`}
            className="aspect-square rounded-md object-cover"
            height="64"
            src={
              (seniorCitizen.profileImg as string) ||
              'https://img.freepik.com/free-psd/3d-rendering-avatar_23-2150833550.jpg?t=st=1747008662~exp=1747012262~hmac=852de5bf124f39120c88535d93be8db4abd7e4861bf60a8478e01b337162d790&w=826'
            }
            width="64"
          />
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <div>
              <div className="font-medium">
                {seniorCitizen.firstName} {seniorCitizen.lastName}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {seniorCitizen.age} years old
                {medicalRecord &&
                  seniorCitizen.id === selectedSeniorForMedical?.id && (
                    <Badge
                      variant="outline"
                      className="text-blue-500 border-blue-500">
                      Has Medical Record
                    </Badge>
                  )}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <HealthStatusBadge status={seniorCitizen.healthStatus} />
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {seniorCitizen.email}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={`Actions for ${seniorCitizen.firstName} ${seniorCitizen.lastName}`}
                size="icon"
                variant="ghost"
                onClick={e => e.stopPropagation()}>
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  handleEditSenior(seniorCitizen);
                }}
                disabled={seniorCitizen.is_archived}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={e => {
                  e.stopPropagation();
                  handleViewMedicalHistory(seniorCitizen);
                }}
                disabled={seniorCitizen.is_archived}>
                View Medical History
              </DropdownMenuItem>
              {seniorCitizen.is_archived ? (
                <DropdownMenuItem
                  onClick={() => handleStatusClick(seniorCitizen, false)}
                  className="text-green-600 focus:text-green-600">
                  Unarchive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => handleStatusClick(seniorCitizen, true)}
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
            All ({seniorCounts.all})
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            className={`h-8 ${statusFilter === 'active' ? 'bg-green-600' : ''}`}
            onClick={() => setStatusFilter('active')}
            size="sm">
            Active ({seniorCounts.active})
          </Button>
          <Button
            variant={statusFilter === 'archived' ? 'default' : 'outline'}
            className={`h-8 ${
              statusFilter === 'archived' ? 'bg-gray-600' : ''
            }`}
            onClick={() => setStatusFilter('archived')}
            size="sm">
            Archived ({seniorCounts.archived})
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-full h-8 rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              placeholder="Search senior citizen..."
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <SeniorCitizenContentForm />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-[#492309]">Senior Citizens</CardTitle>
          <CardDescription>
            Manage senior citizens and view their profiles.
            {statusFilter !== 'all' && (
              <span className="ml-2 capitalize">
                Currently viewing <strong>{statusFilter}</strong> senior
                citizens.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Health Status</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableContent()}
              {memoSeniorCitizens.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No senior citizens found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Showing{' '}
            <strong>
              {memoSeniorCitizens.length > 0
                ? Math.min(
                    memoSeniorCitizens.length,
                    (pagination.currentPage - 1) * pagination.limit + 1
                  )
                : 0}
              -
              {Math.min(
                pagination.currentPage * pagination.limit,
                memoSeniorCitizens.length
              )}
            </strong>{' '}
            of <strong>{memoSeniorCitizens.length}</strong> Senior Citizens
          </div>
          <div className="text-sm text-muted-foreground">
            Filter: <strong className="capitalize">{statusFilter}</strong> |
            Total Senior Citizens:{' '}
            <strong>{seniorCitizensData?.data?.data?.totalDocs || 0}</strong>
          </div>
        </CardFooter>
      </Card>
      <AlertDialog
        open={statusDialogOpen}
        onOpenChange={open => {
          setStatusDialogOpen(open);
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
                  This will archive the senior citizen "
                  {seniorToUpdate?.firstName} {seniorToUpdate?.lastName}".
                  Archived senior citizens will no longer be accessible but
                  their data will be preserved.
                </>
              ) : (
                <>
                  This will unarchive the senior citizen "
                  {seniorToUpdate?.firstName} {seniorToUpdate?.lastName}". The
                  senior citizen will be accessible again.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                document.body.style.pointerEvents = 'auto';
                setStatusDialogOpen(false);
                setSeniorToUpdate(null);
              }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
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
              {isArchiving ? 'Archive Senior' : 'Unarchive Senior'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={isEditModalOpen}
        onOpenChange={open => {
          if (!open) {
            handleModalClose();
          }
        }}>
        <DialogContent className="max-w-4xl max-h-[90vh] md:w-[90vw] p-0">
          <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
            <DialogTitle className="text-xl font-semibold">
              Update Senior Citizen
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedSenior?.firstName} {selectedSenior?.lastName}
            </p>
          </DialogHeader>
          <div className="overflow-y-auto px-6 py-4 max-h-[calc(90vh-8rem)]">
            {selectedSenior && (
              <UpdateSeniorForm
                seniorData={selectedSenior}
                onSuccess={handleModalClose}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMedicalModal} onOpenChange={setShowMedicalModal}>
        <MedicalHistoryForm
          seniorId={selectedSeniorForMedical?.id}
          recordToEdit={medicalRecord}
          onSuccess={handleMedicalModalClose}
        />
      </Dialog>
    </>
  );
};

export default SeniorCitizenList;
