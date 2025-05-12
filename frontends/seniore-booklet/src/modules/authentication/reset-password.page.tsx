import SiteHeader from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

const ResetPasswordPage = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormValues>();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      // TODO: Implement reset password API call
      console.log('Resetting password for:', location.state?.email);
      alert('Password reset successful!');
      navigate('/login');

      console.log(data)
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="w-1/2 flex justify-center items-center mx-auto mt-4">
        <div className="mt-8 space-y-6">
          <h2 className="text-center text-3xl font-bold">Reset Password</h2>
          <p className="text-center text-sm text-gray-600">
            Enter your new password
          </p>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="relative">
              <Input 
                placeholder="New Password" 
                type={showPassword ? "text" : "password"}
                {...register("password", { 
                  required: "Password is required",
                  minLength: {
                    value: 8,
                    message: "Password must be at least 8 characters"
                  }
                })}
              />
              <Button
                className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="sr-only">Toggle password visibility</span>
              </Button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            <div className="relative">
              <Input 
                placeholder="Confirm Password" 
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword", { 
                  required: "Please confirm your password",
                  validate: (val: string) => {
                    if (watch('password') != val) {
                      return "Passwords do not match";
                    }
                  }
                })}
              />
              <Button
                className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400"
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <span className="sr-only">Toggle password visibility</span>
              </Button>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <Button className="w-full" type="submit">
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
