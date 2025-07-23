import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CatalogueItem } from "@/types/catalogue"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ImageIcon, List, Radio } from "lucide-react"

interface CatalogueListProps {
  items: CatalogueItem[]
}

export function CatalogueList({ items }: CatalogueListProps) {
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
    <Card className="w-full max-w-2xl mx-auto mt-8 shadow-lg">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-3xl font-extrabold text-center">Existing Catalog Items</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No catalog items added yet. Start by creating one!</p>
        ) : (
          <div className="grid gap-6">
            {items.map((item) => (
              <Card key={item.id} className="p-6 border-2 border-border hover:shadow-md transition-shadow">
                <h3 className="font-bold text-xl mb-2">{item.name}</h3>
                {item.description && <p className="text-sm text-muted-foreground mb-4">{item.description}</p>}
                <div className="grid gap-4">
                  {item.messages.map((msg, msgIndex) => (
                    <div key={msgIndex} className="border-t pt-4 first:border-t-0 first:pt-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1 text-xs">
                          {getMessageTypeIcon(msg.type)}
                          <span className="capitalize">{msg.type.replace(/_/g, " ")}</span>
                        </Badge>
                      </div>

                      {msg.type === "text" && <p className="text-base text-foreground">{msg.content.body}</p>}
                      {msg.type === "image_bundle" && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
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
                            <span className="font-medium">Button:</span> {msg.content.action.button}
                          </p>
                          <p>
                            <span className="font-medium">Body:</span> {msg.content.body.text}
                          </p>
                          {msg.content.action.sections[0]?.rows.length > 0 && (
                            <div className="mt-2">
                              <p className="font-medium">List Rows:</p>
                              <ul className="list-disc list-inside ml-4 text-base">
                                {msg.content.action.sections[0].rows.map((row, rowIndex) => (
                                  <li key={rowIndex} className="mb-1">
                                    <span className="font-semibold">{row.title}</span> (ID: {row.id})
                                    {row.description && (
                                      <span className="text-muted-foreground">: {row.description}</span>
                                    )}
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
                            <span className="font-medium">Body:</span> {msg.content.bodyText}
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
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
