import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { ChartTooltip } from '@/components/ui/chart';
import { Pill, Stethoscope, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { StatCardProps } from './types';
import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Get total seniors count
      const { data: seniors, error: seniorsError } = await supabase
        .from('senior_citizens')
        .select('*');
      // .eq('is_archived', false);

      console.log({ seniors });
      if (seniorsError) throw seniorsError;

      // Get total medical records
      const { data: medicalRecords, error: medicalError } = await supabase
        .from('medical_records')
        .select('id, date, diagnosis')
        .order('date', { ascending: false })
        .limit(30); // Last 30 days

      console.log({ medicalRecords });
      if (medicalError) throw medicalError;

      // Get medicine orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(
          `
          id,
          total_amount,
          created_at,
          order_items (
            quantity,
            medicine_id
          )
        `
        )
        .order('created_at', { ascending: false })
        .limit(30);

      if (ordersError) throw ordersError;

      // Get pharmacy data with transaction counts
      const { data: pharmacies, error: pharmacyError } = await supabase.from(
        'pharmacy'
      ).select(`
          pharmacy_id,
          name,
          status
        `);

      if (pharmacyError) throw pharmacyError;

      // Get medicine refill progress
      const { data: medicines, error: medicineError } = await supabase
        .from('medicine')
        .select(
          `
          medicineId,
          name,
          stockQuantity,
          genericName,
          brandName
        `
        )
        .order('stockQuantity', { ascending: true })
        .limit(4);

      if (medicineError) throw medicineError;

      return {
        totalSeniors: seniors.length,
        healthStatusDistribution: seniors.reduce((acc, senior) => {
          acc[senior.healthStatus] = (acc[senior.healthStatus] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentMedicalRecords: medicalRecords,
        recentOrders: orders,
        pharmacies,
        medicines
      };
    }
  });
};

export default function BookletDashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  console.log({ stats });

  const pharmacyData = useMemo(() => {
    if (!stats?.pharmacies) return [];

    const totalPharmacies = stats.pharmacies.length;

    return stats.pharmacies.map(pharmacy => ({
      name: pharmacy.name,
      value: Math.round((1 / totalPharmacies) * 100)
    }));
  }, [stats?.pharmacies]);

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 bg-background">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Senior Citizen Health Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Pill className="h-4 w-4" />}
          title="Total Seniors"
          value={stats?.totalSeniors.toString() || '0'}
          trend={0}
        />
        <StatCard
          icon={<Stethoscope className="h-4 w-4" />}
          title="Medical Records"
          value={stats?.recentMedicalRecords.length.toString() || '0'}
          trend={0}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-3 md:col-span-1">
          <CardHeader>
            <CardTitle>Pharmacy Distribution</CardTitle>
            <CardDescription>
              Equal distribution across pharmacies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pharmacyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value">
                  {pharmacyData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <ChartTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-1">
              {pharmacyData.map((item, index) => (
                <div key={item.name} className="flex items-center">
                  <div
                    className="w-2 h-2 mr-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <div className="flex-1 text-sm">{item.name}</div>
                  <div className="text-sm font-medium">{item.value}%</div>
                </div>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

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
