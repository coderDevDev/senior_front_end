import { Medicine } from "../types/medicine"
import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export const MedicineService = {
  async getAllMedicines(): Promise<Medicine[]> {
    try {
      const response = await axios.get(`${API_URL}/medicines`)
      return response.data
    } catch (error) {
      console.error('Error fetching medicines:', error)
      throw error
    }
  },

  async getMedicineById(id: string): Promise<Medicine> {
    try {
      const response = await axios.get(`${API_URL}/medicines/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching medicine ${id}:`, error)
      throw error
    }
  }
}
