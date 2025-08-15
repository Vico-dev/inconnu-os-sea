import { ReactNode } from "react"
import { ClientLayout } from "@/components/client/ClientLayout"

export default function ClientSectionLayout({ children }: { children: ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}

