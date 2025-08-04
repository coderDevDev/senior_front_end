import UpdateSeniorForm from '@/modules/senior-citizens/update-form.page';
import { MedicalHistoryView } from '@/modules/senior-citizens/medical-history/medical-history-list';

// ... other imports ...

const routes = [
  {
    path: '/dashboard-app',
    element: <div>Dashboard Layout Placeholder</div>,
    children: [
      // ... other routes ...
      {
        path: 'senior-citizen/update_form/:id',
        element: <UpdateSeniorForm />
      },
      {
        path: 'senior-citizen/medical_history/:id',
        element: <MedicalHistoryView />
      }
    ]
  }
];
