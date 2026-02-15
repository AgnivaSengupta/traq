// app/dashboard/layout.tsx
import { getSession } from "@/lib/auth"; // Your existing auth file
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Double-check: If token was invalid/fake, the DB check returns null.
  if (!session) {
    redirect("/");
  }

  return (
    <div>
       {/* Pass user data to children if needed */}
       {children}
    </div>
  );
}