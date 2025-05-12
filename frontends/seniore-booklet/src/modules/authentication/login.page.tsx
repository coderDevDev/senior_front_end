import SiteHeader from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useLogin from './hooks/useLogin';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

// Define the form values type
type LoginFormValues = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { loginUser, isPending } = useLogin();

  const handleRegister = () => {
    navigate('/register');
  };

  const onSubmit = (data: LoginFormValues) => {
    console.log(data); // Here you would call your loginHandler

    loginUser(data);
    // navigate("/dashboard-app");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <SiteHeader />

      <div className="container mx-auto px-4 h-[calc(100vh-4rem)] flex flex-col justify-center items-center">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8 transition-all duration-300">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400">
              Please enter your credentials to continue
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
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
                  disabled={isPending}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    placeholder="Enter your password"
                    type={showPassword ? 'text' : 'password'}
                    className="w-full px-4 py-2 pr-10 transition-colors duration-200"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    disabled={isPending}
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
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto font-normal text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                onClick={() => navigate('/forgot-password')}>
                Forgot Password?
              </Button>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full py-2 bg-primary hover:bg-primary/90 transition-colors duration-200"
                type="submit"
                disabled={isPending}>
                {isPending ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    or
                  </span>
                </div>
              </div>

              <Button
                className="w-full py-2 border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                variant="outline"
                type="button"
                onClick={handleRegister}>
                Create an Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
