/* eslint-disable @typescript-eslint/no-explicit-any */
 
import axios, { AxiosError } from "axios";
import { SeniorCitizenFormValues, seniorCitizenSchema } from "../../senior-citizen-content-form";
import IUser from "../senior.user.interface";
 
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

const addSeniorCitizen = async (user:  SeniorCitizenFormValues) => {
  try {
      const parsedData = seniorCitizenSchema.parse(user);

    const formData = new FormData();
  
    Object.entries(parsedData).forEach(([key, value]) => {
      if (key === 'profileImg' && value instanceof File) {
        formData.append('profileImg', value);
      } else if (value !== undefined) {
        // For non-File fields, stringify objects and arrays
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    
    const response = await axios({
      method: "POST",
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/senior/add_senior`,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
 
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

const getAllSeniorCitizens = async () => {
  try{
    
    return await axios({
      method: "GET",
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/senior/`,
    });
  } catch (err) {
    if (err instanceof axios.AxiosError) {
      console.log(err.response?.data.error);
      throw new Error(`${err.response?.data.error}`);
    }
  }
}

// Register a new fingerprint
// Enhanced registerFingerprint function with proper debugging and error handling
 const registerFingerprint = async (data: any) => {
  try {
    // Log request details for debugging
    console.log('Sending fingerprint registration request:', {
      senior_id: data.seniorId,
      finger_position: data.fingerPosition || 'right_thumb',
      quality_score: data.qualityScore || 80,
      template_data_type: typeof data.templateData,
      template_data_length: data.templateData ? data.templateData.length : 0
    });

    // Make sure the template data is a string
    let templateData = data.templateData;
    if (typeof templateData !== 'string') {
      console.warn('Template data is not a string, converting...');
      templateData = JSON.stringify(templateData);
    }

    // Since this is a JSON string, let's try to parse it to validate it's proper JSON
    try {
      JSON.parse(templateData);
    } catch (err) {
      console.warn('Template data is not valid JSON, might cause issues:', err);
    }

    console.log("templateData", templateData)

    const response = await axios({
      method: 'POST',
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/fingerprints/register`,
      data: {
        senior_id: data.seniorId,
        template_data: templateData, // Using the validated template data
        finger_position: data.fingerPosition || 'right_thumb',
        quality_score: data.qualityScore || 80
      },
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000 // 15 second timeout
    });

    console.log('Fingerprint registration successful:', response.status);
    return response.data.data;
  } catch (err) {
    // Enhanced error logging
    console.error('Fingerprint registration error details:', {
      isAxiosError: axios.isAxiosError(err),
      status: axios.isAxiosError(err) ? err.response?.status : undefined,
      statusText: axios.isAxiosError(err) ? err.response?.statusText : undefined,
      message: err instanceof Error ? err.message : String(err),
      errorData: axios.isAxiosError(err) ? err.response?.data : undefined
    });
    
    // Better error handling with detailed information
    if (axios.isAxiosError(err)) {
      // Get specific error message if available
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.message || 
                           `Server error: ${err.response?.status} ${err.response?.statusText}` ||
                           'Failed to register fingerprint';
      
      throw new Error(errorMessage);
    } else if (err instanceof Error) {
      throw new Error(`Registration error: ${err.message}`);
    } else {
      throw new Error('An unexpected error occurred during fingerprint registration');
    }
  }
};

const checkFingerprintStatus = async (seniorId: string) => {
  try {
    const response = await axios({
      method: 'GET',
      url: `${import.meta.env.VITE_SERVER_URL}/api/v1/fingerprints/has-registered/${seniorId}`,
    });
    return response.data.data; // Assuming customReponse wraps data in { data: ... }
  } catch (err) {
    if (err instanceof AxiosError) {
      console.error('Error checking fingerprint status:', err.response?.data.error);
      throw new Error(err.response?.data.error || 'Failed to check fingerprint status');
    }
    throw err;
  }
};


export {
  addSeniorCitizen, addUser, checkFingerprintStatus, getAllSeniorCitizens, getAllUsers, registerFingerprint
};

