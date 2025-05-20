import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { SeniorCitizenFormValues } from './senior-citizen-content-form';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface SeniorCitizenFormProps {
  form: UseFormReturn<any>;
  seniorDataForm: any;
  isAdminForm?: boolean;
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

const SeniorCitizenForm = ({
  seniorData,
  form,
  isAdminForm = false,
  onSubmit,
  isLoading = false
}: SeniorCitizenFormProps) => {
  const location = useLocation();
  const {
    formState: { errors }
  } = form;

  // Pre-populate form when editing
  useEffect(() => {
    if (seniorData) {
      // Reset form with senior data
      form.reset({
        email: seniorData.email,
        firstName: seniorData.firstName,
        lastName: seniorData.lastName,
        middleName: seniorData.middleName || '',
        healthStatus: seniorData.healthStatus,
        age: seniorData.age,
        contactNumber: seniorData.contactNumber,
        // Don't set password when editing
        password: ''
      });
    }
  }, [seniorData, form]);

  return (
    seniorData && (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit || (() => {}))}>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Email field - only editable for admin */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  {...form.register('email')}
                  type="email"
                  placeholder="Enter email"
                  disabled={!isAdminForm}
                />
                {form.formState.errors.email && (
                  <span className="text-red-500 text-sm">
                    {form.formState.errors.email.message}
                  </span>
                )}
              </div>

              {/* Password field - only for admin */}
              {isAdminForm && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...form.register('password')}
                    type="password"
                    placeholder="Enter password"
                  />
                  {form.formState.errors.password && (
                    <span className="text-red-500 text-sm">
                      {form.formState.errors.password.message}
                    </span>
                  )}
                </div>
              )}

              {/* Personal Information Section */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="M." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Health Information Section */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                  Health Information
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="healthStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Health Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select health status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="fair">Fair</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="60 years old"
                            type="number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Add submit button at the bottom */}
            {/* <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="submit" className="bg-primary" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div> */}
          </div>
        </form>
      </Form>
    )
  );
};

export default SeniorCitizenForm;
