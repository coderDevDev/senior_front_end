import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Clock,
  Pill,
  Stethoscope,
  Thermometer,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts';
import { StatCardProps } from './types';
import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';

const medicineAvailabilityData = [
  { month: 'Jan', pharmacy1: 80, pharmacy2: 90, pharmacy3: 75 },
  { month: 'Feb', pharmacy1: 85, pharmacy2: 88, pharmacy3: 78 },
  { month: 'Mar', pharmacy1: 82, pharmacy2: 92, pharmacy3: 80 },
  { month: 'Apr', pharmacy1: 88, pharmacy2: 95, pharmacy3: 82 },
  { month: 'May', pharmacy1: 90, pharmacy2: 91, pharmacy3: 85 },
  { month: 'Jun', pharmacy1: 92, pharmacy2: 93, pharmacy3: 88 }
];

const medicineTypeData = [
  { type: 'Pain Relief', prescriptions: 1200, otc: 3500 },
  { type: 'Heart Medication', prescriptions: 1800, otc: 800 },
  { type: 'Diabetes Medication', prescriptions: 1600, otc: 1200 },
  { type: 'Blood Pressure', prescriptions: 2000, otc: 1500 }
];

const pharmacyPopularityData = [
  { name: 'PharmaCare', value: 35 },
  { name: 'MediLife', value: 30 },
  { name: 'HealthRx', value: 25 },
  { name: 'WellPharm', value: 10 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const medicineChartConfig = {
  pharmacy1: {
    label: 'PharmaCare',
    color: 'hsl(var(--primary))'
  },
  pharmacy2: {
    label: 'MediLife',
    color: 'hsl(var(--secondary))'
  },
  pharmacy3: {
    label: 'HealthRx',
    color: 'hsl(var(--accent))'
  }
} satisfies ChartConfig;

const orderChartConfig = {
  totalOrders: {
    label: 'Total Orders',
    color: 'hsl(var(--primary))'
  }
} satisfies ChartConfig;

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
          status,
          transactions (count)
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
  const [timeRange, setTimeRange] = useState('6m');
  const { data: stats, isLoading } = useDashboardStats();

  console.log({ stats });
  const medicineAvailabilityData = useMemo(() => {
    if (!stats?.recentOrders) return [];

    // Group orders by month and calculate totals
    return stats.recentOrders.reduce((acc, order) => {
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
    }, [] as Array<{ month: string; totalOrders: number; totalAmount: number }>);
  }, [stats?.recentOrders]);

  const healthStatusData = useMemo(() => {
    if (!stats?.healthStatusDistribution) return [];

    return Object.entries(stats.healthStatusDistribution).map(
      ([status, count]) => ({
        name: status,
        value: count
      })
    );
  }, [stats?.healthStatusDistribution]);

  const pharmacyData = useMemo(() => {
    if (!stats?.pharmacies) return [];

    const totalTransactions = stats.pharmacies.reduce(
      (acc, pharmacy) => acc + (pharmacy.transactions?.length || 0),
      0
    );

    return stats.pharmacies.map(pharmacy => ({
      name: pharmacy.name,
      value: Math.round(
        ((pharmacy.transactions?.length || 0) / totalTransactions) * 100
      )
    }));
  }, [stats?.pharmacies]);

  const medicineProgress = useMemo(() => {
    if (!stats?.medicines) return [];

    return stats.medicines.map(medicine => ({
      label: medicine.brandName || medicine.genericName || medicine.name,
      progress: Math.min(Math.round((medicine.stockQuantity / 100) * 100), 100) // Assuming 100 is max stock
    }));
  }, [stats?.medicines]);

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 bg-background">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Senior Citizen Health Dashboard</h1>
        {/* <Select defaultValue={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select> */}
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
        {/* <StatCard
          icon={<Thermometer className="h-4 w-4" />}
          title="Recent Orders"
          value={stats?.recentOrders.length.toString() || '0'}
          trend={0}
        /> */}

        {/* CONNECT REFILL REMINDERS TO DATABASE */}
        {/* <StatCard
          icon={<Clock className="h-4 w-4" />}
          title="Refill Reminders"
          value="68"
          trend={-2.5}
        /> */}
      </div>

      {/* <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Orders Over Time</CardTitle>
            <CardDescription>Monthly order trends and totals</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={orderChartConfig}
              className="h-[300px] w-full px-4">
              <AreaChart data={medicineAvailabilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="totalOrders"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary)/.2)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Health Status Distribution</CardTitle>
            <CardDescription>
              Current health status of senior citizens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={healthStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value">
                  {healthStatusData.map((_, index) => (
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
        </Card>
      </div> */}

      <div className="grid gap-4 md:grid-cols-2">
        {/* <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Medicine Availability</CardTitle>
            <CardDescription>
              Percentage of medicines available at each pharmacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={medicineChartConfig} className="h-[300px]">
              <AreaChart
                data={medicineAvailabilityData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="pharmacy1"
                  stackId="1"
                  stroke={medicineChartConfig.pharmacy1.color}
                  fill={`${medicineChartConfig.pharmacy1.color}/.2`}
                />
                <Area
                  type="monotone"
                  dataKey="pharmacy2"
                  stackId="1"
                  stroke={medicineChartConfig.pharmacy2.color}
                  fill={`${medicineChartConfig.pharmacy2.color}/.2`}
                />
                <Area
                  type="monotone"
                  dataKey="pharmacy3"
                  stackId="1"
                  stroke={medicineChartConfig.pharmacy3.color}
                  fill={`${medicineChartConfig.pharmacy3.color}/.2`}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card> */}

        {/* <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Medicine Types</CardTitle>
            <CardDescription>
              Prescription vs Over-the-Counter Medicines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={medicineTypeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <ChartTooltip />
                <Bar
                  dataKey="prescriptions"
                  fill="#8884d8"
                  name="Prescription"
                />
                <Bar dataKey="otc" fill="#82ca9d" name="Over-the-Counter" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card> */}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="col-span-3 md:col-span-1">
          <CardHeader>
            <CardTitle>Pharmacy Popularity</CardTitle>
            <CardDescription>Based on transaction count</CardDescription>
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

        {/* <Card className="col-span-3 md:col-span-2">
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
        </Card> */}
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

function ProgressItem({
  label,
  progress
}: {
  label: string;
  progress: number;
}) {
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
