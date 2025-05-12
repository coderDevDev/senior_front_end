/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export const editPharmacyService = {
  updatePharmacy: async ( payload: any) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'pharmacyImg' && value instanceof File) {
        formData.append('pharmacyImg', value);
      } else if (value !== undefined) {
        formData.append(key, value!.toString());
      }
    });

    const response = await axios({
      method: "PUT",
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/pharmacy/update_pharmacy`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },

  deletePharmacy: async (id: string) => {
    return axios.delete(`${import.meta.env.VITE_SERVER_URL}/api/v1/pharmacy/delete/${id}`);
  },

  archivePharmacy: async (id: string) => {
    return axios.patch(`${import.meta.env.VITE_SERVER_URL}/api/v1/pharmacy/archive/${id}`);
  }
};
