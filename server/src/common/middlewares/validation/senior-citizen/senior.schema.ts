import * as z from "zod";

export const addSeniorSchema = z.object({
  firstName: z.string().trim(),
  lastName: z.string().trim(),
  middleName: z.string().optional(),
  email: z.string().email({
    message: "email must be valid"
  }),
  password: z.string().min(6, { message: "Password must be atleast 6 characters."}),
  confirmPassword: z.string().min(6, { message: "Confirm Password must be atleast 6 characters."}),
}).superRefine(({ confirmPassword, password}, ctx) => {
  if(confirmPassword !== undefined || confirmPassword !== null) {
    if(confirmPassword !== password) ctx.addIssue({
      code: "custom",
      message: "Passwords did not match",
      path: ["confirmPassword"]
    })
  }
} )
