import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Pill,
  Search
} from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

const pharmacies = [
  {
    id: 1,
    name: 'PharmaCare',
    address: '123 Health St',
    phone: '555-0101',
    hours: '8AM - 10PM'
  },
  {
    id: 2,
    name: 'MediLife',
    address: '456 Wellness Ave',
    phone: '555-0202',
    hours: '24/7'
  },
  {
    id: 3,
    name: 'HealthRx',
    address: '789 Care Ln',
    phone: '555-0303',
    hours: '7AM - 9PM'
  },
  {
    id: 4,
    name: 'WellPharm',
    address: '321 Remedy Rd',
    phone: '555-0404',
    hours: '9AM - 8PM'
  }
];

const medicines = [
  {
    id: 1,
    name: 'Cardiocare',
    type: 'Heart',
    price: 45.99,
    stock: { PharmaCare: 50, MediLife: 75, HealthRx: 60, WellPharm: 40 }
  },
  {
    id: 2,
    name: 'GlucoBalance',
    type: 'Diabetes',
    price: 32.5,
    stock: { PharmaCare: 80, MediLife: 65, HealthRx: 70, WellPharm: 55 }
  },
  {
    id: 3,
    name: 'JointEase',
    type: 'Pain Relief',
    price: 28.75,
    stock: { PharmaCare: 100, MediLife: 90, HealthRx: 85, WellPharm: 70 }
  },
  {
    id: 4,
    name: 'PressureGuard',
    type: 'Blood Pressure',
    price: 39.99,
    stock: { PharmaCare: 60, MediLife: 80, HealthRx: 75, WellPharm: 50 }
  },
  {
    id: 5,
    name: 'MemoryBoost',
    type: 'Cognitive',
    price: 54.25,
    stock: { PharmaCare: 40, MediLife: 55, HealthRx: 50, WellPharm: 35 }
  }
];

const seniorData = [
  { age: '65-70', medicinesPerMonth: 3, averageCost: 120 },
  { age: '71-75', medicinesPerMonth: 4, averageCost: 160 },
  { age: '76-80', medicinesPerMonth: 5, averageCost: 200 },
  { age: '81-85', medicinesPerMonth: 6, averageCost: 240 },
  { age: '86+', medicinesPerMonth: 7, averageCost: 280 }
];

// First, add proper types
interface Pharmacy {
  pharmacy_id: number;
  name: string;
  address: string;
  phoneNumber: string;
  operatingHours: string;
  is24Hours: boolean;
  email: string;
  status: string;
}

interface DashboardData {
  pharmacies: Pharmacy[];
  medicines: any[]; // Add proper type later
  seniorData: any[]; // Add proper type later
}

interface PharmacyFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
}

const useDetailedDashboardData = () => {
  return useQuery<DashboardData>({
    queryKey: ['detailed-dashboard'],
    queryFn: async () => {
      // Get pharmacies data
      const { data: pharmacies, error: pharmacyError } = await supabase
        .from('pharmacy')
        .select('*')
        .order('name');

      console.log({ pharmacies });
      if (pharmacyError) {
        console.error('Pharmacy fetch error:', pharmacyError);
        throw pharmacyError;
      }

      if (!pharmacies) {
        console.log('No pharmacy data found');
        return {
          pharmacies: [],
          medicines: [],
          seniorData: []
        };
      }

      console.log('Fetched pharmacies:', pharmacies);

      // Get transactions count for each pharmacy
      const transactionCounts = await Promise.all(
        pharmacies.map(async pharmacy => {
          const { count } = await supabase
            .from('transactions')
            .select('*', { count: 'exact' })
            .eq('pharmacy_id', pharmacy.pharmacy_id);
          return { pharmacy_id: pharmacy.pharmacy_id, count: count || 0 };
        })
      );

      // Map pharmacy data with transaction counts
      const pharmaciesWithTransactions = pharmacies.map(pharmacy => ({
        id: pharmacy.pharmacy_id,
        name: pharmacy.name || '',
        address: pharmacy.address || '',
        phone: pharmacy.phoneNumber || '',
        hours: pharmacy.is24Hours ? '24/7' : pharmacy.operatingHours || '',
        email: pharmacy.email || '',
        status: pharmacy.status || 'inactive',
        transactionCount:
          transactionCounts.find(t => t.pharmacy_id === pharmacy.pharmacy_id)
            ?.count || 0
      }));

      // Get medicines with their stock info
      const { data: medicines, error: medicineError } = await supabase.from(
        'medicine'
      ).select(`
          medicineId,
          name,
          genericName,
          brandName,
          stockQuantity,
          unitPrice,
          prescriptionRequired,
          dosageForm
        `);

      if (medicineError) throw medicineError;

      // Get senior age group statistics
      const { data: seniors, error: seniorError } = await supabase
        .from('senior_citizens')
        .select('age, medical_records(count)');

      if (seniorError) throw seniorError;

      // Calculate age groups
      const ageGroups = seniors.reduce((acc, senior) => {
        const ageGroup = Math.floor(senior.age / 5) * 5;
        const groupKey = `${ageGroup}-${ageGroup + 4}`;

        if (!acc[groupKey]) {
          acc[groupKey] = {
            count: 0,
            medicalRecordsCount: 0
          };
        }

        acc[groupKey].count++;
        acc[groupKey].medicalRecordsCount +=
          senior.medical_records?.length || 0;

        return acc;
      }, {});

      const seniorData = Object.entries(ageGroups).map(([ageRange, data]) => ({
        age: ageRange,
        medicinesPerMonth: Math.round(data.medicalRecordsCount / data.count),
        averageCost: Math.round(data.medicalRecordsCount * 40) // Assuming average cost per medicine
      }));

      return {
        pharmacies: pharmaciesWithTransactions,
        medicines: medicines.map(medicine => ({
          id: medicine.medicineId,
          name: medicine.brandName || medicine.name,
          type: medicine.dosageForm,
          price: Number(medicine.unitPrice),
          stock: medicine.stockQuantity,
          prescriptionRequired: medicine.prescriptionRequired === 'yes'
        })),
        seniorData
      };
    }
  });
};

