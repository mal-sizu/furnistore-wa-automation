"use client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname, useRouter } from "next/navigation"

interface MobileTabsProps {
  items: { name: string; href: string }[]
  basePath: string
}

export function MobileTabs({ items, basePath }: MobileTabsProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Determine the active tab based on the current pathname
  const activeTab = items.find((item) => pathname.startsWith(item.href))?.href || items[0]?.href

  const handleTabChange = (value: string) => {
    router.push(value)
  }

  if (!items || items.length === 0) {
    return null
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full md:hidden">
      <TabsList className="grid w-full grid-cols-3 h-auto">
        {" "}
        {/* Adjust grid-cols based on number of tabs */}
        {items.map((item) => (
          <TabsTrigger key={item.href} value={item.href} className="py-2">
            {item.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {/* The content for each tab will be rendered by the respective page.tsx */}
      {/* This component only provides the tab navigation */}
    </Tabs>
  )
}
