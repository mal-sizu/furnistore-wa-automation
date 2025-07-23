import type { Image, InteractiveList, InteractiveReplyButtons, TextMessage } from "./whatsapp"

export type CatalogueMessageType =
  | { type: "text"; content: TextMessage }
  | { type: "image_bundle"; content: Image[] }
  | { type: "interactive_list"; content: InteractiveList }
  | { type: "interactive_buttons"; content: InteractiveReplyButtons }

export interface CatalogueItem {
  id: string
  name: string
  description?: string
  messages: CatalogueMessageType[]
}

export type CatalogueData = CatalogueItem[]
