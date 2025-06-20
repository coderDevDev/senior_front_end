import { useForm } from 'react-hook-form';
import {
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import supabase from '@/shared/supabase';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

// First, define a proper schema for the form
const medicalRecordSchema = z.object({
  date: z.string(),
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  treatment: z.string().min(1, 'Treatment is required'),
  notes: z.string().optional()
});

type MedicalRecordFormValues = z.infer<typeof medicalRecordSchema>;

interface MedicalHistoryFormProps {
  seniorId?: string;
  recordToEdit?: MedicalRecord; // Replace 'any' with proper type
  onSuccess?: () => void;
}

interface MedicalRecord {
  id: string;
  senior_id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const MedicalHistoryForm = ({
  seniorId,
  recordToEdit,
  onSuccess
}: MedicalHistoryFormProps) => {
  const queryClient = useQueryClient();

  // Initialize form first
  const form = useForm<MedicalRecordFormValues>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      date: recordToEdit?.date || new Date().toISOString().split('T')[0],
      diagnosis: recordToEdit?.diagnosis || '',
      treatment: recordToEdit?.treatment || '',
      notes: recordToEdit?.notes || ''
    }
  });

  // Then use it in useEffect
  useEffect(() => {
    if (recordToEdit) {
      form.reset({
        date: recordToEdit.date || new Date().toISOString().split('T')[0],
        diagnosis: recordToEdit.diagnosis || '',
        treatment: recordToEdit.treatment || '',
        notes: recordToEdit.notes || ''
      });
    }
  }, [recordToEdit, form]);

  // Update mutation to handle both create and update
  const { mutate: saveMedicalRecord, isPending } = useMutation({
    mutationFn: async (data: MedicalRecordFormValues) => {
      if (!seniorId) {
        throw new Error('Senior ID is required');
      }

      console.log('Saving medical record with seniorId:', seniorId);
      console.log('Form data:', data);

      if (recordToEdit) {
        // Update existing record
        console.log('Updating existing record:', recordToEdit.id);
        const { error } = await supabase
          .from('medical_records')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', recordToEdit.id);

        if (error) throw error;
        return { ...recordToEdit, ...data };
      } else {
        // Create new record
        console.log('Creating new record for senior_id:', seniorId);
        const recordData = {
          senior_id: seniorId,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log('Record data to insert:', recordData);

        const { data: newRecord, error } = await supabase
          .from('medical_records')
          .insert(recordData)
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }

        console.log('Successfully created record:', newRecord);
        return newRecord;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['medical_records', seniorId]
      });
      toast.success(
        recordToEdit
          ? 'Record updated successfully'
          : 'Record added successfully'
      );
      onSuccess?.();
    },
    onError: error => {
      console.error('Error saving record:', error);
      if (error.message.includes('foreign key constraint')) {
        toast.error(
          'Unable to save record. Please make sure your profile is properly set up.'
        );
      } else {
        toast.error('Failed to save record');
      }
    }
  });

  // Handle form submission
  const onSubmit = (data: MedicalRecordFormValues) => {
    saveMedicalRecord(data);
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>
          {recordToEdit ? 'Edit Medical Record' : 'Add Medical Record'}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    value={
                      field.value || new Date().toISOString().split('T')[0]
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="diagnosis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Diagnosis</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter diagnosis" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="treatment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Treatment</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter treatment" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Add any additional notes"
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onSuccess}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'Saving...'
                : recordToEdit
                ? 'Update Record'
                : 'Add Record'}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default MedicalHistoryForm;
