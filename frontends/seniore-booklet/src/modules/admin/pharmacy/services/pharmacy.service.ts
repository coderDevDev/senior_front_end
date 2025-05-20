import axios from 'axios';
import { PharmacyFormValues } from '../pharmacy-content-form';
import supabase from '@/shared/supabase';

export default {
  getAllPharmacies: async () => {
    try {
      return await axios({
        method: 'GET',
        url: `${import.meta.env.VITE_SERVER_URL}/api/v1/pharmacy/`
      });
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        console.log(err.response?.data.error);
        throw new Error(`${err.response?.data.error}`);
      }
    }
  },

  addPharmacy: async (payload: PharmacyFormValues) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (key === 'pharmacyImg' && value instanceof File) {
          formData.append('pharmacyImg', value);
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Log the FormData contents
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await axios({
        method: 'POST',
        url: `${import.meta.env.VITE_SERVER_URL}/api/v1/pharmacy/add_pharmacy`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        console.log(err.response?.data.error);
        throw new Error(`${err.response?.data.error}`);
      }
    }
  },

  updatePharmacy: async (
    pharmacyId: string,
    data: Partial<PharmacyFormValues>
  ) => {
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'pharmacyImg' && value instanceof File) {
          formData.append('pharmacyImg', value);
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      const response = await axios({
        method: 'PUT',
        url: `${import.meta.env.VITE_SERVER_URL}/api/v1/pharmacy/${pharmacyId}`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        throw new Error(`${err.response?.data.error}`);
      }
    }
  },

  archivePharmacy: async (payload: any) => {
    try {
      const { data: pharmacies, error } = await supabase
        .from('pharmacies')
        .update({ status: 'archived' })
        .eq('pharmacy_id', payload.pharmacy_id);

      if (error) {
        throw new Error(error.message);
      }

      return pharmacies;
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        throw new Error(`${err.response?.data.error}`);
      }
    }
  },

  unarchivePharmacy: async (payload: any) => {
    try {
      const response = await axios({
        method: 'PUT',
        url: `${
          import.meta.env.VITE_SERVER_URL
        }/api/v1/pharmacy/unarchive_pharmacy`,
        data: payload
      });
      return response.data;
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        throw new Error(`${err.response?.data.error}`);
      }
    }
  }
};
