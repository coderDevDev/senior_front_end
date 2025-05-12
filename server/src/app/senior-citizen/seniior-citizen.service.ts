// import { supabase } from "@/config/supabase.config";
// import createHttpError from "http-errors";
// import ISeniorCitizen from "./senior-citizen.interface";

// // Fetch all senior citizens
// const getAllSeniorCitizen = async () => {
//   const { data, error: userError} = await supabase
//     .from("sb_users")
//     .select("*")
//     .eq("userRole", "senior_citizen");

//   if (userError) {
//     throw createHttpError(500, userError.message);
//   }

//   return data.map((item) => ({
//     id: item.user_id, // primary key in Supabase is named 'user_id'
//     ...item,
//   }));
// };
// // // Add a new senior citizen
// // const addSeniorCitizen = async (payload: Partial<ISeniorCitizen>) => {
// //   try {
// //     const { data, error: authError } = await supabase.auth.admin.createUser({
// //       email: payload.email,
// //       password: payload.password,
// //       user_metadata: {
// //         ...payload,
// //       userRole: "senior_citizen"
// //       }
// //     })

// //     if (authError) {
// //       throw createHttpError(401, authError.message);
// //     }

// //     const { data: user, error: userError } = await supabase
// //       .from("sb_users")
// //       .insert({
// //         ...data.user.user_metadata,
// //         user_uid: data.user.id,
// //         userRole: "senior_citizen"
// //       })
// //       .select()
// //       .single();

// //     if (userError) {
// //       throw createHttpError(401, userError.message);
// //     }

// //     return user;
// //   } catch (err) {
// //     console.error(err);
// //     throw createHttpError(401, err instanceof Error ? err.message : "Unknown error occurred");
// //   }
// // };

// // const updateSeniorCitizen = async (id: string, payload: Partial<ISeniorCitizen>) => {
// //   try {
// //     const { data, error } = await supabase
// //       .from("sb_users")
// //       .update({
// //         ...payload,
// //         updatedAt: new Date().toISOString(),
// //       })
// //       .eq("user_id", id)
// //       .select()
// //       .single();

// //     if (error) {
// //       if (error.code === 'PGRST116') { // Record not found error
// //         throw createHttpError(404, `Senior citizen with id ${id} not found`);
// //       }
// //       throw createHttpError(401, error.message);
// //     }

// //     return { id: data.id, ...data };
// //   } catch (err) {
// //     console.error(err);
// //     throw createHttpError(401, err instanceof Error ? err.message : "Unknown error occurred");
// //   }
// // };
// // Add a new senior citizen
// const addSeniorCitizen = async () => {
//   try {
//     const { data, error: authError } = await supabase.auth.admin.createUser({
//       email: payload.email,
//       password: payload.password,
//       user_metadata: {
//         ...payload,
//         userRole: "senior_citizen"
//       }
//     });

//     if (authError) {
//       throw createHttpError(401, authError.message);
//     }

//     const { data: user, error: userError } = await supabase
//       .from("sb_users")
//       .insert({
//         ...data.user.user_metadata,
//         user_uid: data.user.id,
//         userRole: "senior_citizen"
//       })
//       .select()
//       .single();

//     if (userError) {
//       throw createHttpError(401, userError.message);
//     }

//     return user as ISeniorCitizen;
//   } catch (err) {
//     console.error(err);
//     throw createHttpError(401, err instanceof Error ? err.message : "Unknown error occurred");
//   }
// };

// const updateSeniorCitizen = async (id: string, payload: Partial<ISeniorCitizen>) => {
//   try {
//     const { data, error } = await supabase
//       .from("sb_users")
//       .update({
//         ...payload,
//         updatedAt: new Date().toISOString(),
//       })
//       .eq("user_id", id)
//       .select()
//       .single();

//     if (error) {
//       if (error.code === 'PGRST116') { // Record not found error
//         throw createHttpError(404, `Senior citizen with id ${id} not found`);
//       }
//       throw createHttpError(401, error.message);
//     }

//     return data as ISeniorCitizen;
//   } catch (err) {
//     console.error(err);
//     throw createHttpError(401, err instanceof Error ? err.message : "Unknown error occurred");
//   }
// };

// const deleteSeniorCitizen = async (id: string) => {
//   try {
//     const { error } = await supabase
//       .from("sb_users")
//       .delete()
//       .eq("user_id", id);

//     if (error) {
//       if (error.code === 'PGRST116') { // Record not found error
//         throw createHttpError(404, `Senior citizen with id ${id} not found`);
//       }
//       throw createHttpError(401, error.message);
//     }

//     return true;
//   } catch (err) {
//     console.error(err);
//     throw createHttpError(401, err instanceof Error ? err.message : "Unknown error occurred");
//   }
// };


// export const SeniorCitizenService = {
//   addSeniorCitizen,
//   getAllSeniorCitizen,
//   updateSeniorCitizen,
//   deleteSeniorCitizen,
// };
import { supabase } from "@/config/supabase.config";
import createHttpError from "http-errors";
import ISeniorCitizen from "./senior-citizen.interface";

// Fetch all senior citizens
const getAllSeniorCitizen = async () => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("userRole", "senior_citizen");

  if (error) {
    throw createHttpError(500, error.message);
  }

  return data.map((item) => ({
    id: item.id, // Assuming the primary key in Supabase is named 'id'
    ...item,
  }));
};

// Add a new senior citizen
const addSeniorCitizen = async (payload: Partial<ISeniorCitizen>) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .insert({
        ...payload,
        userRole: "senior_citizen",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .single();

    if (error) {
      throw createHttpError(401, error.message);
    }

    return { id: data, data };
  } catch (err) {
    console.error(err);
    throw createHttpError(401, err instanceof Error ? err.message : "Unknown error occurred");
  }
};

// Update an existing senior citizen
const updateSeniorCitizen = async (id: string, payload: Partial<ISeniorCitizen>) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .update({
        ...payload,
        updatedAt: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Record not found error
        throw createHttpError(404, `Senior citizen with id ${id} not found`);
      }
      throw createHttpError(401, error.message);
    }

    return { id: data.id, ...data };
  } catch (err) {
    console.error(err);
    throw createHttpError(401, err instanceof Error ? err.message : "Unknown error occurred");
  }
};

// Delete a senior citizen
const deleteSeniorCitizen = async (id: string) => {
  try {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === 'PGRST116') { // Record not found error
        throw createHttpError(404, `Senior citizen with id ${id} not found`);
      }
      throw createHttpError(401, error.message);
    }

    return true;
  } catch (err) {
    console.error(err);
    throw createHttpError(401, err instanceof Error ? err.message : "Unknown error occurred");
  }
};

export const SeniorCitizenService = {
  addSeniorCitizen,
  getAllSeniorCitizen,
  updateSeniorCitizen,
  deleteSeniorCitizen,
};
