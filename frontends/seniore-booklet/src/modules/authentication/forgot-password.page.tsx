import SiteHeader from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useState } from "react";

type ForgotPasswordFormValues = {
  email: string;
  pinCode?: string;
};

const ForgotPasswordPage = () => {
  const [step, setStep] = useState<'email' | 'pinCode'>('email');
  const [userEmail, setUserEmail] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormValues>();
  const navigate = useNavigate();

  const onSubmitEmail = async (data: ForgotPasswordFormValues) => {
    try {
      // TODO: Implement send pin code API call
      console.log('Sending pin code to:', data.email);
      setUserEmail(data.email);
      setStep('pinCode');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onSubmitPinCode = async (data: ForgotPasswordFormValues) => {
    try {
      // TODO: Implement verify pin code API call
      console.log('Verifying pin code:', data.pinCode);
      navigate('/reset-password', { state: { email: userEmail } });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="w-1/2 flex justify-center items-center mx-auto mt-4">
        <div className="mt-8 space-y-6">
          <h2 className="text-center text-3xl font-bold">Forgot Password</h2>
          
          {step === 'email' ? (
            <>
              <p className="text-center text-sm text-gray-600">
                Enter your email address to receive a pin code.
              </p>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmitEmail)}>
                <div>
                  <Input 
                    placeholder="Email" 
                    type="email" 
                    {...register("email", { 
                      required: "Email is required", 
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Please enter a valid email address"
                      }
                    })}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <Button className="w-full" type="submit">
                  Send Pin Code
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  type="button" 
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </Button>
              </form>
            </>
          ) : (
            <>
              <p className="text-center text-sm text-gray-600">
                Enter the pin code sent to your email.
              </p>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmitPinCode)}>
                <div>
                  <Input 
                    placeholder="Enter Pin Code" 
                    type="text" 
                    {...register("pinCode", { 
                      required: "Pin code is required",
                      minLength: {
                        value: 6,
                        message: "Pin code must be 6 digits"
                      }
                    })}
                  />
                  {errors.pinCode && <p className="text-red-500 text-sm mt-1">{errors.pinCode.message}</p>}
                </div>
                <Button className="w-full" type="submit">
                  Verify Pin Code
                </Button>
                <Button 
                  className="w-full" 
                  variant="outline"
                  type="button" 
                  onClick={() => setStep('email')}
                >
                  Back
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
