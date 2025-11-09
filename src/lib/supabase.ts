import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.log('No es valida url')
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is required.");
}

if (!supabaseAnonKey) {
  console.log('No es valida el annon key')
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required.");
}

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseClient can only be called in the browser");
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be defined");
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return supabaseClient;
}
export const supabase = typeof window !== "undefined"
  ? getSupabaseClient()
  : (() => {

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  })();
export const supabaseAdmin =
  typeof window === "undefined" && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    : null;

export function getSupabaseAdmin() {
  if (typeof window !== "undefined") {
    throw new Error(
      "getSupabaseAdmin() can only be called on the server side."
    );
  }

  if (!supabaseServiceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for server operations."
    );
  }

  if (!supabaseAdmin) {
    throw new Error("supabaseAdmin is not available.");
  }

  return supabaseAdmin;
}
