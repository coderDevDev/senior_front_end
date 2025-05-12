import * as z from "zod";



export const addMedicineSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  unitPrice: z.preprocess((val) => {
    if (typeof val === 'string') {
      return parseFloat(val);
    }
    return val;
  }, z.number().min(0, 'Unit price must be non-negative')),
  stockQuantity: z.preprocess((val) => {
    if (typeof val === 'string') {
      return parseInt(val, 10);
    }
    return val;
  }, z.number().int().min(0, 'Stock quantity must be non-negative')),
  brandName: z.string().optional(),
  genericName: z.string().optional(),
  prescriptionRequired: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val.toLowerCase() === 'true';
    }
    return val;
  }, z.boolean().optional()),
  dosageForm: z.string().optional(),
  strength: z.string().optional(),
  isActive: z.preprocess((val) => {
    if (typeof val === 'string') {
      return val.toLowerCase() === 'true';
    }
    return val;
  }, z.boolean().optional()),
  medicineImageFile: z.any().optional(),

});

export const updateMedicineSchema = addMedicineSchema.partial();

export default addMedicineSchema;
