import { createBrowserClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Browser client for SSR compatibility
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Standard client for API operations with proper typing
export function createTypedClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton client for client-side usage
let client: ReturnType<typeof createTypedClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createTypedClient();
  }
  return client;
}
