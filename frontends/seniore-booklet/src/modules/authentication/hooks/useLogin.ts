/* eslint-disable @typescript-eslint/no-explicit-any */
import { Q_KEYS } from '@/shared/qkeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import authService from '../service/auth.service';

export default function useLogin() {
  const queryClient = useQueryClient();

  const navigate = useNavigate();

  const { mutate: loginUser, isPending } = useMutation({
    mutationFn: ({ email, password }: any) => {
      try {
        const userData = authService.loginHandler({ email, password });

        return userData;
      } catch (err: any) {
        // Handle specific credential errors here
        const errorMessage = err?.message || String(err);

        // Check for common authentication error patterns
        if (
          errorMessage.includes('Invalid login credentials') ||
          errorMessage.includes('Invalid email or password') ||
          errorMessage.includes('auth/invalid-credential') ||
          errorMessage.includes('password') ||
          errorMessage.toLowerCase().includes('credentials')
        ) {
          throw new Error('Invalid email or password. Please try again.');
        }

        // If rate limited
        if (
          errorMessage.includes('Too many requests') ||
          errorMessage.includes('rate limit')
        ) {
          throw new Error('Too many login attempts. Please try again later.');
        }

        // For other errors, pass through the message
        throw new Error(errorMessage);
      }
    },

    onSuccess: user => {
      // Clear previous errors

      // Save user data

      console.log({ user });
      queryClient.setQueryData([Q_KEYS.CURRENT_USER], user);

      // Handle role-based navigation
      if (user?.user_metadata.userRole === 'admin') {
        navigate('/dashboard-app', { replace: true });
      } else if (user?.user_metadata.userRole === 'senior_citizen') {
        navigate('/senior-app', { replace: true });
      } else if (user?.user_metadata.userRole === 'cashier') {
        navigate('/cashier-app', { replace: true });
      } else {
        // Handle unknown roles
        navigate('/', { replace: true });
      }

      toast.success(
        `You successfully logged in as ${user?.user_metadata.userRole}`
      );
    },
    onError: (error: Error) => {
      // Set user-friendly error message for display in UI
      const errorMessage = error?.message || 'Login failed. Please try again.';

      // Show toast notification
      toast.error(errorMessage);

      // Log for debugging (consider removing in production)
      console.error('Login error:', error);
    }
  });

  return { loginUser, isPending };
}
