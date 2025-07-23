"use client"

import { Button } from "@/components/ui/button"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ImageIcon, List, Radio, Edit, Trash2 } from "lucide-react"
import type { CatalogueItem } from "@/types/catalogue"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface CataloguePreviewProps {
  item: CatalogueItem
  onEdit: (item: CatalogueItem) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export function CataloguePreview({ item, onEdit, onDelete, onClose }: CataloguePreviewProps) {
  const getMessageTypeIcon = (type: CatalogueItem["messages"][number]["type"]) => {
    switch (type) {
      case "text":
        return <MessageSquare className="h-4 w-4" />
      case "image_bundle":
        return <ImageIcon className="h-4 w-4" />
      case "interactive_list":
        return <List className="h-4 w-4" />
      case "interactive_buttons":
        return <Radio className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="border-b pb-4 px-0">
        <CardTitle className="text-3xl font-extrabold text-center">{item.name}</CardTitle>
        {item.description && <p className="text-center text-muted-foreground mt-2">{item.description}</p>}
      </CardHeader>
      <ScrollArea className="flex-1 py-6 px-0">
        <div className="grid gap-6">
          {item.messages.map((msg, msgIndex) => (
            <div key={msgIndex} className="border p-4 rounded-lg bg-background">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 text-sm">
                  {getMessageTypeIcon(msg.type)}
                  <span className="capitalize">{msg.type.replace(/_/g, " ")} Message</span>
                </Badge>
              </div>

              {msg.type === "text" && <p className="text-base text-foreground">{msg.content.body}</p>}
              {msg.type === "image_bundle" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {msg.content.map((img, imgIndex) => (
                    <div key={imgIndex} className="relative aspect-[4/3] overflow-hidden rounded-lg border">
                      <Image
                        src={img.url || "/placeholder.svg"}
                        alt={img.caption || `Image ${imgIndex + 1}`}
                        fill
                        objectFit="cover"
                        className="rounded-lg"
                      />
                      {img.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white text-xs p-2 truncate">
                          {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {msg.type === "interactive_list" && (
                <div className="text-sm text-muted-foreground grid gap-2">
                  <p>
                    <span className="font-medium text-foreground">Button:</span> {msg.content.action.button}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Body:</span> {msg.content.body.text}
                  </p>
                  {msg.content.action.sections[0]?.rows.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-foreground">List Rows:</p>
                      <ul className="list-disc list-inside ml-4 text-base text-foreground">
                        {msg.content.action.sections[0].rows.map((row, rowIndex) => (
                          <li key={rowIndex} className="mb-1">
                            <span className="font-semibold">{row.title}</span> (ID: {row.id})
                            {row.description && <span className="text-muted-foreground">: {row.description}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {msg.type === "interactive_buttons" && (
                <div className="text-sm text-muted-foreground grid gap-2">
                  <p>
                    <span className="font-medium text-foreground">Body:</span> {msg.content.bodyText}
                  </p>
                  {msg.content.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.content.buttons.map((btn, btnIndex) => (
                        <Badge key={btnIndex} variant="outline" className="px-3 py-1 text-sm">
                          {btn.title} (ID: {btn.id})
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="flex gap-3 mt-6 border-t pt-4 px-0">
        <Button onClick={() => onEdit(item)} className="flex-1">
          <Edit className="mr-2 h-4 w-4" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="flex-1">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the &quot;{item.name}&quot; catalog item and
                remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete(item.id)}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
