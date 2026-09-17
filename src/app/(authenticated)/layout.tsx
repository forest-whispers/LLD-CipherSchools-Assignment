import { AuthenticatedLayout } from "@/app/shared/layouts/AuthenticatedLayout";

export default function AuthenticatedRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
