import SiteHeader from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import VerificationStepper from '../../components/verification-stepper';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Mail, Phone } from 'lucide-react';
import bcrypt from 'bcryptjs';

import supabase from '@/shared/supabase';

interface RegistrationFormInputs {
  firstName: string;
  lastName: string;
  middleInitial: string;
  address: string;
  birthMonth: string;
  birthDay: string;
  birthYear: string;
  birthPlace: string;
  email: string;
  contactNo: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegistrationFormInputs>({
    defaultValues: {
      birthMonth: '',
      birthDay: '',
      birthYear: ''
    }
  });

  const formatBirthDate = (year: string, month: string, day: string) => {
    // Create a date object and format it as ISO string for timestamptz
    const date = new Date(
      parseInt(year),
      parseInt(month) - 1, // Months are 0-based in JavaScript
      parseInt(day)
    );
    return date.toISOString();
  };

  const onSubmit = async (data: RegistrationFormInputs) => {
    setIsSubmitting(true);
    try {
      // Hash the password before storing
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // First, create auth user with email and password, including metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            userRole: 'senior_citizen' // Set role in auth metadata
          }
        }
      });

      if (authError) throw authError;

      // Format birth date
      const birthDate = formatBirthDate(
        data.birthYear,
        data.birthMonth,
        data.birthDay
      );

      // Insert into sb_users table with hashed password
      const { error: userError } = await supabase.from('sb_users').insert({
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleInitial,
        email: data.email,
        password: hashedPassword, // Store hashed password
        confirmPassword: hashedPassword,
        userRole: 'senior_citizen',
        user_uid: authData.user?.id,
        address: data.address,
        birthDate: birthDate,
        birthPlace: data.birthPlace,
        contactNo: data.contactNo,
        email_verified: false,
        created_at: new Date().toISOString()
      });

      if (userError) throw userError;

      // Insert into senior_citizens table with hashed password
      const { error: seniorError } = await supabase
        .from('senior_citizens')
        .insert({
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleInitial,
          email: data.email,
          password: hashedPassword, // Store hashed password
          userRole: 'senior_citizen',
          user_uid: authData.user?.id,
          address: data.address,
          birthdate: birthDate,
          birthPlace: data.birthPlace,
          contactNumber: data.contactNo,
          isEmailVerified: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          age: new Date().getFullYear() - new Date(birthDate).getFullYear(),
          healthStatus: 'good' // Default value
        });

      if (seniorError) throw seniorError;

      toast.success('Registration successful! Please verify your email.');
      navigate('/login');
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate years from 1900 to current year
  const years = Array.from(
    { length: new Date().getFullYear() - 1900 + 1 },
    (_, i) => new Date().getFullYear() - i
  );

  // Generate days 1-31
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <SiteHeader />

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-lg rounded-2xl">
          <CardContent className="p-6 md:p-8">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Create Your Account
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400">
                Please fill in your information to get started
              </p>
            </div>

            <VerificationStepper currentStep="personal" />

            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-primary rounded-full" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Personal Information
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstName"
                          className="text-gray-700 dark:text-gray-300">
                          First Name
                        </Label>
                        <Input
                          {...register('firstName', {
                            required: 'First name is required'
                          })}
                          placeholder="Enter your first name"
                          className="w-full transition-colors duration-200"
                        />
                        {errors.firstName && (
                          <span className="text-red-500 text-sm">
                            {errors.firstName.message}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="lastName"
                          className="text-gray-700 dark:text-gray-300">
                          Last Name
                        </Label>
                        <Input
                          {...register('lastName', {
                            required: 'Last name is required'
                          })}
                          placeholder="Enter your last name"
                          className="w-full transition-colors duration-200"
                        />
                        {errors.lastName && (
                          <span className="text-red-500 text-sm">
                            {errors.lastName.message}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="middleInitial"
                          className="text-gray-700 dark:text-gray-300">
                          Middle Initial
                        </Label>
                        <Input
                          {...register('middleInitial', { maxLength: 1 })}
                          placeholder="M.I."
                          maxLength={1}
                          className="w-full transition-colors duration-200"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className="text-gray-700 dark:text-gray-300">
                        Complete Address
                      </Label>
                      <Textarea
                        {...register('address', {
                          required: 'Address is required'
                        })}
                        placeholder="Enter your complete address"
                        className="resize-none transition-colors duration-200"
                      />
                      {errors.address && (
                        <span className="text-red-500 text-sm">
                          {errors.address.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Birth Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-primary rounded-full" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Birth Information
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="birthMonth"
                          className="text-gray-700 dark:text-gray-300">
                          Month
                        </Label>
                        <Select
                          onValueChange={value => {
                            // Manually set the form value
                            register('birthMonth').onChange({
                              target: { name: 'birthMonth', value }
                            });
                          }}
                          defaultValue={watch('birthMonth')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem key={index} value={String(index + 1)}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.birthMonth && (
                          <span className="text-red-500 text-sm">
                            {errors.birthMonth.message}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="birthDay"
                          className="text-gray-700 dark:text-gray-300">
                          Day
                        </Label>
                        <Select
                          onValueChange={value => {
                            register('birthDay').onChange({
                              target: { name: 'birthDay', value }
                            });
                          }}
                          defaultValue={watch('birthDay')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Day" />
                          </SelectTrigger>
                          <SelectContent>
                            {days.map(day => (
                              <SelectItem key={day} value={String(day)}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.birthDay && (
                          <span className="text-red-500 text-sm">
                            {errors.birthDay.message}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="birthYear"
                          className="text-gray-700 dark:text-gray-300">
                          Year
                        </Label>
                        <Select
                          onValueChange={value => {
                            register('birthYear').onChange({
                              target: { name: 'birthYear', value }
                            });
                          }}
                          defaultValue={watch('birthYear')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent>
                            {years.map(year => (
                              <SelectItem key={year} value={String(year)}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.birthYear && (
                          <span className="text-red-500 text-sm">
                            {errors.birthYear.message}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="birthPlace"
                        className="text-gray-700 dark:text-gray-300">
                        Place of Birth
                      </Label>
                      <Input
                        {...register('birthPlace', {
                          required: 'Birth place is required'
                        })}
                        placeholder="Enter your place of birth"
                        className="transition-colors duration-200"
                      />
                      {errors.birthPlace && (
                        <span className="text-red-500 text-sm">
                          {errors.birthPlace.message}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-primary rounded-full" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Contact Information
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-gray-700 dark:text-gray-300">
                          Email ID
                        </Label>
                        <Input
                          {...register('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Invalid email address'
                            },
                            validate: async value => {
                              // Check if email already exists
                              const { data, error } = await supabase
                                .from('sb_users')
                                .select('email')
                                .eq('email', value)
                                .maybeSingle();

                              // If there's an error (other than no rows found), throw it
                              if (error && error.code !== 'PGRST116') {
                                console.error('Email validation error:', error);
                                return 'Error checking email availability';
                              }

                              // If data exists, email is already taken
                              if (data) return 'Email already exists';
                              return true;
                            }
                          })}
                          type="email"
                          placeholder="Enter your email"
                          className="w-full transition-colors duration-200"
                        />
                        {errors.email && (
                          <span className="text-red-500 text-sm">
                            {errors.email.message}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="contactNo"
                          className="text-gray-700 dark:text-gray-300">
                          Contact No.
                        </Label>
                        <Input
                          {...register('contactNo', {
                            required: 'Contact number is required'
                          })}
                          type="tel"
                          placeholder="Enter your contact number"
                          className="w-full transition-colors duration-200"
                        />
                        {errors.contactNo && (
                          <span className="text-red-500 text-sm">
                            {errors.contactNo.message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Password Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-1 bg-primary rounded-full" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Security
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="password"
                          className="text-gray-700 dark:text-gray-300">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            {...register('password', {
                              required: 'Password is required',
                              minLength: {
                                value: 8,
                                message:
                                  'Password must be at least 8 characters'
                              },
                              pattern: {
                                value:
                                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                message:
                                  'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
                              }
                            })}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            className="pr-10 transition-colors duration-200"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                        </div>
                        {errors.password && (
                          <span className="text-red-500 text-sm">
                            {errors.password.message}
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="confirmPassword"
                          className="text-gray-700 dark:text-gray-300">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            {...register('confirmPassword', {
                              required: 'Please confirm your password',
                              validate: value =>
                                value === watch('password') ||
                                'Passwords do not match'
                            })}
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            className="pr-10 transition-colors duration-200"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-1/2 -translate-y-1/2 h-full px-3"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }>
                            {showConfirmPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </Button>
                        </div>
                        {errors.confirmPassword && (
                          <span className="text-red-500 text-sm">
                            {errors.confirmPassword.message}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit Section */}
                  <div className="pt-6 space-y-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2 bg-primary hover:bg-primary/90 transition-colors duration-200">
                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </Button>

                    <div className="flex justify-center">
                      <Dialog
                        open={showHelpDialog}
                        onOpenChange={setShowHelpDialog}>
                        <DialogTrigger asChild>
                          <Button
                            variant="link"
                            type="button"
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                            Need Help?
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Registration Help</DialogTitle>
                            <DialogDescription>
                              If you need assistance with registration, please
                              contact our support team:
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="flex items-center gap-3">
                              <Phone className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Phone Support</p>
                                <p className="text-sm text-muted-foreground">
                                  +63 912 345 6789
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Mail className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">Email Support</p>
                                <p className="text-sm text-muted-foreground">
                                  support@seniore.com
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              onClick={() => setShowHelpDialog(false)}>
                              Close
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </form>
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
