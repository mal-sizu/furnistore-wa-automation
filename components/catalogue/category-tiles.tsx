"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CatalogueItem } from "@/types/catalogue"
import { Plus, FolderOpen } from "lucide-react"

interface CategoryTilesProps {
  items: CatalogueItem[]
  onSelect: (item: CatalogueItem) => void
  onAddCategory: () => void
}

export function CategoryTiles({ items, onSelect, onAddCategory }: CategoryTilesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <Card
        className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/50 hover:border-primary transition-colors cursor-pointer min-h-[180px] bg-primary-foreground/10 hover:bg-primary-foreground/20"
        onClick={onAddCategory}
      >
        <Plus className="h-10 w-10 text-primary mb-2" />
        <CardTitle className="text-lg text-primary">Add New Category</CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Create a new product catalog entry.
        </CardDescription>
      </Card>
      {items.map((item) => (
        <Card
          key={item.id}
          className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col justify-between min-h-[180px] bg-card text-card-foreground"
          onClick={() => onSelect(item)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3 mb-2">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
              <CardTitle className="text-xl font-semibold">{item.name}</CardTitle>
            </div>
            {item.description && <CardDescription className="line-clamp-2">{item.description}</CardDescription>}
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">{item.messages.length} messages</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
