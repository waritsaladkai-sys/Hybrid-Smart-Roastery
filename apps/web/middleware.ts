import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './lib/database.types';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Session client (anon key)
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session token (required for SSR)
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;

  // ── Protect /[locale]/admin/* routes ──────────────────────
  const isAdminRoute = pathname.match(/^\/(th|en)\/admin(?!\/login).*/);
  if (isAdminRoute) {
    if (!user) {
      const locale = pathname.startsWith('/en') ? 'en' : 'th';
      return NextResponse.redirect(new URL(`/${locale}/admin/login`, request.url));
    }

    // Service role client (no require — use @supabase/ssr with service key)
    const adminClient = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return []; },
          setAll() { /* no-op */ },
        },
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    const { data: profileData } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const role = (profileData as any)?.role;
    if (!role || !['ADMIN', 'STAFF'].includes(role)) {
      const locale = pathname.startsWith('/en') ? 'en' : 'th';
      return NextResponse.redirect(
        new URL(`/${locale}/admin/login?error=unauthorized`, request.url)
      );
    }
  }

  // ── Protect write API routes ───────────────────────────────
  const isProtectedApi = pathname.match(/^\/api\/(orders|payments\/initiate)/);
  if (isProtectedApi && !user && request.method !== 'GET') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/(th|en)/admin/:path*',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
