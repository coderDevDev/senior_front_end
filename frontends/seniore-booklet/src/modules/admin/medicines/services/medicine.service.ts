/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { z } from 'zod';
import { MedicineFormValues, medicineSchema } from '../medicine-content-form';

import { supabase } from '@/shared/supabase';
const getAllMedicines = async () => {
  try {
    return await axios({
      method: 'GET',
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/medicine/`
    });
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.log(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

const addMedicine = async (payload: MedicineFormValues) => {
  try {
    // Parse the payload with the Zod schema
    const parsedData = medicineSchema.parse(payload);

    console.log(parsedData);

    const formData = new FormData();

    Object.entries(parsedData).forEach(([key, value]) => {
      if (key === 'medicineImageFile' && value instanceof File) {
        formData.append('medicineImageFile', value);
      } else if (value !== undefined) {
        // For non-File fields, stringify objects and arrays
        formData.append(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        );
      }
    });

    const response = await axios({
      method: 'POST',
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/medicine/add_medicine`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Handle Zod validation errors
      console.error('Validation error:', err.errors);
      throw new Error('Invalid form data');
    } else if (axios.isAxiosError(err)) {
      console.error(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    } else {
      // Handle other types of errors
      console.error('An unexpected error occurred:', err);
      throw new Error('An unexpected error occurred');
    }
  }
};

const updateMedicine = async (
  payload: MedicineFormValues & { medicineId?: string }
) => {
  try {
    // Parse the payload with the Zod schema
    const parsedData = medicineSchema.parse(payload);

    // Create a copy of the data to send to the API
    const dataToUpdate = { ...parsedData };

    // If we have medicineImageFile, remove it from the payload
    // as we'll use medicineImageUrl for storing the image data
    if (dataToUpdate.medicineImageFile) {
      delete dataToUpdate.medicineImageFile;
    }

    console.log('Update medicine payload:', dataToUpdate);

    // Use Supabase to update the medicine
    const { data, error } = await supabase
      .from('medicine')
      .update(dataToUpdate)
      .eq('medicineId', payload.medicineId);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Handle Zod validation errors
      console.error('Validation error:', err.errors);
      throw new Error('Invalid form data');
    } else {
      console.error('Error updating medicine:', err);
      throw err;
    }
  }
};

const archiveMedicine = async (payload: any) => {
  try {
    const response = await axios({
      method: 'PUT',
      url: `${
        import.meta.env.VITE_SERVER_URL
      }/api/v1/medicine/archive_medicine`,
      data: payload
    });
    return response.data;
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

const unarchiveMedicine = async (payload: any) => {
  try {
    const response = await axios({
      method: 'PUT',
      url: `${
        import.meta.env.VITE_SERVER_URL
      }/api/v1/medicine/unarchive_medicine`,
      data: payload
    });
    return response.data;
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

const medicineService = {
  getAllMedicines,
  addMedicine,
  updateMedicine,
  archiveMedicine,
  unarchiveMedicine
};

export default medicineService;
