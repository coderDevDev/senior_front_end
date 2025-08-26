import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import '@/components/ui/select';
import '@/components/ui/table';
import { Clock, MapPin, Mail, Phone, Pill } from 'lucide-react';
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import useCurrentUser from '@/modules/authentication/hooks/useCurrentUser';
import {
  TrendingUp,
  TrendingDown,
  Stethoscope,
  Thermometer
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Area, AreaChart } from 'recharts';

// Updated interfaces to match actual data structure

interface ProcessedPharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  hours: string;
  email: string;
  status: string;
  transactionCount: number;
}

interface Medicine {
  id: string;
  name: string;
  type: string;
  price: number;
  stock: number;
  prescriptionRequired: boolean;
}

interface SeniorData {
  age: string;
  medicinesPerMonth: number;
  averageCost: number;
}

interface DashboardData {
  pharmacies: ProcessedPharmacy[];
  medicines: Medicine[];
  seniorData: SeniorData[];
}

interface PharmacyFilters {
  search: string;
  status: 'all' | 'active' | 'inactive';
}

interface AgeGroupData {
  count: number;
  medicalRecordsCount: number;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend?: number;
}

interface ProgressItemProps {
  label: string;
  progress: number;
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
      const pharmaciesWithTransactions: ProcessedPharmacy[] = pharmacies.map(
        pharmacy => ({
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
        })
      );

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
      const ageGroups: Record<string, AgeGroupData> = seniors.reduce(
        (acc, senior) => {
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
        },
        {} as Record<string, AgeGroupData>
      );

      const seniorData: SeniorData[] = Object.entries(ageGroups).map(
        ([ageRange, data]) => ({
          age: ageRange,
          medicinesPerMonth: Math.round(data.medicalRecordsCount / data.count),
          averageCost: Math.round(data.medicalRecordsCount * 40) // Assuming average cost per medicine
        })
      );

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

// StatCard and ProgressItem components from overview-dash.tsx
function StatCard({ icon, title, value, trend = 0 }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p
          className={`text-xs ${
            trend >= 0 ? 'text-green-500' : 'text-red-500'
          } flex items-center`}>
          {trend >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          {Math.abs(trend)}% from last
        </p>
      </CardContent>
    </Card>
  );
}

function ProgressItem({ label, progress }: ProgressItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{progress}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  );
}

export default function DetailedDashboard({ isSeniorCitizenDataOnly = false }) {
  const { data: dashboardData, isLoading, error } = useDetailedDashboardData();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<PharmacyFilters>({
    search: '',
    status: 'all'
  });
  const itemsPerPage = 4;
  const { user } = useCurrentUser();
  const userRole = user?.user_metadata?.role;

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

  // Dashboard stats for cashier widgets (copied from overview-dash.tsx)
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats-cashier'],
    queryFn: async () => {
      // Get total seniors count
      const { data: seniors, error: seniorsError } = await supabase
        .from('senior_citizens')
        .select('*');
      if (seniorsError) throw seniorsError;
      // Get total medical records
      const { data: medicalRecords, error: medicalError } = await supabase
        .from('medical_records')
        .select('id, date, diagnosis')
        .order('date', { ascending: false })
        .limit(30);
      if (medicalError) throw medicalError;
      // Get medicine orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(
          `id, total_amount, created_at, order_items (quantity, medicine_id)`
        )
        .order('created_at', { ascending: false })
        .limit(30);
      if (ordersError) throw ordersError;
      // Get medicine refill progress
      const { data: medicines, error: medicineError } = await supabase
        .from('medicine')
        .select(`medicineId, name, stockQuantity, genericName, brandName`)
        .order('stockQuantity', { ascending: true })
        .limit(4);
      if (medicineError) throw medicineError;
      return {
        totalSeniors: seniors.length,
        recentMedicalRecords: medicalRecords,
        recentOrders: orders,
        medicines
      };
    }
  });

  // Memoized data for widgets
  const medicineProgress = useMemo(() => {
    if (!stats?.medicines) return [];
    return stats.medicines.map(medicine => ({
      label: medicine.brandName || medicine.genericName || medicine.name,
      progress: Math.min(Math.round((medicine.stockQuantity / 100) * 100), 100)
    }));
  }, [stats?.medicines]);

  const ordersOverTime = useMemo(() => {
    if (!stats?.recentOrders) return [];
    return stats.recentOrders.reduce(
      (
        acc: Array<{ month: string; totalOrders: number; totalAmount: number }>,
        order
      ) => {
        const month = new Date(order.created_at).toLocaleString('default', {
          month: 'short'
        });
        const existingMonth = acc.find(m => m.month === month);
        if (existingMonth) {
          existingMonth.totalOrders += 1;
          existingMonth.totalAmount += Number(order.total_amount);
        } else {
          acc.push({
            month,
            totalOrders: 1,
            totalAmount: Number(order.total_amount)
          });
        }
        return acc;
      },
      []
    );
  }, [stats?.recentOrders]);

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
      {/* Cashier dashboard widgets */}
      {userRole === 'admin' ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Pill className="h-4 w-4" />}
              title="Total Seniors"
              value={stats?.totalSeniors?.toString() || '0'}
              trend={0}
            />
            <StatCard
              icon={<Stethoscope className="h-4 w-4" />}
              title="Medical Records"
              value={stats?.recentMedicalRecords?.length?.toString() || '0'}
              trend={0}
            />
            <StatCard
              icon={<Thermometer className="h-4 w-4" />}
              title="Recent Orders"
              value={stats?.recentOrders?.length?.toString() || '0'}
              trend={0}
            />
            <StatCard
              icon={<Clock className="h-4 w-4" />}
              title="Refill Reminders"
              value={
                stats?.medicines
                  ?.filter(m => m.stockQuantity <= 10)
                  .length?.toString() || '0'
              }
              trend={-2.5}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Orders Over Time</CardTitle>
                <CardDescription>
                  Monthly order trends and totals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={ordersOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="totalOrders"
                      stroke="#8884d8"
                      fill="#8884d8"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-2 md:col-span-1">
              <CardHeader>
                <CardTitle>Medicine Stock Levels</CardTitle>
                <CardDescription>
                  Current stock levels of critical medicines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicineProgress.map(item => (
                    <ProgressItem
                      key={item.label}
                      label={item.label}
                      progress={item.progress}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}

      {/* Debug log */}
      {(() => {
        console.log({ dashboardData });
        return null;
      })()}

      {isSeniorCitizenDataOnly ? (
        <div>
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
                    name="Average Cost (₱)"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
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
                        setFilters(prev => ({
                          ...prev,
                          search: e.target.value
                        }))
                      }
                      className="w-full"
                    />
                  </div>
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
                            onClick={() =>
                              setCurrentPage(p => Math.max(1, p - 1))
                            }
                          />
                        </PaginationItem>
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map(page => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              onClick={() => setCurrentPage(page)}
                              isActive={currentPage === page}>
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setCurrentPage(p => Math.min(totalPages, p + 1))
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </CardContent>
            </Card>

            {isSeniorCitizenDataOnly && (
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
                      <YAxis
                        yAxisId="left"
                        orientation="left"
                        stroke="#8884d8"
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#82ca9d"
                      />
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
            )}
          </div>
        </div>
      )}
    </div>
  );
}
