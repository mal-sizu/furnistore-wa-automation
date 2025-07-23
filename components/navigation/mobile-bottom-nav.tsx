"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { navigation_panel } from "./type"
import { HugeiconsIcon } from "@hugeicons/react"

export function MobileBottomNav() {
  const pathname = usePathname()
  const navPaths = navigation_panel


  // Prioritize the first 5 top-level items for the mobile navigation
  const mobileNavItems = navPaths.slice(0, 5)

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t bg-background px-2 md:hidden">
      {mobileNavItems.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          size="icon"
          asChild
          className={cn(
            "flex h-full flex-col items-center justify-center gap-1 text-xs",
            // Check if the current path matches the item's href or any of its children's hrefs
            pathname === item.href || (item.children && item.children.some((child) => pathname.startsWith(child.href)))
              ? "text-primary"
              : "text-muted-foreground",
          )}
        >
          <Link href={item.href}>
            {item.icon && <HugeiconsIcon icon={item.icon} />}
            <span>{item.name}</span>
          </Link>
        </Button>
      ))}
    </div>
  )
}
