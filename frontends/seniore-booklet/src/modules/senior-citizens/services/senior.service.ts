import axios from "axios";
import ISeniorCitizen from "../profiles/senior.user.interface";

export const getArchivedSeniors = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/seniors/archived`,
    });
    return response.data;
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.error(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

export const archiveSenior = async (payload: Partial<ISeniorCitizen>) => {
  try {
    const response = await axios({
      method: "PUT",
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/seniors/archive_senior`,
      data: payload
    });
    return response.data;
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

export const unarchiveSenior = async (payload: Partial<ISeniorCitizen>) => {
  try {
    const response = await axios({
      method: "PUT",
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/seniors/unarchive_senior`,
      data: payload
    });
    return response.data;
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      throw new Error(`${err.response?.data.error}`);
    }
  }
};