export default function DetailedDashboard() {
  const [selectedPharmacy, setSelectedPharmacy] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: dashboardData, isLoading, error } = useDetailedDashboardData();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PharmacyFilters>({
    search: '',
    status: 'all'
  });
  const itemsPerPage = 4;

  const filteredMedicines = useMemo(() => {
    if (!dashboardData?.medicines) return [];

    return dashboardData.medicines.filter(
      medicine =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dashboardData?.medicines, searchTerm]);

  const filteredPharmacies = useMemo(() => {
    if (!dashboardData?.pharmacies) return [];

    return dashboardData.pharmacies.filter(pharmacy => {
      const matchesSearch =
        pharmacy.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        pharmacy.address.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus =
        filters.status === 'all' || pharmacy.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [dashboardData?.pharmacies, filters]);

  const paginatedPharmacies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPharmacies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPharmacies, currentPage]);

  const totalPages = Math.ceil(filteredPharmacies.length / itemsPerPage);

  if (isLoading) {
    return <div>Loading detailed statistics...</div>;
  }

  if (error) {
    console.error('Dashboard error:', error);
    return <div>Error loading dashboard data</div>;
  }

  if (!dashboardData?.pharmacies?.length) {
    return <div>No pharmacy data available</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold">Detailed Medicine Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pharmacy Directory</CardTitle>
            <CardDescription>
              Contact information for local pharmacies
            </CardDescription>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex-1">
                <Input
                  placeholder="Search pharmacies..."
                  value={filters.search}
                  onChange={e =>
                    setFilters(prev => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full"
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              {/* <Select
                value={filters.status}
                onValueChange={(value: 'all' | 'active' | 'inactive') =>
                  setFilters(prev => ({ ...prev, status: value }))
                }>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select> */}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedPharmacies.map(pharmacy => (
                <div
                  key={pharmacy.id}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-muted">
                  <Pill className="w-6 h-6 mt-1 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{pharmacy.name}</h3>
                      <Badge
                        variant={
                          pharmacy.status === 'active' ? 'success' : 'secondary'
                        }>
                        {pharmacy.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <MapPin className="w-4 h-4 mr-1" /> {pharmacy.address}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Phone className="w-4 h-4 mr-1" /> {pharmacy.phone}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center mt-1">
                      <Clock className="w-4 h-4 mr-1" /> {pharmacy.hours}
                    </p>
                    {pharmacy.email && (
                      <p className="text-sm text-muted-foreground flex items-center mt-1">
                        <Mail className="w-4 h-4 mr-1" /> {pharmacy.email}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      Total Transactions: {pharmacy.transactionCount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}>
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage(p => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Senior Citizen Medicine Statistics</CardTitle>
            <CardDescription>
              Average medicine consumption and costs by age group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.seniorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="medicinesPerMonth"
                  fill="#8884d8"
                  name="Medicines per Month"
                />
                <Bar
                  yAxisId="right"
                  dataKey="averageCost"
                  fill="#82ca9d"
                  name="Average Cost ($)"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Medicine Inventory</CardTitle>
          <CardDescription>
            Comprehensive list of available medicines and their stock levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search medicines..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select
              value={selectedPharmacy}
              onValueChange={setSelectedPharmacy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select pharmacy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Pharmacies</SelectItem>
                {dashboardData.pharmacies.map(pharmacy => (
                  <SelectItem key={pharmacy.id} value={pharmacy.name}>
                    {pharmacy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                {selectedPharmacy === 'All' ? (
                  dashboardData.pharmacies.map(pharmacy => (
                    <TableHead key={pharmacy.id}>
                      {pharmacy.name} Stock
                    </TableHead>
                  ))
                ) : (
                  <TableHead>Stock</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicines.map(medicine => (
                <TableRow key={medicine.id}>
                  <TableCell>{medicine.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{medicine.type}</Badge>
                  </TableCell>
                  <TableCell>${medicine.price.toFixed(2)}</TableCell>
                  {/* {selectedPharmacy === "All" ? (
                     
                    pharmacies.map((pharmacy: Partial<PharmacyFormValues>) => (
                      <TableCell key={pharmacy.phoneNumber}>
                        {medicine.stock[pharmacy.name]}
                      </TableCell>
                    ))
                  ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    <TableCell>{medicine.stock[selectedPharmacy] as any}</TableCell>
                  )} */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Upcoming Medicine Restocks</CardTitle>
          <CardDescription>
            Schedule of medicine restocks for the next 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Pharmacy</TableHead>
                <TableHead>Medicine</TableHead>
                <TableHead>Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    June 15, 2023
                  </div>
                </TableCell>
                <TableCell>PharmaCare</TableCell>
                <TableCell>Cardiocare</TableCell>
                <TableCell>100</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    June 16, 2023
                  </div>
                </TableCell>
                <TableCell>MediLife</TableCell>
                <TableCell>GlucoBalance</TableCell>
                <TableCell>150</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    June 18, 2023
                  </div>
                </TableCell>
                <TableCell>HealthRx</TableCell>
                <TableCell>JointEase</TableCell>
                <TableCell>200</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    June 20, 2023
                  </div>
                </TableCell>
                <TableCell>WellPharm</TableCell>
                <TableCell>PressureGuard</TableCell>
                <TableCell>120</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}
    </div>
  );
}
