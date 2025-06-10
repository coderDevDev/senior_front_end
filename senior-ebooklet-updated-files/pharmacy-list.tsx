  /* eslint-disable @typescript-eslint/no-explicit-any */
import { Spinner } from "@/components/spinner"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontalIcon, PlusCircleIcon, SearchIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useArchivePharmacy, useUnarchivePharmacy } from "./hooks/useArchivePharmacy"
import usePharmacies from "./hooks/usePharmacies"
import PharmacyContentForm from "./pharmacy-content-form"
import IPharmacy from "./pharmacy.interface"

const StatusBadge = ({ status }: { status?: string }) => {
  const statusMap: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    archived: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  const displayStatus = status || "active";
  const color = statusMap[displayStatus] || statusMap.active;

  return (
    <Badge className={`${color} capitalize`} variant="outline">
      {displayStatus}
    </Badge>
  );
};

const PharmacyList = () => {
  const { data: pharmacies, isLoading, error } = usePharmacies();
  const [formOpen, setFormOpen] = useState(false)
  const [editingPharmacy, setEditingPharmacy] = useState<IPharmacy | Record<string, any>>({})
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [searchTerm, setSearchTerm] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [pharmacyToUpdate, setPharmacyToUpdate] = useState<IPharmacy | null>(null);
  const [isArchiving, setIsArchiving] = useState(true);

  const { archivePharmacyHandler, isPending: isStatusUpdating } = useArchivePharmacy();
  const { UnarchivePharmacyHandler, isPending: isUnarchiveUpdating } = useUnarchivePharmacy();

  const handleAddPharmacy = () => {
    setEditingPharmacy({})
    setFormOpen(true)
  }

  const handleEditPharmacy = (visitor: IPharmacy) => {
    setEditingPharmacy(visitor)
    setFormOpen(true)
  }

  const handleFormClose = (open: boolean) => {
    console.log("handleFormClose called", { formOpen, editingPharmacy, open });
    setFormOpen(open);
    setEditingPharmacy({});
    document.body.style.pointerEvents = "auto";
  };

  const handleStatusClick = (pharmacy: IPharmacy, archive: boolean) => {
    setPharmacyToUpdate(pharmacy);
    setIsArchiving(archive);
    setStatusDialogOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!pharmacyToUpdate) return;
    
    try {
      if (isArchiving) {
        await archivePharmacyHandler(pharmacyToUpdate);
      } else {
        await UnarchivePharmacyHandler(pharmacyToUpdate);
      }
      // Close dialog and reset state
      setStatusDialogOpen(false);
      setPharmacyToUpdate(null);
    } catch (error) {
      console.error('Error updating pharmacy status:', error);
      // Handle error (you might want to show a toast or alert)
    }
  };

  const filteredPharmacies = useMemo(() => {
    const pharmacyList = pharmacies?.data?.data?.pharmacies || [];
    
    return pharmacyList.filter((pharmacy: IPharmacy) => {
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && pharmacy.status === 'archived') return false;
        if (statusFilter === 'archived' && (!pharmacy.status || pharmacy.status === 'active')) return false;
      }
      
      if (!searchTerm) return true;
      
      const pharmacyName = (pharmacy.name || '').toLowerCase();
      const pharmacyEmail = (pharmacy.email || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      
      return pharmacyName.includes(term) || pharmacyEmail.includes(term);
    });
  }, [pharmacies, searchTerm, statusFilter]);

  const pharmacyCounts = useMemo(() => {
    const pharmacyList = pharmacies?.data?.data?.pharmacies || [];
    return {
      all: pharmacyList.length,
      active: pharmacyList.filter((pharmacy: IPharmacy) => !pharmacy.status || pharmacy.status === 'active').length,
      archived: pharmacyList.filter((pharmacy: IPharmacy) => pharmacy.status === 'archived').length
    };
  }, [pharmacies]);

  const pagination = useMemo(() => ({
    currentPage: pharmacies?.data?.data?.currentPage?.page || 1,
    totalPages: pharmacies?.data?.data?.totalPages || 1,
    totalDocs: pharmacies?.data?.data?.totalDocs || 0,
    limit: pharmacies?.data?.data?.currentPage?.limit || 20
  }), [pharmacies]);

  useEffect(() => {
    if (!formOpen) {
      console.log("formOpen is false, resetting pointer-events");
      document.body.style.pointerEvents = "auto";
    }
  }, [formOpen]);

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-[400px] text-center">
            <Spinner className="mx-auto" />
            <span className="sr-only">Loading users list...</span>
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

    if (!filteredPharmacies || filteredPharmacies.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="h-[400px] text-center">
            No users found.
          </TableCell>
        </TableRow>
      );
    }

    return filteredPharmacies.map((pharmacy: IPharmacy) => (
      <TableRow key={pharmacy.pharmacyId}>
        <TableCell className="hidden sm:table-cell">
          <img
            alt={`${pharmacy.name}'s image`}
            className="aspect-square rounded-md object-cover"
            height="64"
            src={pharmacy.pharmacyImg as string}
            width="64"
          />
        </TableCell>
        <TableCell className="font-light">
          <span className="text-md font-bold">{pharmacy.name}</span> <br />
          <span className="text-xs">{pharmacy.email}</span>
        </TableCell>
        <TableCell>
          <StatusBadge status={pharmacy.status} />
        </TableCell>
        <TableCell className="hidden md:table-cell">
          {pharmacy.phoneNumber}
        </TableCell>
        <TableCell>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={`Actions for ${pharmacy.name}`}
                size="icon"
                variant="ghost"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => handleEditPharmacy(pharmacy)}
                disabled={pharmacy.status === 'archived'}
              >
                Edit
              </DropdownMenuItem>
              
              {pharmacy.status === 'archived' ? (
                <DropdownMenuItem 
                  onClick={() => handleStatusClick(pharmacy, false)}
                  className="text-green-600 focus:text-green-600"
                >
                  Unarchive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => handleStatusClick(pharmacy, true)}
                  className="text-red-600 focus:text-red-600"
                >
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
            variant={statusFilter === 'all' ? "default" : "outline"}
            className={`h-8 ${statusFilter === 'all' ? 'bg-[#0B0400]' : ''}`}
            onClick={() => setStatusFilter('all')}
            size="sm"
          >
            All ({pharmacyCounts.all})
          </Button>
          <Button
            variant={statusFilter === 'active' ? "default" : "outline"}
            className={`h-8 ${statusFilter === 'active' ? 'bg-green-600' : ''}`}
            onClick={() => setStatusFilter('active')}
            size="sm"
          >
            Active ({pharmacyCounts.active})
          </Button>
          <Button
            variant={statusFilter === 'archived' ? "default" : "outline"}
            className={`h-8 ${statusFilter === 'archived' ? 'bg-gray-600' : ''}`}
            onClick={() => setStatusFilter('archived')}
            size="sm"
          >
            Archived ({pharmacyCounts.archived})
          </Button>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="w-full h-8 rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              placeholder="Search pharmacy..."
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="h-8 gap-1 bg-[#0B0400] text-white" size="sm" variant="gooeyLeft" onClick={handleAddPharmacy}>
            <PlusCircleIcon className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Add Pharmacy</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[#492309]">Pharmacy</CardTitle>
          <CardDescription>
            Manage your Pharmacy and view medicines.
            {statusFilter !== 'all' && (
              <span className="ml-2 capitalize">
                Currently viewing <strong>{statusFilter}</strong> pharmacies.
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
                <TableHead className="hidden md:table-cell">
                  Phone Number{" "}
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableContent()}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-muted-foreground">
            Showing <strong>{(pagination.currentPage - 1) * pagination.limit + 1}-{Math.min(pagination.currentPage * pagination.limit, pagination.totalDocs)}</strong> of <strong>{pagination.totalDocs}</strong> Pharmacy
          </div>
        </CardFooter>
      </Card>

      {formOpen && (
        <PharmacyContentForm
          pharmacy={editingPharmacy}
          open={formOpen}
          onOpenChange={handleFormClose}
        />
      )}

      {/* Status Update Confirmation Dialog */}
      <AlertDialog 
        open={statusDialogOpen} 
        onOpenChange={(open) => {
          setStatusDialogOpen(open);
          if (!open) {
            document.body.style.pointerEvents = "auto";
          }
        }}
      >
        <AlertDialogContent className="z-50">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {isArchiving ? (
                <>This will archive the pharmacy "{pharmacyToUpdate?.name}". 
                  Archived pharmacies will no longer be accessible but their data will be preserved.</>
              ) : (
                <>This will unarchive the pharmacy "{pharmacyToUpdate?.name}". 
                  The pharmacy will be accessible again.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                document.body.style.pointerEvents = "auto";
                setStatusDialogOpen(false);
                setPharmacyToUpdate(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                confirmStatusUpdate();
              }} 
              disabled={isStatusUpdating || isUnarchiveUpdating}
              className={isArchiving ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {isStatusUpdating || isUnarchiveUpdating ? <Spinner className="h-4 w-4 mr-2" /> : null}
              {isArchiving ? "Archive Pharmacy" : "Unarchive Pharmacy"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default PharmacyList
