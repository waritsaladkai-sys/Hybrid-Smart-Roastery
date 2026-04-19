// ── Server-only clients — DO NOT import in Client Components ──
// Only import this in: Server Components, API Routes, middleware
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** For use in Server Components and API Routes (uses request cookies for session) */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignore in Server Components (middleware handles session refresh)
        }
      },
    },
  });
}

/** Service-role client — bypasses RLS. Server-side only. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createAdminClient(): any {
  return createServerClient<Database>(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() { /* no-op for admin client */ },
      },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}

// Re-export browser client for convenience (still server-safe via tree-shaking)
export { createClient } from './supabase-client';
