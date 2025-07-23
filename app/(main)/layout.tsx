"use client"

import ClientLayout from "@/layouts/main-layout"
import type { ReactNode } from "react"

export default function MainLayout({ children }: { children: ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}
