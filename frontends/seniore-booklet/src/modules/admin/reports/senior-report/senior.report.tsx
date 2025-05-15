import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import supabase from '@/shared/supabase';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { format, differenceInYears } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SeniorReportPage = () => {
  const { data: seniorStats } = useQuery({
    queryKey: ['senior-statistics'],
    queryFn: async () => {
      const { data: seniors } = await supabase.from('senior_citizens').select(`
          *,
          orders (
            *
          )
        `);

      const stats = {
        totalSeniors: seniors?.length || 0,
        activeSeniors: seniors?.filter(s => s.isActive).length || 0,
        verifiedSeniors: seniors?.filter(s => s.isEmailVerified).length || 0,
        ageGroups: getAgeGroups(seniors || []),
        transactionsByMonth: getTransactionsByMonth(seniors || [])
      };

      return stats;
    }
  });

  const getAgeGroups = (seniors: any[]) => {
    const groups = {
      '60-65': 0,
      '66-70': 0,
      '71-75': 0,
      '76+': 0
    };

    seniors.forEach(senior => {
      const age =
        senior.age || differenceInYears(new Date(), new Date(senior.birthdate));
      if (age >= 60 && age <= 65) groups['60-65']++;
      else if (age <= 70) groups['66-70']++;
      else if (age <= 75) groups['71-75']++;
      else groups['76+']++;
    });

    return groups;
  };

  const getTransactionsByMonth = (seniors: any[]) => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return format(date, 'MMM yyyy');
    }).reverse();

    return {
      labels: months,
      data: months.map(month => {
        return seniors.reduce((acc, senior) => {
          const seniorTransactions = senior.orders?.filter(
            (order: any) =>
              format(new Date(order.created_at), 'MMM yyyy') === month
          ).length;
          return acc + (seniorTransactions || 0);
        }, 0);
      })
    };
  };

  const ageChartData = {
    labels: Object.keys(seniorStats?.ageGroups || {}),
    datasets: [
      {
        data: Object.values(seniorStats?.ageGroups || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const transactionChartData = {
    labels: seniorStats?.transactionsByMonth.labels || [],
    datasets: [
      {
        label: 'Monthly Transactions',
        data: seniorStats?.transactionsByMonth.data || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      }
    }
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Senior Citizens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seniorStats?.totalSeniors}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Seniors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seniorStats?.activeSeniors}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Seniors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {seniorStats?.verifiedSeniors}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie options={chartOptions} data={ageChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar options={chartOptions} data={transactionChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SeniorReportPage;
