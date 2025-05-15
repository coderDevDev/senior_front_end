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
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const TransactionReportPage = () => {
  const { data: transactionStats } = useQuery({
    queryKey: ['transaction-statistics'],
    queryFn: async () => {
      const today = new Date();
      const monthStart = startOfMonth(today);
      const monthEnd = endOfMonth(today);

      // Get orders with their items and senior citizen info
      const { data: orders } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items (*),
          senior_citizens!inner (
            firstName,
            lastName,
            email
          )
        `
        )
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      const stats = {
        totalTransactions: orders?.length || 0,
        totalAmount:
          orders?.reduce((acc, t) => acc + (Number(t.total_amount) || 0), 0) ||
          0,
        discountedAmount:
          orders?.reduce(
            (acc, t) => acc + (Number(t.discounted_amount) || 0),
            0
          ) || 0,
        averageDiscount:
          orders?.reduce(
            (acc, t) => acc + (Number(t.discount_percentage) || 0),
            0
          ) / (orders?.length || 1) || 0,
        dailyTransactions: getDailyTransactions(
          orders || [],
          monthStart,
          monthEnd
        )
      };

      return stats;
    }
  });

  const getDailyTransactions = (
    transactions: any[],
    start: Date,
    end: Date
  ) => {
    const days = eachDayOfInterval({ start, end });
    return days.map(day => ({
      date: format(day, 'MMM dd'),
      count: transactions.filter(
        t =>
          format(new Date(t.created_at), 'yyyy-MM-dd') ===
          format(day, 'yyyy-MM-dd')
      ).length,
      amount: transactions
        .filter(
          t =>
            format(new Date(t.created_at), 'yyyy-MM-dd') ===
            format(day, 'yyyy-MM-dd')
        )
        .reduce((acc, t) => acc + (Number(t.total_amount) || 0), 0)
    }));
  };

  const lineChartData = {
    labels: transactionStats?.dailyTransactions.map(t => t.date) || [],
    datasets: [
      {
        label: 'Daily Transactions',
        data: transactionStats?.dailyTransactions.map(t => t.count) || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4
      }
    ]
  };

  const barChartData = {
    labels: transactionStats?.dailyTransactions.map(t => t.date) || [],
    datasets: [
      {
        label: 'Daily Revenue',
        data: transactionStats?.dailyTransactions.map(t => t.amount) || [],
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactionStats?.totalTransactions}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{transactionStats?.totalAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Discounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{transactionStats?.discountedAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Discount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactionStats?.averageDiscount.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <Line options={chartOptions} data={lineChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar options={chartOptions} data={barChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionReportPage;
