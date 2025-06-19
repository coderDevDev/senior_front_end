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
import { SearchIcon } from 'lucide-react';

import { Spinner } from '@/components/spinner';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState, useEffect } from 'react';
import useReadSeniorCitizens from './profiles/hooks/useReadSeniorCitizen';
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
import supabase from '@/shared/supabase';
import SeniorCitizenContentForm from './senior-citizen-content-form.tsx';
import { Pencil, FileText } from 'lucide-react';
import { ArrowUpCircle, ArchiveIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  const [userProfiles, setUserProfiles] = useState<Record<string, any>>({});

  const { archiveSeniorHandler, isPending: isStatusUpdating } =
    useArchiveSenior();
  const { UnarchiveSeniorHandler, isPending: isUnarchiveUpdating } =
    useUnarchiveSenior();

  // Fetch auth user profiles for profile images
  useEffect(() => {
    const fetchUserProfiles = async () => {
      const seniors = seniorCitizensData?.data?.data?.seniorCitizens || [];
      const userProfiles: Record<string, any> = {};

      // Get all unique user_uids
      const userUids = [
        ...new Set(
          seniors.map((senior: any) => senior.user_uid).filter(Boolean)
        )
      ];

      // Fetch auth users in batches
      for (const userUid of userUids) {
        try {
          // Get user from auth
          const { data: authUser, error } =
            await supabase.auth.admin.getUserById(userUid);

          if (!error && authUser.user) {
            userProfiles[userUid] = {
              profileImg: authUser.user.user_metadata?.profileImg,
              ...authUser.user.user_metadata
            };
          }
        } catch (error) {
          console.error(`Error fetching user ${userUid}:`, error);
          // Fallback: try to get from the senior citizen record
          const senior = seniors.find((s: any) => s.user_uid === userUid);
          if (senior?.profileImg) {
            userProfiles[userUid] = { profileImg: senior.profileImg };
          }
        }
      }

      setUserProfiles(userProfiles);
    };

    if (
      seniorCitizensData?.data?.data?.seniorCitizens &&
      seniorCitizensData.data.data.seniorCitizens.length > 0
    ) {
      fetchUserProfiles();
    }
  }, [seniorCitizensData]);

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
    console.log({ seniorCitizensData });
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

  const handleEdit = (senior: any) => {
    console.log({ senior });
    setSelectedSenior(senior);
    setIsEditModalOpen(true);
  };

  const handleViewMedical = (senior: any) => {
    setSelectedSeniorForMedical(senior);
    setShowMedicalModal(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedSenior(null);
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

    return memoSeniorCitizens.map((seniorCitizen: any) => {
      // Get profile image from auth metadata
      const userProfile = userProfiles[seniorCitizen.user_uid];
      const profileImage = userProfile?.profileImg || seniorCitizen.profileImg;

      return (
        <TableRow
          key={seniorCitizen.id}
          className="transition-colors hover:bg-muted/50">
          <TableCell className="hidden sm:table-cell">
            <Avatar>
              <AvatarImage
                src={profileImage}
                alt={`${seniorCitizen.firstName}'s profile`}
              />
              <AvatarFallback>
                {seniorCitizen.firstName?.[0] || ''}
                {seniorCitizen.lastName?.[0] || ''}
              </AvatarFallback>
            </Avatar>
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
            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleEdit(seniorCitizen)}
                variant="ghost"
                size="sm"
                className="h-8 px-2">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => handleViewMedical(seniorCitizen)}
                variant="ghost"
                size="sm"
                className="h-8 px-2">
                <FileText className="h-4 w-4" />
              </Button>
              {seniorCitizen.is_archived ? (
                <Button
                  onClick={() => handleStatusClick(seniorCitizen, false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-green-600 hover:text-green-700">
                  <ArrowUpCircle className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleStatusClick(seniorCitizen, true)}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-red-600 hover:text-red-700">
                  <ArchiveIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      );
    });
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
                <TableHead>Picture</TableHead>
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
      <Dialog open={isEditModalOpen} onOpenChange={handleModalClose}>
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
              <UpdateSeniorForm seniorDataForm={selectedSenior} />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showMedicalModal} onOpenChange={handleMedicalModalClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medical History</DialogTitle>
          </DialogHeader>
          <MedicalHistoryForm
            seniorId={selectedSeniorForMedical?.id}
            recordToEdit={medicalRecord}
            onSuccess={handleMedicalModalClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SeniorCitizenList;
