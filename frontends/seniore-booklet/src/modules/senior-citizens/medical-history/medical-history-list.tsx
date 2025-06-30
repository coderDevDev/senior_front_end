import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Pencil, Trash2 } from 'lucide-react';
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
import { format } from 'date-fns';
import supabase from '@/shared/supabase';
import MedicalHistoryForm from './medical-history-form';
import { Spinner } from '@/components/spinner';
import useCurrentUser from '@/modules/authentication/hooks/useCurrentUser';

interface MedicalHistoryListProps {
  seniorId?: string;
}

type MedicalRecord = {
  id: string;
  diagnosis: string;
  date: string;
  treatment: string;
  notes?: string;
};

const MedicalHistoryList = ({ seniorId }: MedicalHistoryListProps) => {
  const [editRecord, setEditRecord] = useState<MedicalRecord | null>(null);
  const [deleteRecord, setDeleteRecord] = useState<MedicalRecord | null>(null);
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const userRole = user?.user_metadata?.role;

  const { data: records, isLoading } = useQuery({
    queryKey: ['medical_records', seniorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('senior_id', seniorId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { mutate: deleteRecordMutation } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['medical_records', seniorId]
      });
      toast.success('Record deleted successfully');
      setDeleteRecord(null);
    },
    onError: error => {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {records?.map(record => (
          <Card key={record.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{record.diagnosis}</span>
                {userRole !== 'senior_citizen' && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditRecord(record)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteRecord(record)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                {format(new Date(record.date), 'PPP')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold">Treatment</h4>
                  <p className="text-sm">{record.treatment}</p>
                </div>
                {record.notes && (
                  <div>
                    <h4 className="font-semibold">Notes</h4>
                    <p className="text-sm">{record.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {userRole !== 'senior_citizen' && (
        <>
          <Dialog open={!!editRecord} onOpenChange={() => setEditRecord(null)}>
            <MedicalHistoryForm
              seniorId={seniorId}
              recordToEdit={editRecord}
              onSuccess={() => setEditRecord(null)}
            />
          </Dialog>

          <AlertDialog
            open={!!deleteRecord}
            onOpenChange={() => setDeleteRecord(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  medical record.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deleteRecord && deleteRecordMutation(deleteRecord.id)
                  }
                  className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
};

export default MedicalHistoryList;
