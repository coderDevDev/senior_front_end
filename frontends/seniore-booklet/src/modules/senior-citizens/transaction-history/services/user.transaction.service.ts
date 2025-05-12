import axios from "axios";
import ITransaction from "../transaction.interface";

const addTransaction = async (user: Partial<ITransaction>) => {
  try {
    return await axios({
      method: "POST",
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/user/create_transaction`,
      data: user,
    });
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.log(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

const getAllTransactions = async () => {
  try {
    return await axios({
      method: "GET",
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/user/transaction`,
    });
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.log(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

export { addTransaction, getAllTransactions };
