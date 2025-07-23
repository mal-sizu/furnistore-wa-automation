"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Button from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  PlusCircle,
  XCircle,
  MessageSquare,
  ImageIcon,
  List,
  Radio,
  Pencil,
  GripVertical,
  Check,
  ChevronsUpDown,
  Cloud,
} from "lucide-react"
import type { CatalogueItem, CatalogueMessageType } from "@/types/catalogue"
import type { Image, ListRow, InteractiveList, ReplyButton, InteractiveReplyButtons } from "@/types/whatsapp"
import { Separator } from "@/components/ui/separator"
import ImageComponent from "next/image"
import { Badge } from "@/components/ui/badge"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { GoogleDrivePicker } from "./google-drive-picker"
import { useGoogleDriveStore } from "@/store/google-drive-store"

interface CatalogueFormProps {
  onAddItem: (item: CatalogueItem) => void
  onClose: () => void
  initialData?: CatalogueItem | null
  availableTitles: string[]
}

// Helper function to generate ID from title
const generateIdFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
}

export function CatalogueForm({ onAddItem, onClose, initialData, availableTitles }: CatalogueFormProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [messages, setMessages] = useState<CatalogueMessageType[]>(initialData?.messages || [])
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null)

  const [currentMessageType, setCurrentMessageType] = useState<
    "text" | "image_bundle" | "interactive_list" | "interactive_buttons" | ""
  >("")

  // State for Text Message
  const [textBody, setTextBody] = useState("")

  // State for Image Bundle
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null)
  const [currentImagePreviewUrl, setCurrentImagePreviewUrl] = useState<string | null>(null)
  const [currentImageCaption, setCurrentImageCaption] = useState("")
  const [isGoogleDrivePickerOpen, setIsGoogleDrivePickerOpen] = useState(false)
  const [currentImageBundle, setCurrentImageBundle] = useState<Image[]>([])

  // Zustand state for Google Drive selection
  const selectedGoogleDriveFile = useGoogleDriveStore((state) => state.selectedFile)
  const clearGoogleDriveSelection = useGoogleDriveStore((state) => state.clearSelection)

  // State for Interactive List
  const [listHeader, setListHeader] = useState("")
  const [listBody, setListBody] = useState("")
  const [listButton, setListButton] = useState("")
  const [currentListRowId, setCurrentListRowId] = useState("")
  const [currentListRowTitle, setCurrentListRowTitle] = useState("")
  const [currentListRowDescription, setCurrentListRowDescription] = useState("")
  const [currentListRows, setCurrentListRows] = useState<ListRow[]>([])

  // State for Interactive Buttons
  const [buttonBodyText, setButtonBodyText] = useState("")
  const [currentButtonId, setCurrentButtonId] = useState("")
  const [currentButtonTitle, setCurrentButtonTitle] = useState("")
  const [currentButtons, setCurrentButtons] = useState<ReplyButton[]>([])

  // State for Combobox
  const [openCombobox, setOpenCombobox] = useState(false)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description || "")
      setMessages(initialData.messages)
    } else {
      setName("")
      setDescription("")
      setMessages([])
    }
    resetCurrentMessageStates()
    setEditingMessageIndex(null)
  }, [initialData])

  // Effect to update image preview when a Google Drive file is selected
  useEffect(() => {
    if (selectedGoogleDriveFile) {
      setCurrentImagePreviewUrl(selectedGoogleDriveFile.url)
      setCurrentImageCaption(selectedGoogleDriveFile.name.split(".")[0] || "") // Use file name as default caption
      setCurrentImageFile(null) // Clear local file selection
    }
  }, [selectedGoogleDriveFile])

  const resetCurrentMessageStates = () => {
    setCurrentMessageType("")
    setTextBody("")
    setCurrentImageFile(null)
    setCurrentImagePreviewUrl(null)
    setCurrentImageCaption("")
    setCurrentImageBundle([])
    clearGoogleDriveSelection() // Clear Zustand selection
    setListHeader("")
    setListBody("")
    setListButton("")
    setCurrentListRowId("")
    setCurrentListRowTitle("")
    setCurrentListRowDescription("")
    setCurrentListRows([])
    setButtonBodyText("")
    setCurrentButtonId("")
    setCurrentButtonTitle("")
    setCurrentButtons([])
  }

  const loadMessageForEdit = (message: CatalogueMessageType, index: number) => {
    resetCurrentMessageStates()
    setEditingMessageIndex(index)
    setCurrentMessageType(message.type)

    switch (message.type) {
      case "text":
        setTextBody(message.content.body)
        break
      case "image_bundle":
        setCurrentImageBundle(message.content)
        break
      case "interactive_list":
        setListHeader(message.content.header?.text || "")
        setListBody(message.content.body.text)
        setListButton(message.content.action.button)
        setCurrentListRows(message.content.action.sections[0]?.rows || [])
        break
      case "interactive_buttons":
        setButtonBodyText(message.content.bodyText)
        setCurrentButtons(message.content.buttons)
        break
      default:
        break
    }
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, indexToReplace?: number) => {
    const file = e.target.files?.[0]
    if (file) {
      clearGoogleDriveSelection() // Clear GDrive selection if local file is chosen
      const reader = new FileReader()
      reader.onloadend = () => {
        const newUrl = `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(file.name || "uploaded_image")}`
        if (indexToReplace !== undefined) {
          setCurrentImageBundle((prev) =>
            prev.map((img, idx) =>
              idx === indexToReplace ? { ...img, url: newUrl, caption: img.caption || "" } : img,
            ),
          )
        } else {
          setCurrentImageFile(file)
          setCurrentImagePreviewUrl(reader.result as string)
          setCurrentImageCaption(file.name.split(".")[0] || "") // Set caption from file name
        }
      }
      reader.readAsDataURL(file)
    } else {
      if (indexToReplace === undefined) {
        setCurrentImageFile(null)
        setCurrentImagePreviewUrl(null)
        setCurrentImageCaption("")
      }
    }
  }

  const handleImageCaptionChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newCaption = e.target.value
    setCurrentImageBundle((prev) => prev.map((img, idx) => (idx === index ? { ...img, caption: newCaption } : img)))
  }

  const handleAddImageToBundle = () => {
    let imageUrl: string | null = null
    let imageCaption: string = currentImageCaption.trim()

    if (selectedGoogleDriveFile) {
      imageUrl = selectedGoogleDriveFile.url // Use the direct Google Drive URL
      imageCaption = imageCaption || selectedGoogleDriveFile.name.split(".")[0] || ""
    } else if (currentImageFile) {
      // For local files, we still use a placeholder URL for now
      imageUrl = `/placeholder.svg?height=300&width=400&query=${encodeURIComponent(currentImageFile.name || "uploaded_image")}`
      imageCaption = imageCaption || currentImageFile.name.split(".")[0] || ""
    }

    if (imageUrl) {
      setCurrentImageBundle((prev) => [...prev, { url: imageUrl, caption: imageCaption }])
      setCurrentImageFile(null)
      setCurrentImagePreviewUrl(null)
      setCurrentImageCaption("")
      clearGoogleDriveSelection() // Clear Zustand selection after adding
      const fileInput = document.getElementById("image-file") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    }
  }

  const handleRemoveImageFromBundle = (index: number) => {
    setCurrentImageBundle((prev) => prev.filter((_, i) => i !== index))
  }

  const handleListRowChange = (index: number, field: keyof ListRow, value: string) => {
    setCurrentListRows((prev) =>
      prev.map((row, idx) => {
        if (idx === index) {
          const updatedRow = { ...row, [field]: value }
          if (field === "title") {
            if (!row.id || generateIdFromTitle(row.title) === row.id) {
              updatedRow.id = generateIdFromTitle(value)
            }
          }
          return updatedRow
        }
        return row
      }),
    )
  }

  const handleAddListRow = () => {
    if (currentListRowTitle.trim()) {
      setCurrentListRows((prev) => [
        ...prev,
        {
          id: currentListRowId.trim() || generateIdFromTitle(currentListRowTitle.trim()),
          title: currentListRowTitle.trim(),
          description: currentListRowDescription.trim() || undefined,
        },
      ])
      setCurrentListRowId("")
      setCurrentListRowTitle("")
      setCurrentListRowDescription("")
    }
  }

  const handleRemoveListRow = (index: number) => {
    setCurrentListRows((prev) => prev.filter((_, i) => i !== index))
  }

  const handleButtonChange = (index: number, field: keyof ReplyButton, value: string) => {
    setCurrentButtons((prev) =>
      prev.map((btn, idx) => {
        if (idx === index) {
          const updatedButton = { ...btn, [field]: value }
          if (field === "title") {
            if (!btn.id || generateIdFromTitle(btn.title) === btn.id) {
              updatedButton.id = generateIdFromTitle(value)
            }
          }
          return updatedButton
        }
        return btn
      }),
    )
  }

  const handleAddButton = () => {
    if (currentButtonTitle.trim()) {
      setCurrentButtons((prev) => [
        ...prev,
        {
          id: currentButtonId.trim() || generateIdFromTitle(currentButtonTitle.trim()),
          title: currentButtonTitle.trim(),
        },
      ])
      setCurrentButtonId("")
      setCurrentButtonTitle("")
    }
  }

  const handleRemoveButton = (index: number) => {
    setCurrentButtons((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAddOrUpdateMessage = () => {
    let newMessage: CatalogueMessageType | null = null

    if (currentMessageType === "text" && textBody.trim()) {
      newMessage = { type: "text", content: { body: textBody.trim() } }
    } else if (currentMessageType === "image_bundle" && currentImageBundle.length > 0) {
      newMessage = { type: "image_bundle", content: currentImageBundle }
    } else if (
      currentMessageType === "interactive_list" &&
      listButton.trim() &&
      listBody.trim() &&
      currentListRows.length > 0
    ) {
      const interactiveList: InteractiveList = {
        type: "list",
        header: { type: "text", text: listHeader.trim() || "Select an Option" },
        body: { text: listBody.trim() },
        action: {
          button: listButton.trim(),
          sections: [{ rows: currentListRows }],
        },
      }
      newMessage = { type: "interactive_list", content: interactiveList }
    } else if (currentMessageType === "interactive_buttons" && buttonBodyText.trim() && currentButtons.length > 0) {
      const interactiveButtons: InteractiveReplyButtons = {
        bodyText: buttonBodyText.trim(),
        buttons: currentButtons,
      }
      newMessage = { type: "interactive_buttons", content: interactiveButtons }
    }

    if (newMessage) {
      setMessages((prev) => {
        if (editingMessageIndex !== null) {
          const updatedMessages = [...prev]
          updatedMessages[editingMessageIndex] = newMessage
          return updatedMessages
        } else {
          return [...prev, newMessage]
        }
      })
      resetCurrentMessageStates()
      setEditingMessageIndex(null)
    }
  }

  const handleRemoveMessage = (index: number) => {
    setMessages((prev) => prev.filter((_, i) => i !== index))
    if (editingMessageIndex === index) {
      resetCurrentMessageStates()
      setEditingMessageIndex(null)
    } else if (editingMessageIndex !== null && editingMessageIndex > index) {
      setEditingMessageIndex(editingMessageIndex - 1)
    }
  }

  const handleCancelEdit = () => {
    resetCurrentMessageStates()
    setEditingMessageIndex(null)
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const reorderedMessages = Array.from(messages)
    const [removed] = reorderedMessages.splice(result.source.index, 1)
    reorderedMessages.splice(result.destination.index, 0, removed)

    if (editingMessageIndex !== null) {
      if (result.source.index === editingMessageIndex) {
        setEditingMessageIndex(result.destination.index)
      } else if (result.source.index < editingMessageIndex && result.destination.index >= editingMessageIndex) {
        setEditingMessageIndex(editingMessageIndex - 1)
      } else if (result.source.index > editingMessageIndex && result.destination.index <= editingMessageIndex) {
        setEditingMessageIndex(editingMessageIndex + 1)
      }
    }

    setMessages(reorderedMessages)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && messages.length > 0) {
      const newItem: CatalogueItem = {
        id: initialData?.id || "",
        name: name.trim(),
        description: description.trim() || undefined,
        messages: messages,
      }
      onAddItem(newItem)
    }
  }

  const getMessageTypeIcon = (type: CatalogueMessageType["type"]) => {
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
    <Card className="w-full max-w-2xl mx-auto shadow-none border-none">
      <CardHeader className="border-b pb-4 px-0">
        <CardTitle className="text-3xl font-extrabold text-center">
          {initialData ? "Edit Catalog Item" : "Create New Catalog Item"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 px-0">
        <form onSubmit={handleSubmit} className="grid gap-8">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-lg font-semibold">
                Catalog Item Name
              </Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between p-3 text-base bg-transparent"
                  >
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Welcome Flow, Product Inquiry"
                      required
                      className="border-none p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      onClick={() => setOpenCombobox(true)}
                    />
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search titles..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No title found.</CommandEmpty>
                      <CommandGroup>
                        {availableTitles.map((title) => (
                          <CommandItem
                            key={title}
                            value={title}
                            onSelect={(currentValue) => {
                              setName(currentValue)
                              setOpenCombobox(false)
                            }}
                          >
                            {title}
                            <Check className={cn("ml-auto h-4 w-4", name === title ? "opacity-100" : "opacity-0")} />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-lg font-semibold">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of this catalog item's purpose."
                className="p-3 text-base min-h-[80px]"
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-6">
            <h2 className="text-xl font-bold">Messages in this Catalog Item</h2>
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No messages added yet. Add one below!</p>
            ) : (
              <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="messages">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="grid gap-4">
                      {messages.map((msg, index) => (
                        <Draggable key={index.toString()} draggableId={index.toString()} index={index}>
                          {(provided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                opacity: snapshot.isDragging ? 0.8 : 1,
                                background: snapshot.isDragging ? "hsl(var(--muted))" : "hsl(var(--card))",
                                borderLeftColor:
                                  editingMessageIndex === index ? "hsl(var(--blue-500))" : "hsl(var(--primary)/0.6)",
                              }}
                              className={`relative p-4 border-l-4 cursor-pointer transition-all duration-200 ${
                                editingMessageIndex === index
                                  ? "border-blue-500 shadow-md"
                                  : "border-primary/60 hover:shadow-sm"
                              }`}
                              onClick={() => loadMessageForEdit(msg, index)}
                            >
                              <div
                                {...provided.dragHandleProps}
                                className="absolute top-2 left-2 cursor-grab text-muted-foreground hover:text-foreground"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-red-500 hover:bg-red-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleRemoveMessage(index)
                                }}
                              >
                                <XCircle className="h-5 w-5" />
                                <span className="sr-only">Remove message</span>
                              </Button>
                              <div className="flex items-center gap-2 mb-2 ml-8">
                                {" "}
                                {getMessageTypeIcon(msg.type)}
                                <h4 className="font-semibold capitalize text-lg">
                                  {msg.type.replace(/_/g, " ")} Message
                                </h4>
                                {editingMessageIndex === index && (
                                  <Badge variant="outline" className="ml-auto bg-blue-100 text-blue-700">
                                    Editing
                                  </Badge>
                                )}
                              </div>
                              {msg.type === "text" && (
                                <p className="text-sm text-muted-foreground line-clamp-2 ml-8">
                                  Body: {msg.content.body}
                                </p>
                              )}
                              {msg.type === "image_bundle" && (
                                <p className="text-sm text-muted-foreground ml-8">Images: {msg.content.length}</p>
                              )}
                              {msg.type === "interactive_list" && (
                                <p className="text-sm text-muted-foreground line-clamp-2 ml-8">
                                  Button: {msg.content.action.button}, Rows:{" "}
                                  {msg.content.action.sections[0]?.rows.length || 0}
                                </p>
                              )}
                              {msg.type === "interactive_buttons" && (
                                <p className="text-sm text-muted-foreground line-clamp-2 ml-8">
                                  Body: {msg.content.bodyText}, Buttons: {msg.content.buttons.length}
                                </p>
                              )}
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            )}

            <Separator />

            <Card className="p-6 bg-muted/20 border-dashed border-2">
              <h3 className="text-xl font-bold mb-4">
                {editingMessageIndex !== null ? "Edit Selected Message" : "Add New Message"}
              </h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="message-type" className="font-medium">
                    Select Message Type
                  </Label>
                  <Select
                    value={currentMessageType}
                    onValueChange={(value: any) => {
                      resetCurrentMessageStates()
                      setCurrentMessageType(value)
                    }}
                    disabled={editingMessageIndex !== null}
                  >
                    <SelectTrigger id="message-type" className="p-3 text-base">
                      <SelectValue placeholder="Choose a message type to add" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text Message</SelectItem>
                      <SelectItem value="image_bundle">Image Bundle</SelectItem>
                      <SelectItem value="interactive_list">Interactive List</SelectItem>
                      <SelectItem value="interactive_buttons">Interactive Reply Buttons</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {currentMessageType === "text" && (
                  <div className="grid gap-4 p-4 border rounded-md bg-background">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" /> Text Message Content
                    </h4>
                    <div className="grid gap-2">
                      <Label htmlFor="text-body">Text Body</Label>
                      <Textarea
                        id="text-body"
                        value={textBody}
                        onChange={(e) => setTextBody(e.target.value)}
                        placeholder="Enter the text message content"
                        required
                        className="min-h-[100px]"
                      />
                    </div>
                    <Button type="button" onClick={handleAddOrUpdateMessage}>
                      <PlusCircle className="mr-2 h-4 w-4" />{" "}
                      {editingMessageIndex !== null ? "Update Text Message" : "Add Text Message"}
                    </Button>
                  </div>
                )}

                {currentMessageType === "image_bundle" && (
                  <div className="grid gap-4 p-4 border rounded-md bg-background">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" /> Image Bundle
                    </h4>
                    {currentImageBundle.length > 0 && (
                      <div className="grid gap-4">
                        <p className="text-sm font-medium">Images in bundle:</p>
                        {currentImageBundle.map((img, index) => (
                          <div key={index} className="flex flex-col gap-2 bg-muted/30 p-3 rounded-md">
                            <div className="flex items-center gap-2">
                              <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border">
                                <ImageComponent
                                  src={img.url || "/placeholder.svg"}
                                  alt={img.caption || "Bundled Image"}
                                  fill
                                  objectFit="cover"
                                  className="rounded-md"
                                />
                              </div>
                              <div className="grid flex-1 gap-1">
                                <Label htmlFor={`image-caption-${index}`} className="sr-only">
                                  Image Caption
                                </Label>
                                <Input
                                  id={`image-caption-${index}`}
                                  value={img.caption || ""}
                                  onChange={(e) => handleImageCaptionChange(e, index)}
                                  placeholder="Image Caption"
                                />
                                <Label htmlFor={`image-replace-${index}`} className="sr-only">
                                  Replace Image
                                </Label>
                                <Input
                                  id={`image-replace-${index}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageFileChange(e, index)}
                                  className="p-2 text-sm"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveImageFromBundle(index)}
                              >
                                <XCircle className="h-5 w-5 text-red-500" />
                                <span className="sr-only">Remove image from bundle</span>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Separator />
                    <h5 className="font-semibold text-md">Add New Image to Bundle</h5>
                    <div className="grid gap-2">
                      <Label htmlFor="image-file">Upload Image File</Label>
                      <div className="flex gap-2">
                        <Input
                          id="image-file"
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="p-2 flex-1"
                        />
                        <Button type="button" variant="outline" onClick={() => setIsGoogleDrivePickerOpen(true)}>
                          <Cloud className="mr-2 h-4 w-4" /> GDrive
                        </Button>
                      </div>
                      {currentImagePreviewUrl && (
                        <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden border">
                          <ImageComponent
                            src={currentImagePreviewUrl || "/placeholder.svg"}
                            alt="Image Preview"
                            fill
                            objectFit="contain"
                            className="rounded-md"
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image-caption">Image Caption (Optional)</Label>
                      <Input
                        id="image-caption"
                        value={currentImageCaption}
                        onChange={(e) => setCurrentImageCaption(e.target.value)}
                        placeholder="A short description for the image"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddImageToBundle}
                      variant="outline"
                      disabled={!currentImageFile && !selectedGoogleDriveFile}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Image to Bundle
                    </Button>
                    <Button type="button" onClick={handleAddOrUpdateMessage} disabled={currentImageBundle.length === 0}>
                      <PlusCircle className="mr-2 h-4 w-4" />{" "}
                      {editingMessageIndex !== null ? "Update Image Bundle Message" : "Add Image Bundle Message"}
                    </Button>
                  </div>
                )}

                {currentMessageType === "interactive_list" && (
                  <div className="grid gap-4 p-4 border rounded-md bg-background">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <List className="h-5 w-5" /> Interactive List Content
                    </h4>
                    <div className="grid gap-2">
                      <Label htmlFor="list-header">Header Text (Optional)</Label>
                      <Input
                        id="list-header"
                        value={listHeader}
                        onChange={(e) => setListHeader(e.target.value)}
                        placeholder="e.g., Our Services"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="list-body">Body Text</Label>
                      <Textarea
                        id="list-body"
                        value={listBody}
                        onChange={(e) => setListBody(e.target.value)}
                        placeholder="Please select an option from the list below."
                        required
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="list-button">Button Text</Label>
                      <Input
                        id="list-button"
                        value={listButton}
                        onChange={(e) => setListButton(e.target.value)}
                        placeholder="e.g., View Options"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>List Rows</Label>
                      {currentListRows.length > 0 && (
                        <div className="grid gap-2">
                          {currentListRows.map((row, index) => (
                            <div key={index} className="flex flex-col gap-2 bg-muted/30 p-3 rounded-md">
                              <div className="flex items-center gap-2">
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-sm flex-1">Row {index + 1}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveListRow(index)}
                                >
                                  <XCircle className="h-5 w-5 text-red-500" />
                                  <span className="sr-only">Remove row</span>
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <Input
                                  value={row.id}
                                  onChange={(e) => handleListRowChange(index, "id", e.target.value)}
                                  placeholder="Row ID (unique)"
                                />
                                <Input
                                  value={row.title}
                                  onChange={(e) => handleListRowChange(index, "title", e.target.value)}
                                  placeholder="Row Title"
                                  maxLength={20}
                                />
                                <Input
                                  value={row.description || ""}
                                  onChange={(e) => handleListRowChange(index, "description", e.target.value)}
                                  placeholder="Row Description (Optional)"
                                  maxLength={72}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Separator />
                      <h5 className="font-semibold text-md">Add New List Row</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Input
                          value={currentListRowId}
                          onChange={(e) => setCurrentListRowId(e.target.value)}
                          placeholder="Row ID (auto-generated)"
                          onBlur={(e) => {
                            if (!e.target.value.trim() && currentListRowTitle.trim()) {
                              setCurrentListRowId(generateIdFromTitle(currentListRowTitle.trim()))
                            }
                          }}
                        />
                        <Input
                          value={currentListRowTitle}
                          onChange={(e) => {
                            setCurrentListRowTitle(e.target.value)
                            if (!currentListRowId.trim()) {
                              setCurrentListRowId(generateIdFromTitle(e.target.value))
                            }
                          }}
                          placeholder="Row Title"
                          maxLength={20}
                        />
                        <Input
                          value={currentListRowDescription}
                          onChange={(e) => setCurrentListRowDescription(e.target.value)}
                          placeholder="Row Description (Optional)"
                          maxLength={72}
                        />
                      </div>
                      <Button type="button" onClick={handleAddListRow} variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add List Row
                      </Button>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddOrUpdateMessage}
                      disabled={!listButton || !listBody || currentListRows.length === 0}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />{" "}
                      {editingMessageIndex !== null
                        ? "Update Interactive List Message"
                        : "Add Interactive List Message"}
                    </Button>
                  </div>
                )}

                {currentMessageType === "interactive_buttons" && (
                  <div className="grid gap-4 p-4 border rounded-md bg-background">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <Radio className="h-5 w-5" /> Interactive Reply Buttons Content
                    </h4>
                    <div className="grid gap-2">
                      <Label htmlFor="button-body-text">Body Text</Label>
                      <Textarea
                        id="button-body-text"
                        value={buttonBodyText}
                        onChange={(e) => setButtonBodyText(e.target.value)}
                        placeholder="Choose an option below."
                        required
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Buttons</Label>
                      {currentButtons.length > 0 && (
                        <div className="grid gap-2">
                          {currentButtons.map((btn, index) => (
                            <div key={index} className="flex flex-col gap-2 bg-muted/30 p-3 rounded-md">
                              <div className="flex items-center gap-2">
                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold text-sm flex-1">Button {index + 1}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveButton(index)}
                                >
                                  <XCircle className="h-5 w-5 text-red-500" />
                                  <span className="sr-only">Remove button</span>
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <Input
                                  value={btn.id}
                                  onChange={(e) => handleButtonChange(index, "id", e.target.value)}
                                  placeholder="Button ID (unique)"
                                />
                                <Input
                                  value={btn.title}
                                  onChange={(e) => handleButtonChange(index, "title", e.target.value)}
                                  placeholder="Button Title"
                                  maxLength={20}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <Separator />
                      <h5 className="font-semibold text-md">Add New Button</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <Input
                          value={currentButtonId}
                          onChange={(e) => setCurrentButtonId(e.target.value)}
                          placeholder="Button ID (auto-generated)"
                          onBlur={(e) => {
                            if (!e.target.value.trim() && currentButtonTitle.trim()) {
                              setCurrentButtonId(generateIdFromTitle(currentButtonTitle.trim()))
                            }
                          }}
                        />
                        <Input
                          value={currentButtonTitle}
                          onChange={(e) => {
                            setCurrentButtonTitle(e.target.value)
                            if (!currentButtonId.trim()) {
                              setCurrentButtonId(generateIdFromTitle(e.target.value))
                            }
                          }}
                          placeholder="Button Title"
                          maxLength={20}
                        />
                      </div>
                      <Button type="button" onClick={handleAddButton} variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Button
                      </Button>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddOrUpdateMessage}
                      disabled={!buttonBodyText || currentButtons.length === 0}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />{" "}
                      {editingMessageIndex !== null
                        ? "Update Interactive Buttons Message"
                        : "Add Interactive Buttons Message"}
                    </Button>
                  </div>
                )}
                {editingMessageIndex !== null && (
                  <Button type="button" variant="secondary" onClick={handleCancelEdit}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </Card>
          </div>

          <Button type="submit" className="w-full py-3 text-lg font-semibold" disabled={!name || messages.length === 0}>
            {initialData ? "Update Catalog Item" : "Save Catalog Item"}
          </Button>
        </form>
      </CardContent>
      <GoogleDrivePicker isOpen={isGoogleDrivePickerOpen} onClose={() => setIsGoogleDrivePickerOpen(false)} />
    </Card>
  )
}
