/* eslint-disable @typescript-eslint/no-explicit-any */
import { Spinner } from "@/components/spinner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useArchivedSeniors from "../hooks/useArchivedSeniors";

const SeniorArchiveList = () => {
  const { data: seniors, isLoading, error } = useArchivedSeniors();

  const renderTableContent = () => {
    if (isLoading) {
      return <TableRow><TableCell colSpan={4}><Spinner /></TableCell></TableRow>;
    }

    if (error) {
      return <TableRow><TableCell colSpan={4}>Error loading archived seniors.</TableCell></TableRow>;
    }

    const archivedSeniors = seniors?.data?.data?.seniors || [];
    return archivedSeniors.map((senior: any) => (
      <TableRow key={senior.id}>
        <TableCell>{senior.name}</TableCell>
        <TableCell>{senior.seniorId}</TableCell>
        <TableCell>{senior.address}</TableCell>
        <TableCell><Badge variant="secondary">Archived</Badge></TableCell>
      </TableRow>
    ));
  };

  return (
    <Card>
      <CardHeader><CardTitle>Archived Senior Citizens</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Senior ID</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{renderTableContent()}</TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SeniorArchiveList;
