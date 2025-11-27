import AdminLayoutWrapper from "@/components/admin/AdminLayoutWrapper";
import { SidebarProvider } from "@/hooks/use-sidebar";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@/types/user.type";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== UserRole.ADMIN) {
    redirect("/");
  }
  return (
    <SidebarProvider>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </SidebarProvider>
  );
}
