import axios from "axios";
import IUser from "../user.interface";
 
const addUser = async (user:  Partial<IUser>) => {
  try {

      return await axios({
        method: "POST",
        url: `${import.meta.env.VITE_SERVER_URL}/api/v1/user/create_user`,
        data: user
      });
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.log(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    }
  }
}

const getAllUsers = async () => {
  try{
    return await axios({
      method: "GET",
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/user/`,
    });
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.log(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    }
  }
}

export {
  addUser,
  getAllUsers
};

