import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '@/shared/supabase';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Package,
  AlertCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  BarChart3,
  List
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import DetailedDashboard from '../admin/dashboard/detailed.dashboard';
import MedicineList from '../admin/medicines/medicine-list';

interface Medicine {
  medicineId: number;
  name: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  description: string;
  unitPrice: number;
  stockQuantity: number;
  prescriptionRequired: boolean;
  status: string;
  isArchived: boolean;
}

export const MedicineManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'medicines'>(
    'dashboard'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'archived'
  >('all');
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingMedicine, setDeletingMedicine] = useState<Medicine | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    genericName: '',
    brandName: '',
    strength: '',
    dosageForm: '',
    description: '',
    unitPrice: 0,
    stockQuantity: 0,
    prescriptionRequired: false
  });
  const [createForm, setCreateForm] = useState({
    name: '',
    genericName: '',
    brandName: '',
    strength: '',
    dosageForm: '',
    description: '',
    unitPrice: 0,
    stockQuantity: 0,
    prescriptionRequired: false
  });

  const queryClient = useQueryClient();

  const {
    data: medicinesData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['medicines-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicine')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Medicine[];
    }
  });

  // Create medicine mutation
  const createMedicineMutation = useMutation({
    mutationFn: async (
      newMedicine: Omit<Medicine, 'medicineId' | 'status' | 'isArchived'>
    ) => {
      const { data, error } = await supabase
        .from('medicine')
        .insert({
          ...newMedicine,
          status: 'active',
          isArchived: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Medicine created successfully!');
      queryClient.invalidateQueries({ queryKey: ['medicines-management'] });
      setIsCreateDialogOpen(false);
      setCreateForm({
        name: '',
        genericName: '',
        brandName: '',
        strength: '',
        dosageForm: '',
        description: '',
        unitPrice: 0,
        stockQuantity: 0,
        prescriptionRequired: false
      });
    },
    onError: (error: Error) => {
      toast.error(`Failed to create medicine: ${error.message}`);
    }
  });

  // Update medicine mutation
  const updateMedicineMutation = useMutation({
    mutationFn: async (updatedMedicine: Partial<Medicine>) => {
      const { data, error } = await supabase
        .from('medicine')
        .update(updatedMedicine)
        .eq('medicineId', editingMedicine?.medicineId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Medicine updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['medicines-management'] });
      setIsEditDialogOpen(false);
      setEditingMedicine(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update medicine: ${error.message}`);
    }
  });

  // Delete medicine mutation
  const deleteMedicineMutation = useMutation({
    mutationFn: async (medicineId: number) => {
      const { error } = await supabase
        .from('medicine')
        .delete()
        .eq('medicineId', medicineId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Medicine deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['medicines-management'] });
      setIsDeleteDialogOpen(false);
      setDeletingMedicine(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete medicine: ${error.message}`);
    }
  });

  const filteredMedicines = useMemo(() => {
    if (!medicinesData) return [];

    return medicinesData.filter(medicine => {
      // Status filter
      if (statusFilter === 'active' && medicine.isArchived) return false;
      if (statusFilter === 'archived' && !medicine.isArchived) return false;

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          medicine.name?.toLowerCase().includes(searchLower) ||
          medicine.genericName?.toLowerCase().includes(searchLower) ||
          medicine.brandName?.toLowerCase().includes(searchLower) ||
          medicine.description?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [medicinesData, searchTerm, statusFilter]);

  const formatCurrency = (amount: number): string => {
    return `₱${amount.toFixed(2)}`;
  };

  const getStatusBadge = (medicine: Medicine) => {
    if (medicine.isArchived) {
      return <Badge variant="secondary">Archived</Badge>;
    }

    if (medicine.stockQuantity <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }

    if (medicine.stockQuantity <= 10) {
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-600">
          Low Stock
        </Badge>
      );
    }

    return <Badge variant="default">In Stock</Badge>;
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 0) return 'text-red-600';
    if (quantity <= 10) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setEditForm({
      name: medicine.name,
      genericName: medicine.genericName || '',
      brandName: medicine.brandName || '',
      strength: medicine.strength || '',
      dosageForm: medicine.dosageForm || '',
      description: medicine.description || '',
      unitPrice: medicine.unitPrice,
      stockQuantity: medicine.stockQuantity,
      prescriptionRequired: medicine.prescriptionRequired
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (medicine: Medicine) => {
    setDeletingMedicine(medicine);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editingMedicine) return;

    updateMedicineMutation.mutate({
      name: editForm.name,
      genericName: editForm.genericName,
      brandName: editForm.brandName,
      strength: editForm.strength,
      dosageForm: editForm.dosageForm,
      description: editForm.description,
      unitPrice: editForm.unitPrice,
      stockQuantity: editForm.stockQuantity,
      prescriptionRequired: editForm.prescriptionRequired
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingMedicine) return;
    deleteMedicineMutation.mutate(deletingMedicine.medicineId);
  };

  const handleCreate = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateSubmit = () => {
    if (!createForm.name.trim() || createForm.unitPrice <= 0) {
      toast.error('Please fill in all required fields (Name and Price)');
      return;
    }

    createMedicineMutation.mutate({
      name: createForm.name,
      genericName: createForm.genericName,
      brandName: createForm.brandName,
      strength: createForm.strength,
      dosageForm: createForm.dosageForm,
      description: createForm.description,
      unitPrice: createForm.unitPrice,
      stockQuantity: createForm.stockQuantity,
      prescriptionRequired: createForm.prescriptionRequired
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
        <span className="ml-2 text-gray-600">Loading medicines...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Medicines
        </h3>
        <p className="text-gray-600 mb-4">
          There was a problem loading the medicines. Please try again.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Medicine Management
          </h2>
          <p className="text-gray-600">View and manage medicine inventory</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('medicines')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'medicines'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}>
            <List className="h-4 w-4 inline mr-2" />
            Medicine List
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' ? (
        <DetailedDashboard isSeniorCitizenDataOnly={true} />
      ) : (
        <div className="space-y-6">
          <MedicineList />
        </div>
      )}

      {/* Edit Medicine Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Medicine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Medicine Name *</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={e =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Enter medicine name"
                />
              </div>
              <div>
                <Label htmlFor="genericName">Generic Name</Label>
                <Input
                  id="genericName"
                  value={editForm.genericName}
                  onChange={e =>
                    setEditForm({ ...editForm, genericName: e.target.value })
                  }
                  placeholder="Enter generic name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brandName">Brand Name</Label>
                <Input
                  id="brandName"
                  value={editForm.brandName}
                  onChange={e =>
                    setEditForm({ ...editForm, brandName: e.target.value })
                  }
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <Label htmlFor="strength">Strength</Label>
                <Input
                  id="strength"
                  value={editForm.strength}
                  onChange={e =>
                    setEditForm({ ...editForm, strength: e.target.value })
                  }
                  placeholder="e.g., 500mg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dosageForm">Dosage Form</Label>
              <Input
                id="dosageForm"
                value={editForm.dosageForm}
                onChange={e =>
                  setEditForm({ ...editForm, dosageForm: e.target.value })
                }
                placeholder="e.g., Tablet, Capsule, Syrup"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={e =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="Enter medicine description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unitPrice">Unit Price (₱) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={editForm.unitPrice}
                  onChange={e =>
                    setEditForm({
                      ...editForm,
                      unitPrice: parseFloat(e.target.value) || 0
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={editForm.stockQuantity}
                  onChange={e =>
                    setEditForm({
                      ...editForm,
                      stockQuantity: parseInt(e.target.value) || 0
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="prescriptionRequired"
                checked={editForm.prescriptionRequired}
                onChange={e =>
                  setEditForm({
                    ...editForm,
                    prescriptionRequired: e.target.checked
                  })
                }
                className="rounded"
              />
              <Label htmlFor="prescriptionRequired">
                Prescription Required
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditSubmit}
              disabled={updateMedicineMutation.isPending}>
              {updateMedicineMutation.isPending
                ? 'Updating...'
                : 'Update Medicine'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Medicine</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingMedicine?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMedicineMutation.isPending}>
              {deleteMedicineMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Medicine Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-name">Medicine Name *</Label>
                <Input
                  id="create-name"
                  value={createForm.name}
                  onChange={e =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  placeholder="Enter medicine name"
                />
              </div>
              <div>
                <Label htmlFor="create-genericName">Generic Name</Label>
                <Input
                  id="create-genericName"
                  value={createForm.genericName}
                  onChange={e =>
                    setCreateForm({
                      ...createForm,
                      genericName: e.target.value
                    })
                  }
                  placeholder="Enter generic name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-brandName">Brand Name</Label>
                <Input
                  id="create-brandName"
                  value={createForm.brandName}
                  onChange={e =>
                    setCreateForm({ ...createForm, brandName: e.target.value })
                  }
                  placeholder="Enter brand name"
                />
              </div>
              <div>
                <Label htmlFor="create-strength">Strength</Label>
                <Input
                  id="create-strength"
                  value={createForm.strength}
                  onChange={e =>
                    setCreateForm({ ...createForm, strength: e.target.value })
                  }
                  placeholder="e.g., 500mg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="create-dosageForm">Dosage Form</Label>
              <Input
                id="create-dosageForm"
                value={createForm.dosageForm}
                onChange={e =>
                  setCreateForm({ ...createForm, dosageForm: e.target.value })
                }
                placeholder="e.g., Tablet, Capsule, Syrup"
              />
            </div>

            <div>
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={createForm.description}
                onChange={e =>
                  setCreateForm({ ...createForm, description: e.target.value })
                }
                placeholder="Enter medicine description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="create-unitPrice">Unit Price (₱) *</Label>
                <Input
                  id="create-unitPrice"
                  type="number"
                  step="0.01"
                  value={createForm.unitPrice}
                  onChange={e =>
                    setCreateForm({
                      ...createForm,
                      unitPrice: parseFloat(e.target.value) || 0
                    })
                  }
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="create-stockQuantity">Stock Quantity *</Label>
                <Input
                  id="create-stockQuantity"
                  type="number"
                  value={createForm.stockQuantity}
                  onChange={e =>
                    setCreateForm({
                      ...createForm,
                      stockQuantity: parseInt(e.target.value) || 0
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="create-prescriptionRequired"
                checked={createForm.prescriptionRequired}
                onChange={e =>
                  setCreateForm({
                    ...createForm,
                    prescriptionRequired: e.target.checked
                  })
                }
                className="rounded"
              />
              <Label htmlFor="create-prescriptionRequired">
                Prescription Required
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubmit}
              disabled={createMedicineMutation.isPending}
              className="bg-green-600 hover:bg-green-700">
              {createMedicineMutation.isPending
                ? 'Creating...'
                : 'Create Medicine'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
