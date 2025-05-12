import AdminLayout from '@/layouts/admin.layout';
import PageLayout from '@/layouts/page.layout';
import SeniorCitizenLayout from '@/layouts/senior-citizen.layout';
import DashboardPage from '@/modules/admin/dashboard/dashboard.page';
import DetailedDashboard from '@/modules/admin/dashboard/detailed.dashboard';
import OverviewDashboard from '@/modules/admin/dashboard/overview-dash';
import MedicineArchiveList from '@/modules/admin/medicines/components/medicine-archive-list';
import MedicineList from '@/modules/admin/medicines/medicine-list';
import MedicinePage from '@/modules/admin/medicines/medicine.page';
// import PharmacyArchiveList from "@/modules/admin/pharmacy/components/pharmacy-archive-list";
import PharmacyList from '@/modules/admin/pharmacy/pharmacy-list';
import PharmacyPage from '@/modules/admin/pharmacy/pharmacy.page';
import MedicineReportPage from '@/modules/admin/reports/medicines-report/medicine.report';
// import UserArchiveList from "@/modules/admin/users/components/user-archive-list";
import UsersList from '@/modules/admin/users/user-list';
import UserPage from '@/modules/admin/users/users.page';
import VerificationPage from '@/modules/authentication/fingerprint.reg';
import ForgotPasswordPage from '@/modules/authentication/forgot-password.page';
import LoginPage from '@/modules/authentication/login.page';
import RegisterPage from '@/modules/authentication/register.page';
import ResetPasswordPage from '@/modules/authentication/reset-password.page';
import { CashierAppPage } from '@/modules/cashier-app/cashier-app.page';
import GeneralError from '@/modules/errors/general-error.page';
import NotFoundError from '@/modules/errors/not-found.page';
import { CheckoutPage } from '@/modules/senior-app/checkout/checkout.page';
import { SeniorCitizenPage } from '@/modules/senior-app/senior-app.page';
import ProfileInformation from '@/modules/senior-citizens/profiles/profile-information';
import ProfilePage from '@/modules/senior-citizens/profiles/profiles.page';
import SeniorCitizenList from '@/modules/senior-citizens/senior-citizen-list';
import SeniorCitizenPageList from '@/modules/senior-citizens/senior-citizen.page';
import TransactionHistoryList from '@/modules/senior-citizens/transaction-history/transaction-history';
import TransactionHistoryPage from '@/modules/senior-citizens/transaction-history/transaction-history.page';
import BrandNamePage from '@/modules/settings/brand-name/brand-name.page';
import FingerPrintApp from '@/modules/settings/fingerprint.page';
import GenericNamePage from '@/modules/settings/generic-name/generic-name.page';
import SettingsPage from '@/modules/settings/settings.page';
import { createBrowserRouter } from 'react-router-dom';
import { AdminRoute, SeniorRoute, CashierRoute } from './route-protection';

export const router = createBrowserRouter([
  {
    path: '',
    Component: PageLayout,
    children: [
      {
        index: true,
        Component: LoginPage
      },
      {
        path: '/login',
        Component: LoginPage
      },
      {
        path: '/register',
        Component: RegisterPage
      },
      {
        path: '/forgot-password',
        Component: ForgotPasswordPage
      },
      {
        path: '/reset-password',
        Component: ResetPasswordPage
      },

      {
        path: '/verify',
        Component: VerificationPage
      }
    ]
  },
  {
    path: '/dashboard-app',
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            index: true,
            Component: DashboardPage
          },
          {
            path: '',
            Component: DashboardPage,
            children: [
              {
                index: true,
                Component: OverviewDashboard
              },
              {
                path: 'overview',
                Component: OverviewDashboard
              },
              {
                path: 'detailed',
                Component: DetailedDashboard
              }
            ]
          },
          {
            path: 'users',
            Component: UserPage,
            children: [
              {
                index: true,
                Component: UsersList
              },
              {
                path: 'users-list',
                Component: UsersList
              }
              // {
              //   path: "archives",
              //   Component: UserArchiveList
              // }
            ]
          },
          {
            path: 'senior-citizen',
            Component: SeniorCitizenPageList,
            children: [
              {
                index: true,
                Component: SeniorCitizenList
              },
              {
                path: 'senior-citizen',
                Component: SeniorCitizenList
              }
            ]
          },
          {
            path: 'pharmacy',
            Component: PharmacyPage,
            children: [
              {
                index: true,
                Component: PharmacyList
              },
              {
                path: 'pharmacy-list',
                Component: PharmacyList
              }
              // {
              //   path: "archives",
              //   Component: PharmacyArchiveList
              // }
            ]
          },
          {
            path: 'medicines',
            Component: MedicinePage,
            children: [
              {
                index: true,
                Component: MedicineList
              },
              {
                path: 'medicines-list',
                Component: MedicineList
              },
              {
                path: 'archives',
                Component: MedicineArchiveList
              }
            ]
          },
          {
            path: 'medicine-report',
            Component: MedicineReportPage,
            children: [
              {
                index: true,
                Component: MedicineList
              },
              {
                path: 'medicines-list',
                Component: MedicineList
              }
            ]
          },
          {
            path: 'transaction',
            Component: TransactionHistoryPage,
            children: [
              {
                index: true,
                Component: TransactionHistoryList
              }
            ]
          },
          {
            path: 'settings',
            Component: SettingsPage,
            children: [
              {
                index: true,
                Component: BrandNamePage
              },
              {
                path: 'brand-name',
                Component: BrandNamePage
              },
              {
                path: 'generic-name',
                Component: GenericNamePage
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/senior-app',
    element: <SeniorRoute />,
    children: [
      {
        element: <SeniorCitizenLayout />,
        children: [
          {
            index: true,
            Component: SeniorCitizenPage
          },
          {
            path: 'home',
            Component: SeniorCitizenPage
          },
          {
            path: 'my-profile',
            Component: ProfilePage,
            children: [
              {
                index: true,
                Component: ProfileInformation
              }
            ]
          },
          {
            path: 'checkout',
            Component: CheckoutPage
          }
        ]
      }
    ]
  },
  {
    path: '/cashier-app',
    element: <CashierRoute />,
    children: [
      {
        element: <SeniorCitizenLayout />,
        children: [
          {
            index: true,
            Component: CashierAppPage
          },
          {
            path: 'home',
            Component: CashierAppPage
          },
          {
            path: 'my-profile',
            Component: ProfilePage,
            children: [
              {
                index: true,
                Component: ProfileInformation
              }
            ]
          },
          {
            path: 'checkout',
            Component: CheckoutPage
          }
        ]
      }
    ]
  },
  {
    path: '/fingerprint',
    Component: FingerPrintApp
  },
  {
    path: '*',
    Component: NotFoundError
  },
  { path: '/500', Component: GeneralError }
]);

export default router;
