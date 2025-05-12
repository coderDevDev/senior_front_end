import * as z from "zod";


const fileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.string().refine(mime => ['image/jpeg', 'image/png', 'image/webp'].includes(mime), {
    message: 'File must be a valid image (jpeg, png, or webp)'
  }),
  size: z.number().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
  buffer: z.instanceof(Buffer)
}).optional();

export const addUserPharmacy = z.object({
  name: z.string().min(1).max(100).trim(),
  address: z.string().min(5).max(200).trim(),
  pharmacyImg: z.any().optional(),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').max(15, 'Phone number must be 15 characters or less'),
  email: z.string().email(),
  operatingHours: z.string().min(1).max(100).optional(),
  is24Hours: z.preprocess(
    (val) => val === 'true' || val === true,
    z.boolean().optional()
  ),
});

export const updateUserPharmacy = addUserPharmacy.partial();

export default addUserPharmacy;
