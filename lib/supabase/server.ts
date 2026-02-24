import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Enhance cookie options to ensure persistent sessions
              const enhancedOptions = {
                ...options,
                maxAge: options?.maxAge ?? 31536000, // 1 year in seconds if not set
                sameSite: options?.sameSite ?? ('lax' as const),
                secure: options?.secure ?? process.env.NODE_ENV === 'production', // HTTPS only in production
                path: options?.path ?? '/',
              };
              cookieStore.set(name, value, enhancedOptions);
            });
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
