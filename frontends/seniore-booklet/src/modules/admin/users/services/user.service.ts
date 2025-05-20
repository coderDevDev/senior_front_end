/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import IUser from '../user.interface';

import supabase from '@/shared/supabase';

const addUser = async (user: Partial<IUser>) => {
  try {
    return await axios({
      method: 'POST',
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/user/create_user`,
      data: user
    });
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.log(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

const getAllUsers = async () => {
  try {
    // const users =  await axios({
    //   method: "GET",
    //   url: `${import.meta.env.VITE_SERVER_URL}/api/v1/user/`,
    // });
    const { data: users, error } = await supabase
      .from('sb_users')
      .select('*')
      .or('userRole.eq.admin,userRole.eq.cashier');

    if (error) {
      throw new Error(error.message);
    }

    return users;
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.log(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

const updateUser = async (userData: Partial<IUser>) => {
  try {
    const response = await axios({
      method: 'PUT',
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/user/update_user`,
      data: userData
    });
    return response.data;
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.log(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

const archiveUserStatus = async (userData: Partial<IUser>) => {
  try {
    const response = await axios({
      method: 'PUT',
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/user/archive_user`,
      data: userData
    });
    return response.data;
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.log(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

// const archiveUser = async (userId: string) => {
//   try {
//     const response = await axios({
//       method: "PATCH",
//       url: `${import.meta.env.VITE_SERVER_URL}/api/v1/user/archive/${userId}`,
//     });
//     return response.data;
//   } catch (err) {
//     if (err instanceof axios.AxiosError) {
//       throw new Error(`${err.response?.data.error}`);
//     }
//   }
// };

const unarchiveUser = async (payload: any) => {
  try {
    const response = await axios({
      method: 'PUT',
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/user/unarchive_user`,
      data: payload
    });
    return response.data;
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

const getArchivedUsers = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/user/archived`
    });
    return response.data;
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      throw new Error(`${err.response?.data.error}`);
    }
  }
};

export {
  addUser,
  archiveUserStatus,
  getAllUsers,
  getArchivedUsers,
  unarchiveUser,
  updateUser
};
