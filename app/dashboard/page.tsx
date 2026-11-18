"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { authClient } from "@/lib/auth-client";
import { dashboardHome } from "@/lib/constants";
import type { Role } from "@/lib/types";

/** /dashboard → redirect to the signed-in user's dashboard home. */
export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace("/sign-in?redirect=%2Fdashboard");
      return;
    }
    router.replace(dashboardHome(session.user.role as Role));
  }, [isPending, session, router]);

  return <DashboardSkeleton />;
}
