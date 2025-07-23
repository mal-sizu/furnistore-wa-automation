"use client"

import type * as React from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar" // Removed SidebarTrigger import
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { navigation_panel } from "@/components/navigation/type"
import AppSideBar from "@/components/navigation/wide-side-bar"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const navItems = navigation_panel
  const isMobile = useIsMobile()
  const pathname = usePathname()

  // Function to generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter((segment) => segment !== "")
    const breadcrumbs = []

    // Handle root path differently
    if (pathname === "/") {
      return [
        <BreadcrumbItem key="dashboard-root">
          <BreadcrumbPage>Dashboard</BreadcrumbPage>
        </BreadcrumbItem>,
      ]
    }

    // Add Dashboard as the root link for non-root paths
    breadcrumbs.push(
      <BreadcrumbItem key="dashboard-root">
        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
      </BreadcrumbItem>,
    )

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i]
      const currentPath = `/${pathSegments.slice(0, i + 1).join("/")}`
      const navItem = navItems.find((item) => item.href === currentPath)
      let name = navItem ? navItem.name : segment.charAt(0).toUpperCase() + segment.slice(1)

      // Check if it's a sub-item
      if (!navItem) {
        for (const topItem of navItems) {
          if (topItem.children) {
            const subItem = topItem.children.find((child) => child.href === currentPath)
            if (subItem) {
              name = subItem.name
              break
            }
          }
        }
      }

      breadcrumbs.push(<BreadcrumbSeparator key={`sep-${i}`} />)
      if (i === pathSegments.length - 1) {
        breadcrumbs.push(
          <BreadcrumbItem key={`page-${i}`}>
            <BreadcrumbPage>{name}</BreadcrumbPage>
          </BreadcrumbItem>,
        )
      } else {
        breadcrumbs.push(
          <BreadcrumbItem key={`link-${i}`}>
            <BreadcrumbLink href={currentPath}>{name}</BreadcrumbLink>
          </BreadcrumbItem>,
        )
      }
    }
    return breadcrumbs
  }

  return (
    <SidebarProvider>
      {/* Render AppSidebar only on non-mobile screens */}
      {!isMobile && <AppSideBar />}
      {/* SidebarInset ensures the main content is pushed by the sidebar */}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          {/* SidebarTrigger is now inside AppSidebar */}
          <Breadcrumb>
            <BreadcrumbList>{generateBreadcrumbs()}</BreadcrumbList>
          </Breadcrumb>
        </header>
        {/* Add padding-bottom to main content to prevent overlap with fixed bottom nav on mobile */}
        <div className="flex flex-1 flex-col gap-4 p-4 pb-[calc(theme(spacing.16)+theme(spacing.4))] md:pb-4">
          {children}
        </div>
      </SidebarInset>
      {/* Render MobileBottomNav only on mobile screens */}
      {isMobile && <MobileBottomNav />}
    </SidebarProvider>
  )
}