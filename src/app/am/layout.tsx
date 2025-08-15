import { ReactNode } from "react"
import { AMLayout } from "@/components/am/AMLayout"

export default function AMSectionLayout({ children }: { children: ReactNode }) {
  return <AMLayout>{children}</AMLayout>
}

