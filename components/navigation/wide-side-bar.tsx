import React, { useState } from 'react'
import { navigation_panel } from './type'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail } from '../ui/sidebar'
import { ChevronDown } from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

function AppSideBar() {
  const navPaths = navigation_panel
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (name: string) => {
    setOpenItems(prev => ({ ...prev, [name]: !prev[name] }))
  }

  return (
    <Sidebar>
      <SidebarHeader></SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navPaths.map((item) => (
                <SidebarMenuItem key={item.name}>
                  {item.children && item.children.length > 0 ? (
                    <div className="group/collapsible">
                      <button
                        onClick={() => toggleItem(item.name)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                      >
                        {item.icon && <HugeiconsIcon icon={item.icon} />}
                        <span>{item.name}</span>
                        <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </button>
                      
                      {openItems[item.name] && (
                        <div>
                          <SidebarMenuSub>
                            {item.children.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.name}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={subItem.href}>{subItem.name}</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </div>
                      )}
                    </div>
                  ) : (
                    <SidebarMenuButton asChild>
                      <Link href={item.href} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50">
                        {item.icon && <HugeiconsIcon icon={item.icon} />}
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter></SidebarFooter>
      
      <SidebarRail/>
    </Sidebar>
  )
}

export default AppSideBar