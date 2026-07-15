import { redirect } from "next/navigation";

import { getServerSession } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session?.user) {
    redirect("/login");
  }

  const displayName = session.user.name ?? session.user.email ?? "User";

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-xl font-medium text-foreground">
        Welcome, {displayName}. Dashboard coming in Phase 5.
      </p>
    </main>
  );
}
