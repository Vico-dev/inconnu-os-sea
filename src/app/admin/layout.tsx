import { ReactNode } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"

export default function AdminSectionLayout({ children }: { children: ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>
}

