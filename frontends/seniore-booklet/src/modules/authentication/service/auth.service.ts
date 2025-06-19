import supabase from '@/shared/supabase';
import axios from 'axios';

interface AuthCredentials {
  email: string;
  password: string;
}

export default {
  loginHandler: async (payload: AuthCredentials) => {
    try {
      // First authenticate the user
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email: payload.email,
          password: payload.password
        }
      );

      if (authError)
        throw `[AuthErrorService]: ${JSON.stringify(authError, null, 0)}`;

      if (data.user) {
        // Fetch the user's complete profile from sb_users
        const { data: userData, error: profileError } = await supabase
          .from('sb_users')
          .select('*')
          .eq('user_uid', data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw `[ProfileErrorService]: ${JSON.stringify(
            profileError,
            null,
            0
          )}`;
        }

        // If userData doesn't exist, the user might not be properly registered
        if (!userData) {
          throw `[ProfileErrorService]: User profile not found in database`;
        }

        // Update auth metadata with user role and other details
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            userRole: userData.userRole,
            id: userData.user_uid
          }
        });

        if (updateError)
          throw `[UpdateErrorService]: ${JSON.stringify(updateError, null, 0)}`;

        // Return user with updated metadata
        return {
          ...data.user,
          user_metadata: {
            ...data.user.user_metadata,
            firstName: userData.firstName,
            lastName: userData.lastName,
            userRole: userData.userRole
          }
        };
      }

      return data.user;
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        console.log(err.response?.data.error);
        throw new Error(`${err.response?.data.error}`);
      }
      throw err;
    }
  },

  currentUserHandler: async () => {
    try {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching current user:', error.message);
        return null;
      }

      console.log('currentUser', user);
      return user;
    } catch (err) {
      if (err instanceof axios.AxiosError) {
        console.log(err.response?.data.error);
        throw new Error(`${err.response?.data.error}`);
      }
    }
  }
};
