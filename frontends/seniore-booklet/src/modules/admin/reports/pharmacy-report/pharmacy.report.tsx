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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const PharmacyReportPage = () => {
  const { data: pharmacyStats } = useQuery({
    queryKey: ['pharmacy-statistics'],
    queryFn: async () => {
      // Get pharmacies and their medicines
      const { data: pharmacies } = await supabase.from('pharmacy').select(`
          *,
          medicine (
            *
          )
        `);

      const stats = {
        total: pharmacies?.length || 0,
        activePharmacies:
          pharmacies?.filter(p => p.status === 'active').length || 0,
        totalMedicines:
          pharmacies?.reduce(
            (acc, pharmacy) => acc + (pharmacy.medicine?.length || 0),
            0
          ) || 0,
        is24Hours: pharmacies?.filter(p => p.is24Hours).length || 0,
        medicinesByPharmacy:
          pharmacies?.map(p => ({
            name: p.name,
            count: p.medicine?.length || 0
          })) || []
      };

      return stats;
    }
  });

  const barChartData = {
    labels: pharmacyStats?.medicinesByPharmacy.map(p => p.name) || [],
    datasets: [
      {
        label: 'Number of Medicines',
        data: pharmacyStats?.medicinesByPharmacy.map(p => p.count) || [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const pieChartData = {
    labels: ['24/7 Pharmacies', 'Regular Hours'],
    datasets: [
      {
        data: [
          pharmacyStats?.is24Hours || 0,
          (pharmacyStats?.total || 0) - (pharmacyStats?.is24Hours || 0)
        ],
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Medicines per Pharmacy'
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Operating Hours Distribution'
      }
    }
  };

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Pharmacies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pharmacyStats?.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Pharmacies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pharmacyStats?.activePharmacies}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Medicines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pharmacyStats?.totalMedicines}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              24/7 Pharmacies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pharmacyStats?.is24Hours}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Medicines Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar options={barChartOptions} data={barChartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <Pie options={pieChartOptions} data={pieChartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PharmacyReportPage;
