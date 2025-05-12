import { supabase } from "@/config/supabase.config";
import { IUser } from "./user.interface";

export class UserService {

  async createUser(payload: IUser): Promise<IUser>  {

    const { data, error: authError } = await supabase.auth.admin.createUser({
      email: payload.email,
      password: payload.password,
      user_metadata: {
        ...payload
      },
      email_confirm: true
    })

    if(authError) throw  `[AuthErrorService]: ${authError}`;

    const { data: user, error: userError } = await supabase
    .from("sb_users")
    .insert({
      ...data.user.user_metadata,
      user_uid: data.user.id
    })
    .select()
    .single();

    if(userError) throw  `[UserErrorService]: ${JSON.stringify(userError, null, 0)}`;

    return user;
  }

  async updateUser(userId: string, payload: Partial<IUser>): Promise<IUser> {
    // Update auth user metadata if email is being updated
    if (payload.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(
        userId,
        {
          email: payload.email,
          user_metadata: {
            ...payload
          }
        }
      );

      if (authError) throw `[AuthUpdateError]: ${authError}`;
    }

    // Update user data in database
    const { data: updatedUser, error: userError } = await supabase
      .from("sb_users")
      .update({
        ...payload,
        updated_at: new Date().toISOString()
      })
      .eq("user_uid", userId)
      .select()
      .single();

    if (userError) throw `[UserUpdateError]: ${JSON.stringify(userError, null, 0)}`;

    return updatedUser;
  }

  async archiveUser(userId: string): Promise<IUser> {
    const { data: user, error: userError } = await supabase
      .from("sb_users")
      .update({
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq("user_uid", userId)
      .select()
      .single();

    if (userError) throw `[UserArchiveError]: ${JSON.stringify(userError, null, 0)}`;

    return user;
  }

  async unarchiveUser(userId: string): Promise<IUser> {
    const { data: user, error: userError } = await supabase
      .from("sb_users")
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq("user_uid", userId)
      .select()
      .single();

    if (userError) throw `[UserUnarchiveError]: ${JSON.stringify(userError, null, 0)}`;

    return user;
  }

  async getArchivedUsers(): Promise<IUser[]> {
    const { data: users, error } = await supabase
      .from("sb_users")
      .select("*")
      .eq("status", "archived");

    if (error) throw `[GetArchivedUsersError]: ${JSON.stringify(error, null, 0)}`;

    return users;
  }
}

export default UserService;

