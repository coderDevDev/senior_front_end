import UpdateSeniorForm from '@/modules/senior-citizens/update-form.page';

// ... other imports ...

const routes = [
  {
    path: '/dashboard-app',
    element: <DashboardLayout />,
    children: [
      // ... other routes ...
      {
        path: 'senior-citizen/update_form/:id',
        element: <UpdateSeniorForm />
      },
      {
        path: 'senior-citizen/medical_history/:id',
        element: <MedicalHistoryView /> // You'll need to create this component too
      }
    ]
  }
];
