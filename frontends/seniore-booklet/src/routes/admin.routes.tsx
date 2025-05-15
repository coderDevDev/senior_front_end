import UserReportPage from '@/modules/admin/reports/users-report/user.report';
import UserFilterList from '@/modules/admin/reports/users-report/user-list-filter';

export const adminRoutes = [
  {
    path: '/admin/reports',
    children: [
      {
        path: 'users-report',
        element: <UserReportPage />,
        children: [
          {
            path: 'users-list',
            element: <UserFilterList />
          }
        ]
      }
      // ... other report routes
    ]
  }
];
