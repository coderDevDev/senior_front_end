import { createClient } from "@supabase/supabase-js";
import { environmentConfig } from "./load-envs.config";

export const supabase = createClient(
  environmentConfig.SUPABASE_URL as string,
  environmentConfig.SUPABASE_API_KEYS as string,

);
