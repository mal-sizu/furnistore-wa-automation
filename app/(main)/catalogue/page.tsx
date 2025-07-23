"use client"

import { useState, useEffect, useCallback } from "react"
import { CatalogueForm } from "@/components/catalogue/catalogue-form"
import { CategoryTiles } from "@/components/catalogue/category-tiles"
import { CataloguePreview } from "@/components/catalogue/catalogue-preview"
import type { CatalogueItem, CatalogueData } from "@/types/catalogue"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getCatalogueItems, addOrUpdateCatalogueItem, deleteCatalogueItem } from "@/lib/catalogue-actions"
import { sendWhatsAppCatalogueItem } from "@/app/api/whatsapp/whatsapp.service" // Import the new Server Action
import { Toaster } from "@/components/ui/toaster" // Import Toaster for notifications

export default function CataloguePage() {
  const [catalogueItems, setCatalogueItems] = useState<CatalogueData>([])
  const [isFormSheetOpen, setIsFormSheetOpen] = useState(false)
  const [isPreviewSheetOpen, setIsPreviewSheetOpen] = useState(false)
  const [selectedCatalogueItem, setSelectedCatalogueItem] = useState<CatalogueItem | null>(null)
  const [itemToEdit, setItemToEdit] = useState<CatalogueItem | null>(null)

  const fetchItems = useCallback(async () => {
    try {
      const items = await getCatalogueItems()
      setCatalogueItems(items)
    } catch (error) {
      console.error("Failed to fetch catalogue items:", error)
      // Optionally show a toast or error message to the user
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleAddItem = async (item: CatalogueItem) => {
    try {
      const updatedItem = await addOrUpdateCatalogueItem(item)
      await fetchItems() // Re-fetch to get the latest data, including generated ID
      setIsFormSheetOpen(false) // Close form after adding/updating
      setSelectedCatalogueItem(updatedItem) // Select the new/updated item for preview
      setIsPreviewSheetOpen(true) // Open preview for the new/updated item
    } catch (error) {
      console.error("Failed to save catalogue item:", error)
      // Optionally show a toast or error message to the user
    }
  }

  const handleSelectCategory = (item: CatalogueItem) => {
    setSelectedCatalogueItem(item)
    setIsPreviewSheetOpen(true)
    setIsFormSheetOpen(false) // Close form if open
  }

  const handleEditItem = (item: CatalogueItem) => {
    setItemToEdit(item)
    setIsFormSheetOpen(true)
    setIsPreviewSheetOpen(false) // Close preview to open form
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteCatalogueItem(id)
      await fetchItems() // Re-fetch to update the list
      setIsPreviewSheetOpen(false) // Close preview after deletion
      setSelectedCatalogueItem(null)
    } catch (error) {
      console.error("Failed to delete catalogue item:", error)
      // Optionally show a toast or error message to the user
    }
  }

  const handleOpenAddCategory = () => {
    setItemToEdit(null) // Ensure form is for new item
    setIsFormSheetOpen(true)
    setIsPreviewSheetOpen(false) // Close preview if open
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto py-8 px-4 md:px-6 border-b bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-extrabold text-center sm:text-left text-gray-800">Product Catalog Dashboard</h1>
          <Button onClick={handleOpenAddCategory} className="px-6 py-3 text-lg">
            <Plus className="mr-2 h-5 w-5" /> Add New Category
          </Button>
        </div>
      </header>
      <div className="container mx-auto py-8 px-4 md:px-6">
        {catalogueItems.length === 0 && !isFormSheetOpen ? (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">
              No catalog items found. Click "Add New Category" to get started!
            </p>
          </div>
        ) : (
          <CategoryTiles items={catalogueItems} onSelect={handleSelectCategory} onAddCategory={handleOpenAddCategory} />
        )}
      </div>
      {/* Add/Edit Category Sheet */}
      <Sheet open={isFormSheetOpen} onOpenChange={setIsFormSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-6">
          <SheetHeader>
            <SheetTitle>{itemToEdit ? "Edit Catalog Item" : "Add New Catalog Item"}</SheetTitle>
          </SheetHeader>
          <CatalogueForm onAddItem={handleAddItem} onClose={() => setIsFormSheetOpen(false)} initialData={itemToEdit} />
        </SheetContent>
      </Sheet>
      {/* Preview Category Sheet */}
      <Sheet open={isPreviewSheetOpen} onOpenChange={setIsPreviewSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto p-6">
          <SheetHeader>
            <SheetTitle>Catalog Item Details</SheetTitle>
          </SheetHeader>
          {selectedCatalogueItem && (
            <CataloguePreview
              item={selectedCatalogueItem}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onClose={() => setIsPreviewSheetOpen(false)}
              onSend={sendWhatsAppCatalogueItem} // Pass the Server Action
            />
          )}
        </SheetContent>
      </Sheet>
      {/* Add Toaster component for notifications */}
    </div>
  )
}
