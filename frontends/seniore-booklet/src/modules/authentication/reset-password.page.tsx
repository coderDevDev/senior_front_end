import SiteHeader from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import supabase from '@/shared/supabase';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import bcrypt from 'bcryptjs';

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

const ResetPasswordPage = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<ResetPasswordFormValues>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const hasProcessedTokens = useRef(false);

  useEffect(() => {
    const checkTokenAndErrors = async () => {
      // Prevent processing tokens multiple times
      if (hasProcessedTokens.current) {
        console.log('Tokens already processed, skipping...');
        return;
      }

      // Debug: Log the full URL and hash
      console.log('Full URL:', window.location.href);
      console.log('Hash:', location.hash);
      console.log('Search params:', searchParams.toString());

      // Parse the hash fragment properly
      const hash = location.hash.substring(1); // Remove the '#' character
      console.log('Raw hash:', hash);

      // If no hash, check if we already have a valid session
      if (!hash) {
        console.log('No hash found, checking existing session...');
        try {
          const {
            data: { session }
          } = await supabase.auth.getSession();
          if (session && session.user) {
            console.log('Existing valid session found');
            setIsValidToken(true);
            setIsCheckingToken(false);
            hasProcessedTokens.current = true;
            return;
          }
        } catch (err) {
          console.error('Error checking existing session:', err);
        }

        console.log('No valid session and no hash, showing error');
        setErrorMessage(
          'Invalid or missing reset token. Please try the forgot password process again.'
        );
        setIsCheckingToken(false);
        return;
      }

      // Create URLSearchParams from hash
      const hashParams = new URLSearchParams(hash);

      console.log('Hash params:', Object.fromEntries(hashParams.entries()));
      console.log('Query params:', Object.fromEntries(searchParams.entries()));

      const error = hashParams.get('error') || searchParams.get('error');
      const errorCode =
        hashParams.get('error_code') || searchParams.get('error_code');
      const errorDescription =
        hashParams.get('error_description') ||
        searchParams.get('error_description');

      // Get tokens from hash or query params
      const accessToken =
        hashParams.get('access_token') || searchParams.get('access_token');
      const refreshToken =
        hashParams.get('refresh_token') || searchParams.get('refresh_token');
      const tokenType =
        hashParams.get('token_type') || searchParams.get('token_type');
      const type = hashParams.get('type') || searchParams.get('type');
      const expiresAt =
        hashParams.get('expires_at') || searchParams.get('expires_at');
      const expiresIn =
        hashParams.get('expires_in') || searchParams.get('expires_in');

      console.log('Extracted values:', {
        error,
        errorCode,
        errorDescription,
        accessToken: accessToken
          ? `present (${accessToken.substring(0, 20)}...)`
          : 'missing',
        refreshToken: refreshToken ? `present (${refreshToken})` : 'missing',
        tokenType,
        type,
        expiresAt,
        expiresIn
      });

      // Mark that we're processing tokens to prevent re-processing
      hasProcessedTokens.current = true;

      if (error) {
        let message = 'Password reset failed. Please try again.';

        if (errorCode === 'otp_expired') {
          message =
            'The password reset link has expired. Please request a new one.';
        } else if (error === 'access_denied') {
          message =
            'The password reset link is invalid or has expired. Please request a new one.';
        } else if (errorDescription) {
          message = decodeURIComponent(errorDescription);
        }

        console.log('Error detected:', message);
        setErrorMessage(message);
        setIsCheckingToken(false);
        return;
      }

      // Check if this is a recovery type (password reset)
      if (type === 'recovery') {
        console.log('Recovery type detected - this is a password reset link');

        if (accessToken) {
          console.log('Access token found, proceeding with password reset...');

          try {
            // For recovery links, we can use the access token directly
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '' // refresh_token might be empty for recovery
            });

            if (sessionError) {
              console.error('Session error:', sessionError);
              // Don't fail immediately, try with just access token
              console.log('Trying with access token only...');

              // Alternative approach: use the getUser method to verify the token
              const {
                data: { user },
                error: userError
              } = await supabase.auth.getUser(accessToken);

              if (userError || !user) {
                console.error('User verification error:', userError);
                setErrorMessage(
                  'Invalid reset link. Please try the forgot password process again.'
                );
                setIsCheckingToken(false);
                return;
              }

              console.log('User verified successfully:', user.email);
              setIsValidToken(true);
              setIsCheckingToken(false);

              // Clear the hash to prevent re-processing
              window.history.replaceState(null, '', window.location.pathname);
              return;
            }

            console.log('Session set successfully');
            setIsValidToken(true);
            setIsCheckingToken(false);

            // Clear the hash to prevent re-processing
            window.history.replaceState(null, '', window.location.pathname);
            return;
          } catch (error) {
            console.error('Error setting session:', error);
            setErrorMessage('Error validating reset link. Please try again.');
            setIsCheckingToken(false);
            return;
          }
        } else {
          console.log('No access token found in recovery link');
          setErrorMessage(
            'Invalid reset link format. Please try the forgot password process again.'
          );
          setIsCheckingToken(false);
          return;
        }
      }

      // Fallback: if not a recovery type but has tokens
      if (accessToken && refreshToken) {
        console.log('Non-recovery link with tokens detected');

        try {
          console.log('Attempting to set session with tokens...');
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (sessionError) {
            console.error('Session error:', sessionError);
            setErrorMessage(
              'Invalid reset link. Please try the forgot password process again.'
            );
            setIsCheckingToken(false);
            return;
          }

          console.log('Session set successfully');
          setIsValidToken(true);

          // Clear the hash to prevent re-processing
          window.history.replaceState(null, '', window.location.pathname);
        } catch (error) {
          console.error('Error validating token:', error);
          setErrorMessage('Error validating reset link. Please try again.');
        } finally {
          setIsCheckingToken(false);
        }
      } else {
        console.log('No valid tokens found');
        setErrorMessage(
          'Invalid or missing reset token. Please try the forgot password process again.'
        );
        setIsCheckingToken(false);
      }
    };

    checkTokenAndErrors();
  }, [searchParams, location.hash, navigate]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      // First update the Supabase auth password
      const { error: authError } = await supabase.auth.updateUser({
        password: data.password
      });

      if (authError) {
        if (
          authError.message.includes('Password should be at least 6 characters')
        ) {
          toast.error('Password must be at least 6 characters long.');
        } else if (authError.message.includes('session not found')) {
          toast.error(
            'Session expired. Please try the forgot password process again.'
          );
          navigate('/forgot-password');
          return;
        } else {
          toast.error('Failed to update password. Please try again.');
        }
        console.error('Password update error:', authError);
        return;
      }

      console.log('Auth password updated successfully');

      // Get the current user to update the sb_users table
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (user) {
        console.log('Updating sb_users table for user:', user.id);

        // Hash the password for secure storage
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        console.log('Hashed password:', hashedPassword);

        // Update the password in the sb_users table
        const { error: dbError } = await supabase
          .from('sb_users')
          .update({
            password: hashedPassword,
            confirm_password: hashedPassword
          })
          .eq('user_uid', user.id);

        if (dbError) {
          console.error('Error updating sb_users table:', dbError);
          // Don't fail the entire process, just log the error
          toast.warning(
            'Password updated but there was an issue syncing user data.'
          );
        } else {
          console.log(
            'sb_users table updated successfully with hashed password'
          );
        }
      }

      // Sign out the user after successful password reset
      await supabase.auth.signOut();

      toast.success(
        'Password updated successfully! Please log in with your new password.'
      );
      navigate('/login');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    navigate('/forgot-password');
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <SiteHeader />
        <div className="container mx-auto px-4 h-[calc(100vh-4rem)] flex flex-col justify-center items-center">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Verifying reset link...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <SiteHeader />

        <div className="container mx-auto px-4 h-[calc(100vh-4rem)] flex flex-col justify-center items-center">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8 transition-all duration-300">
            <div className="space-y-4 text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Reset Link Invalid
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{errorMessage}</p>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full py-2 bg-primary hover:bg-primary/90 transition-colors duration-200"
                onClick={handleRetry}>
                Request New Reset Link
              </Button>

              <Button
                className="w-full py-2 border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                variant="outline"
                onClick={() => navigate('/login')}>
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return null; // Should not reach here due to error handling above
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <SiteHeader />

      <div className="container mx-auto px-4 h-[calc(100vh-4rem)] flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8 transition-all duration-300">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Enter your new password below
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Input
                  placeholder="Enter new password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2 pr-10 transition-colors duration-200"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  disabled={isLoading}
                />
                <Button
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  placeholder="Confirm new password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2 pr-10 transition-colors duration-200"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val: string) => {
                      if (watch('password') !== val) {
                        return 'Passwords do not match';
                      }
                    }
                  })}
                  disabled={isLoading}
                />
                <Button
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Button
                className="w-full py-2 bg-primary hover:bg-primary/90 transition-colors duration-200"
                type="submit"
                disabled={isLoading}>
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>

              <Button
                className="w-full py-2 border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                variant="outline"
                type="button"
                onClick={() => navigate('/login')}
                disabled={isLoading}>
                Back to Login
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
