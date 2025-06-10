import SiteHeader from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import supabase from '@/shared/supabase';

type ForgotPasswordFormValues = {
  email: string;
  pinCode?: string;
};

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'email' | 'success'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormValues>();
  const navigate = useNavigate();

  const onSubmitEmail = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      console.log('Sending password reset email to:', data.email);
      console.log(
        'Redirect URL will be:',
        `${window.location.origin}/reset-password`
      );

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('Password reset error:', error);
        if (
          error.message.includes('not found') ||
          error.message.includes('Invalid email')
        ) {
          toast.error('No account found with this email address.');
        } else if (error.message.includes('rate limit')) {
          toast.error('Too many requests. Please try again later.');
        } else {
          toast.error('Failed to send reset email. Please try again.');
        }
        return;
      }

      console.log('Password reset email sent successfully');
      setUserEmail(data.email);
      setStep('success');
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resendEmail = async () => {
    if (!userEmail) return;

    setIsLoading(true);
    try {
      console.log('Resending password reset email to:', userEmail);

      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error('Resend error:', error);
        toast.error('Failed to resend email. Please try again.');
        return;
      }

      console.log('Password reset email resent successfully');
      toast.success(
        'Password reset email sent again! Please check your inbox.'
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <SiteHeader />

      <div className="container mx-auto px-4 h-[calc(100vh-4rem)] flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8 transition-all duration-300">
          {step === 'email' ? (
            <>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
                  Forgot Password?
                </h2>
                <p className="text-center text-gray-600 dark:text-gray-400">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
              </div>

              <form
                className="space-y-6"
                onSubmit={handleSubmit(onSubmitEmail)}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    className="w-full px-4 py-2 transition-colors duration-200"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: 'Please enter a valid email address'
                      }
                    })}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Button
                    className="w-full py-2 bg-primary hover:bg-primary/90 transition-colors duration-200"
                    type="submit"
                    disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
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
            </>
          ) : (
            <>
              <div className="space-y-2 text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Check Your Email
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  We've sent a password reset link to{' '}
                  <strong>{userEmail}</strong>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Didn't receive the email? Check your spam folder or click the
                  button below to resend.
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  className="w-full py-2 bg-primary hover:bg-primary/90 transition-colors duration-200"
                  onClick={resendEmail}
                  disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Resend Email'}
                </Button>

                <Button
                  className="w-full py-2 border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  variant="outline"
                  onClick={() => {
                    setStep('email');
                    setUserEmail('');
                  }}
                  disabled={isLoading}>
                  Try Different Email
                </Button>

                <Button
                  className="w-full py-2 border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  disabled={isLoading}>
                  Back to Login
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
