/* eslint-disable @typescript-eslint/no-explicit-any */
import { Spinner } from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useArchivedMedicines from "../hooks/useArchivedMedicines";

const MedicineArchiveList = () => {
  const { data: medicines, isLoading, error } = useArchivedMedicines();

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-[400px] text-center">
            <Spinner className="mx-auto" />
          </TableCell>
        </TableRow>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="h-[400px] text-center text-red-500">
            Error loading archived medicines.
          </TableCell>
        </TableRow>
      );
    }

    const archivedMedicines = medicines?.data?.data?.medicines || [];

    return archivedMedicines.map((medicine: any) => (
      <TableRow key={medicine.id}>
        <TableCell>{medicine.name}</TableCell>
        <TableCell>{medicine.brandName}</TableCell>
        <TableCell>{medicine.genericName}</TableCell>
        <TableCell>
          <Badge variant="secondary">Archived</Badge>
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Archived Medicines</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Brand Name</TableHead>
              <TableHead>Generic Name</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderTableContent()}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MedicineArchiveList;
