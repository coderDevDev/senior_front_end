import { z } from 'zod';

export const seniorCitizenSchema = z.object({
  email: z
    .string({
      required_error: 'Please select an email to display.'
    })
    .email(),
  password: z
    .string({
      required_error: 'This field is required.'
    })
    .min(2, {
      message: 'Password must be at least 2 characters.'
    })
    .max(30, {
      message: 'Password must not be longer than 30 characters.'
    }),
  firstName: z.string().min(2).max(30),
  lastName: z.string().min(2).max(30),
  middleName: z.string().optional(),
  age: z.preprocess(
    val => (typeof val === 'string' ? parseInt(val, 10) : val),
    z.number().min(60).max(120)
  ),
  healthStatus: z.enum(['excellent', 'good', 'fair', 'poor']),
  contactNumber: z.string().min(10).max(50),
  profileImg: z.any()
});

export type SeniorCitizenFormValues = z.infer<typeof seniorCitizenSchema>;

// Add any other types/interfaces you need to export
