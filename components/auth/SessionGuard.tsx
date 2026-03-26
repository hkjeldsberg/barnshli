"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Mounts an auth-state listener on every authenticated page.
 * When Supabase fires SIGNED_OUT (e.g. refresh token expired),
 * the user is immediately redirected to the login page with
 * their current path preserved as ?returnTo=…
 */
export function SessionGuard(): null {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        const returnTo = encodeURIComponent(pathname);
        router.push(`/login?returnTo=${returnTo}`);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  return null;
}
