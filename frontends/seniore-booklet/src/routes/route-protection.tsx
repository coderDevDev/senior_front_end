import { Navigate, Outlet } from 'react-router-dom';
import useCurrentUser from '@/modules/authentication/hooks/useCurrentUser';
import { Spinner } from '@/components/spinner';

function ProtectedRoute({
  allowedRole,
  children
}: {
  allowedRole: 'admin' | 'senior_citizen' | 'cashier';
  children?: React.ReactNode;
}) {
  const { user, isLoading } = useCurrentUser();

  console.log('Protected Route:', {
    user,
    userRole: user?.user_metadata?.role,
    allowedRole,
    isLoading
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user.user_metadata?.role;

  if (!userRole || userRole !== allowedRole) {
    console.log('Unauthorized access:', { userRole, allowedRole });
    // Redirect to appropriate page based on actual role
    if (userRole === 'admin') return <Navigate to="/dashboard-app" replace />;
    if (userRole === 'senior_citizen')
      return <Navigate to="/senior-app" replace />;
    if (userRole === 'cashier') return <Navigate to="/cashier-app" replace />;
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export function AdminRoute() {
  return <ProtectedRoute allowedRole="admin" />;
}

export function SeniorRoute() {
  return <ProtectedRoute allowedRole="senior_citizen" />;
}

export function CashierRoute() {
  return <ProtectedRoute allowedRole="cashier" />;
}
