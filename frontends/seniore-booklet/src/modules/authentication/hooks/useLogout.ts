import supabase from '@/shared/supabase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface UseLogoutOptions {
  /**
   * Redirect path after successful logout
   * @default '/login'
   */
  redirectTo?: string;
  
  /**
   * Whether to sign out from all sessions (global) or just the current session (local)
   * @default 'global'
   */
  scope?: 'global' | 'local';
  
  /**
   * Additional cleanup callback to run on successful logout
   */
  onLogoutSuccess?: () => void;
}

/**
 * Custom hook for handling user logout with Supabase, React Query, and React Router
 */
export function useLogout(options: UseLogoutOptions = {}) {
  const {
    redirectTo = '/login',
    scope = 'global',
    onLogoutSuccess,
  } = options;
  
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Create a mutation for handling the logout process
  const logoutMutation = useMutation({
    mutationFn: async () => {
      // Sign out with Supabase - either globally or locally based on the scope option
      const { error } = await supabase.auth.signOut(
        scope === 'local' ? { scope: 'local' } : undefined
      );
      
      if (error) {
        throw new Error(error.message);
      }
      
      return true;
    },
    onSuccess: () => {
      // Clear any additional local storage or app state
      localStorage.removeItem("userPreferences");
      sessionStorage.clear();
      
      // Invalidate and reset all queries in React Query
      queryClient.clear();
      
      // Show success toast notification
      toast.success("Successfully logged out");
      
      // Run additional cleanup if provided
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
      
      // Redirect to the login page (or specified path)
      navigate(redirectTo);
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast.error(`Failed to logout: ${error.message}`);
    },
    onSettled: () => {
      // Always close the confirmation dialog when done
      setShowConfirmDialog(false);
    }
  });
  
  // Function to initiate the logout process
  const handleLogout = () => {
    setShowConfirmDialog(true);
  };
  
  // Function to confirm and execute the logout
  const confirmLogout = () => {
    logoutMutation.mutate();
  };
  
  // Function to cancel the logout process
  const cancelLogout = () => {
    setShowConfirmDialog(false);
  };
  
  return {
    /** Start the logout process (shows confirmation dialog) */
    logout: handleLogout,
    
    /** Execute the actual logout after confirmation */
    confirmLogout,
    
    /** Cancel the logout process */
    cancelLogout,
    
    /** Whether the confirmation dialog should be shown */
    showConfirmDialog,
    
    /** Whether logout is in progress */
    isLoggingOut: logoutMutation.isPending,
    
    /** Any logout error that occurred */
    error: logoutMutation.error
  };
}
