import { Spinner } from "@/components/spinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontalIcon, SearchIcon } from "lucide-react"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import useMedicines from "../../medicines/hooks/useMedicines"
import MedicineContentForm from "../../medicines/medicine-content-form"
import IMedicine from "../../medicines/medicine.interface"





const MedicineFilterList = () => {


  const { data: medicines, isLoading, error } = useMedicines();

  const navigate = useNavigate();


  const memoMedicines = useMemo(() => {
    return medicines?.data?.data?.medicines || [];
  }, [medicines])

  const pagination = useMemo(() => ({
    currentPage: medicines?.data?.data?.currentPage?.page || 1,
    totalPages: medicines?.data?.data?.totalPages || 1,
    totalDocs: medicines?.data?.data?.totalDocs || 0,
    limit: medicines?.data?.data?.currentPage?.limit || 20
  }), [medicines]);

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
    
        return memoMedicines.map((user: IMedicine) => (
          <TableRow key={user.medicineId}>
            <TableCell className="hidden sm:table-cell">
              <img
                alt={`${user.brandName}'s avatar`}
                className="aspect-square rounded-md object-cover"
                height="64"
                src={user.medicineImageUrl as string}
                width="64"
              />
            </TableCell>
            <TableCell className="font-light">
              <span className="text-md font-bold">{user.name}</span> <br />
              <span className="text-xs">{user.brandName}</span>
            </TableCell>
            <TableCell>
              <Badge variant="outline">Active</Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              {/* <RoleBadge role={user.userRole || "admin"} /> */}
            </TableCell>
            
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label={`Actions for ${user.name}`}
                    size="icon"
                    variant="ghost"
                  >
                    <MoreHorizontalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => navigate(`update_form/${user.medicineId}`)}>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
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
            placeholder="Search pharmacy..."
            type="search"
          />
        </div>

        <MedicineContentForm />
      </div>
    </div>
      <Card x-chunk="dashboard-06-chunk-0">
        <CardHeader>
          <CardTitle className="text-[#492309]">Medicine</CardTitle>
          <CardDescription>
            Manage your Medicine and detailed view.
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
                  Dosage Form
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
              Showing <strong>{(pagination.currentPage - 1) * pagination.limit + 1}-{Math.min(pagination.currentPage * pagination.limit, pagination.totalDocs)}</strong> of <strong>{pagination.totalDocs}</strong> Medicine
            </div>
        </CardFooter>
      </Card>
    </>
  )
}

export default MedicineFilterList
