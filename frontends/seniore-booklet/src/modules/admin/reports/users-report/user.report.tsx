import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/sr-tabs';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
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
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const UserReportPage = () => {
  const location = useLocation();
  const currentTab = location.pathname.split('/').pop();

  const { data: userStats } = useQuery({
    queryKey: ['user-statistics'],
    queryFn: async () => {
      const { data: users } = await supabase.from('sb_users').select('*');

      const stats = {
        total: users?.length || 0,
        byRole: {
          admin: users?.filter(u => u.userRole === 'admin').length || 0,
          staff: users?.filter(u => u.userRole === 'staff').length || 0,
          cashier: users?.filter(u => u.userRole === 'cashier').length || 0
        },
        activeUsers: users?.filter(u => u.isVerified).length || 0,
        unverifiedUsers: users?.filter(u => !u.isVerified).length || 0
      };

      return stats;
    }
  });

  const chartData = {
    labels: ['Admin', 'Staff', 'Cashier'],
    datasets: [
      {
        label: 'Users by Role',
        data: [
          userStats?.byRole.admin || 0,
          userStats?.byRole.staff || 0,
          userStats?.byRole.cashier || 0
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)'
        ]
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'User Distribution by Role'
      }
    }
  };

  // If we're at the base users-report path, redirect to users-list
  // if (currentTab === 'users-report') {
  //   return <Navigate to="users-list" replace />;
  // }

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unverified Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStats?.unverifiedUsers}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>User Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar options={chartOptions} data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserReportPage;
