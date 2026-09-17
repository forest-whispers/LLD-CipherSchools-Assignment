import { PublicLayout } from "@/app/shared/layouts/PublicLayout";

export default function PublicRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
