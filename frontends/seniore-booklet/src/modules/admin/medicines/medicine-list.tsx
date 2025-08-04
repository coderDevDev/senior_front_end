/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { MoreHorizontalIcon, PlusCircleIcon, SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import useMedicines from './hooks/useMedicines';
import MedicineContentForm from './medicine-content-form';
import { IMedicine } from './medicine.interface';
import {
  useArchiveMedicine,
  useUnarchiveMedicine
} from './hooks/useArchiveMedicine';
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Q_KEYS } from '@/shared/qkeys';

const MedicineList = () => {
  const queryClient = useQueryClient();
  const { data: medicines, isLoading, error, refetch } = useMedicines();

  const [formOpen, setFormOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<
    IMedicine | Record<string, any>
  >({});
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'archived'
  >('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [medicineToUpdate, setMedicineToUpdate] = useState<IMedicine | null>(
    null
  );
  const [isArchiving, setIsArchiving] = useState(true);

  const { archiveMedicineHandler, isPending: isStatusUpdating } =
    useArchiveMedicine();
  const { UnarchiveMedicineHandler, isPending: isUnarchiveUpdating } =
    useUnarchiveMedicine();

  const handleAddMedicine = () => {
    setEditingMedicine({});
    setFormOpen(true);
  };

  const handleEditMedicine = (visitor: IMedicine) => {
    setEditingMedicine(visitor);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    console.log('handleFormClose called', { formOpen, editingMedicine, open });
    setFormOpen(open);
    setEditingMedicine({});
    document.body.style.pointerEvents = 'auto';
  };

  const handleStatusClick = (medicine: IMedicine, archive: boolean) => {
    setMedicineToUpdate(medicine);
    setIsArchiving(archive);
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!medicineToUpdate) return;

    try {
      console.log('Updating medicine status:', {
        medicine: medicineToUpdate,
        isArchiving
      });

      if (isArchiving) {
        await archiveMedicineHandler(medicineToUpdate);
      } else {
        await UnarchiveMedicineHandler(medicineToUpdate);
      }

      await queryClient.invalidateQueries({ queryKey: [Q_KEYS.MEDICINE] });
      await refetch();

      setStatusDialogOpen(false);
      setMedicineToUpdate(null);

      toast.success(
        isArchiving
          ? `${medicineToUpdate.name} has been archived`
          : `${medicineToUpdate.name} has been restored`
      );
    } catch (error) {
      console.error('Error updating medicine status:', error);
      toast.error('Failed to update medicine status');
    }
  };

  const memoMedicines = useMemo(() => {
    const medicinesList = medicines?.data?.data?.medicines || [];

    return medicinesList.filter((medicine: IMedicine) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && !medicine.isActive) return false;
        if (statusFilter === 'archived' && medicine.isActive) return false;
      }

      if (!searchTerm) return true;

      const name = (medicine.name || '').toLowerCase();
      const brandName = (medicine.brandName || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      return name.includes(term) || brandName.includes(term);
    });
  }, [medicines, searchTerm, statusFilter]);

  const pagination = useMemo(
    () => ({
      currentPage: medicines?.data?.data?.currentPage?.page || 1,
      totalPages: medicines?.data?.data?.totalPages || 1,
      totalDocs: medicines?.data?.data?.totalDocs || 0,
      limit: medicines?.data?.data?.currentPage?.limit || 20
    }),
    [medicines]
  );

  const medicineCounts = useMemo(() => {
    const medicineList = medicines?.data?.data?.medicines || [];
    return {
      all: medicineList.length,
      active: medicineList.filter((medicine: IMedicine) => medicine.isActive)
        .length,
      archived: medicineList.filter((medicine: IMedicine) => !medicine.isActive)
        .length
    };
  }, [medicines]);

  useEffect(() => {
    if (!formOpen) {
      console.log('formOpen is false, resetting pointer-events');
      document.body.style.pointerEvents = 'auto';
    }
  }, [formOpen]);

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

    if (!memoMedicines || memoMedicines.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-[400px] text-center">
            No medicines found.
          </TableCell>
        </TableRow>
      );
    }

    return memoMedicines.map((medicine: IMedicine) => (
      <TableRow key={medicine.medicineId}>
        <TableCell className="hidden sm:table-cell">
          <img
            alt={`${medicine.brandName}'s avatar`}
            className="aspect-square rounded-md object-cover"
            height="64"
            src={medicine.medicineImageUrl as string}
            width="64"
          />
        </TableCell>
        <TableCell className="font-light">
          <span className="text-md font-bold">{medicine.name}</span> <br />
          <span className="text-xs">{medicine.brandName}</span>
        </TableCell>
        <TableCell>
          <Badge variant="outline">
            {!medicine.isActive ? 'Archived' : 'Active'}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => handleEditMedicine(medicine)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-pencil">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              <span className="sr-only">Edit</span>
            </Button>

            {medicine.isActive ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => handleStatusClick(medicine, true)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-archive">
                  <rect width="20" height="5" x="2" y="3" rx="1" />
                  <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                  <path d="M10 12h4" />
                </svg>
                <span className="sr-only">Archive</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-50"
                onClick={() => handleStatusClick(medicine, false)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-rotate-ccw">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                <span className="sr-only">Restore</span>
              </Button>
            )}
          </div>
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
            All ({medicineCounts.all})
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            className={`h-8 ${statusFilter === 'active' ? 'bg-green-600' : ''}`}
            onClick={() => setStatusFilter('active')}
            size="sm">
            Active ({medicineCounts.active})
          </Button>
          <Button
            variant={statusFilter === 'archived' ? 'default' : 'outline'}
            className={`h-8 ${
              statusFilter === 'archived' ? 'bg-gray-600' : ''
            }`}
            onClick={() => setStatusFilter('archived')}
            size="sm">
            Archived ({medicineCounts.archived})
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-full h-8 rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              placeholder="Search medicine..."
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            className="h-8 gap-1 bg-[#0B0400]"
            size="sm"
            variant="default"
            onClick={handleAddMedicine}>
            <PlusCircleIcon className="h-3.5 w-3.5" />
            <span className="text-white sr-only sm:not-sr-only">
              Add Medicine
            </span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#492309]">Medicines</CardTitle>
          <CardDescription>
            Manage your Medicines and view details.
            {statusFilter !== 'all' && (
              <span className="ml-2 capitalize">
                Currently viewing <strong>{statusFilter}</strong> medicines.
              </span>
            )}
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

                <TableHead>Status</TableHead>
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
              {memoMedicines.length > 0
                ? Math.min(
                    memoMedicines.length,
                    (pagination.currentPage - 1) * pagination.limit + 1
                  )
                : 0}
              -
              {Math.min(
                pagination.currentPage * pagination.limit,
                memoMedicines.length
              )}
            </strong>{' '}
            of <strong>{memoMedicines.length}</strong> Medicines
          </div>
          <div className="text-sm text-muted-foreground">
            Filter: <strong className="capitalize">{statusFilter}</strong> |
            Total Medicines:{' '}
            <strong>{medicines?.data?.data?.totalDocs || 0}</strong>
          </div>
        </CardFooter>
      </Card>

      {formOpen && (
        <MedicineContentForm
          medicine={editingMedicine}
          open={formOpen}
          onOpenChange={handleFormClose}
        />
      )}

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
            <AlertDialogTitle>
              {isArchiving ? 'Archive Medicine' : 'Unarchive Medicine'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArchiving
                ? 'Are you sure you want to archive this medicine? Archived medicines will not be visible to users.'
                : 'Are you sure you want to unarchive this medicine? Unarchived medicines will be visible to users.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                document.body.style.pointerEvents = 'auto';
                setStatusDialogOpen(false);
                setMedicineToUpdate(null);
              }}
              disabled={isStatusUpdating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={e => {
                e.preventDefault();
                confirmStatusUpdate();
              }}
              disabled={isStatusUpdating}
              className={isArchiving ? 'bg-destructive' : 'bg-primary'}>
              {isStatusUpdating ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : isArchiving ? (
                'Archive'
              ) : (
                'Unarchive'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MedicineList;
