// src/types/index.ts (from attachment, modified)

// ======================
// Core WhatsApp Payload Types
// ======================
export interface WhatsAppBasePayload {
  messaging_product: "whatsapp"
  to: string
}

// ======================
// Interactive List Types
// ======================
export interface ListRow {
  id: string
  title: string
  description?: string
}

export interface ListSection {
  rows: ListRow[]
}

export interface ListAction {
  button: string
  sections: ListSection[]
}

export interface ListHeader {
  type: "text"
  text: string
}

export interface ListBody {
  text: string
}

export interface InteractiveList {
  type: "list"
  header: ListHeader
  body: ListBody
  action: ListAction
}

export interface InteractiveListPayload extends WhatsAppBasePayload {
  type: "interactive"
  interactive: InteractiveList
}

export type ListTemplates = {
  [key: string]: InteractiveList
}

// ======================
// Reply Button Types
// ======================
export interface ReplyButton {
  id: string
  title: string
}

export interface InteractiveReplyButtons {
  bodyText: string
  buttons: ReplyButton[]
}

export interface InteractiveReplyButtonsPayload extends WhatsAppBasePayload {
  type: "interactive"
  interactive: {
    type: "button"
    body: {
      text: string
    }
    action: {
      buttons: Array<{
        type: "reply"
        reply: ReplyButton
      }>
    }
  }
}

export type ButtonSets = {
  [key: string]: InteractiveReplyButtons
}

// ======================
// Text Message Types
// ======================
export interface TextMessage {
  body: string
}

export interface TextMessagePayload extends WhatsAppBasePayload {
  type: "text"
  text: {
    body: string
  }
}

export type MessageTemplates = {
  [key: string]: TextMessage
}

// ======================
// Image Message Types
// ======================
export interface Image {
  url: string
  caption: string
}

export interface ImagePayload extends WhatsAppBasePayload {
  type: "image"
  image: {
    link: string
    caption?: string
  }
}

export type ImageBundle = Image[]
export type ImageBundles = {
  [key: string]: ImageBundle
}

// ======================
// Interactive Flow Types
// ======================
export interface InteractiveFlowPayload {
  headerText?: string
  bodyText: string
  footerText?: string
  flowId: string
  flowCta: string
  screenId: string
  initialData?: Record<string, any>
}

// FIX: Made header/footer truly optional
export interface InteractiveFlowMessagePayload extends WhatsAppBasePayload {
  type: "interactive"
  interactive: {
    type: "flow"
    header?: {
      type: "text"
      text: string
    } | null
    body: {
      text: string
    }
    footer?: {
      text: string
    } | null
    action: {
      name: "flow"
      parameters: {
        flow_message_version: string
        flow_token: string
        flow_id: string
        flow_cta: string
        flow_action: "navigate"
        flow_action_payload: {
          screen: string
          data?: Record<string, any>
        }
      }
    }
  }
}

export type FlowTemplates = {
  [key: string]: InteractiveFlowPayload
}

// ======================
// Address Message Types
// ======================
export interface AddressParameters {
  country?: string
  state?: string
  city?: string
  street?: string
  zip?: string
}

export interface InteractiveAddress {
  bodyText: string
  addressParams: AddressParameters
  footerText?: string
}

export interface InteractiveAddressPayload extends WhatsAppBasePayload {
  type: "interactive"
  interactive: {
    type: "address"
    body: {
      text: string
    }
    action: {
      name: "address"
      parameters: AddressParameters
    }
    footer?: {
      text: string
    }
  }
}

// ======================
// Audio Message Types
// ======================
export interface AudioMessagePreset {
  url: string
}

export interface AudioPayload extends WhatsAppBasePayload {
  type: "audio"
  audio: {
    id?: string // For media ID
    link?: string // For public URL
  }
}

// ======================
// Contact Message Types
// ======================
export interface ContactName {
  formatted_name: string
  first_name?: string
  last_name?: string
  middle_name?: string
  suffix?: string
  prefix?: string
}

export interface ContactPhone {
  phone: string
  type?: "CELL" | "MAIN" | "IPHONE" | "HOME" | "WORK"
  wa_id?: string
}

export interface ContactEmail {
  email?: string
  type?: "WORK" | "HOME"
}

export interface ContactUrl {
  url?: string
  type?: "WORK" | "HOME"
}

export interface ContactAddress {
  street?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  country_code?: string
  type?: "WORK" | "HOME"
}

export interface ContactOrg {
  company?: string
  department?: string
  title?: string
}

export interface Contact {
  name: ContactName
  phones?: ContactPhone[]
  emails?: ContactEmail[]
  urls?: ContactUrl[]
  addresses?: ContactAddress[]
  org?: ContactOrg
  birthday?: string // YYYY-MM-DD
}

export interface ContactsPayload extends WhatsAppBasePayload {
  type: "contacts"
  contacts: Contact[]
}

export interface ContactMessagePreset {
  contacts: Contact[]
}

// ======================
// Document Message Types
// ======================
export interface DocumentMessagePreset {
  url: string
  caption?: string
  fileName?: string
}

export interface DocumentPayload extends WhatsAppBasePayload {
  type: "document"
  document: {
    id?: string // For media ID
    link?: string // For public URL
    caption?: string
    filename?: string
  }
}

// ======================
// Location Request Message Types
// ======================
export interface LocationRequestMessagePreset {
  bodyText: string
}

export interface LocationRequestMessage {
  type: "location_request_message"
  body: {
    text: string
  }
  action: {
    name: "send_location"
  }
}

export interface LocationRequestPayload extends WhatsAppBasePayload {
  type: "interactive"
  interactive: LocationRequestMessage
}

// ======================
// Location Message Types
// ======================
export interface LocationMessagePreset {
  longitude: number
  latitude: number
  name?: string
  address?: string
}

export interface LocationPayload extends WhatsAppBasePayload {
  type: "location"
  location: Location
}

// ======================
// Video Message Types
// ======================
export interface VideoMessagePreset {
  url: string
  caption?: string
}

export interface VideoPayload extends WhatsAppBasePayload {
  type: "video"
  video: {
    link: string // Public URL
    caption?: string
  }
}

// ======================
// Unified Preset Types for UI
// ======================
export type MessagePresetType =
  | "text"
  | "address"
  | "audio"
  | "contacts"
  | "document"
  | "image"
  | "url_buttons" // For Interactive Call-to-Action URL Button Messages
  | "flow"
  | "list"
  | "location_request"
  | "reply_buttons"
  | "location"
  | "video"

export interface Preset<T = any> {
  id: string
  type: MessagePresetType
  data: T
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

export interface InteractiveUrlButtonsPreset {
  bodyText: string
  buttons: { title: string; url: string }[]
}

// Mapping for data loading
export type AllPresets = {
  text: { [key: string]: TextMessage & { createdAt?: string; updatedAt?: string } }
  address: { [key: string]: InteractiveAddress & { createdAt?: string; updatedAt?: string } }
  audio: { [key: string]: AudioMessagePreset & { createdAt?: string; updatedAt?: string } }
  contacts: { [key: string]: ContactMessagePreset & { createdAt?: string; updatedAt?: string } }
  document: { [key: string]: DocumentMessagePreset & { createdAt?: string; updatedAt?: string } }
  image: { [key: string]: ImageBundle & { createdAt?: string; updatedAt?: string } }
  url_buttons: { [key: string]: InteractiveUrlButtonsPreset & { createdAt?: string; updatedAt?: string } }
  flow: { [key: string]: InteractiveFlowPayload & { createdAt?: string; updatedAt?: string } }
  list: { [key: string]: InteractiveList & { createdAt?: string; updatedAt?: string } }
  location_request: { [key: string]: LocationRequestMessagePreset & { createdAt?: string; updatedAt?: string } }
  reply_buttons: { [key: string]: InteractiveReplyButtons & { createdAt?: string; updatedAt?: string } }
  location: { [key: string]: LocationMessagePreset & { createdAt?: string; updatedAt?: string } }
  video: { [key: string]: VideoMessagePreset & { createdAt?: string; updatedAt?: string } }
}

// ======================
// Flow Builder Types (Adapted for ReactFlow)
// ======================
import type { Node, Edge } from "reactflow"

export interface FlowNodeData {
  presetId: string
  presetType: MessagePresetType
  label: string // For ReactFlow's default node label
}

export interface FlowEdgeData {
  condition: string
  sourcePreset?: Preset // To pass source preset data to EdgeEditor
}

// Re-export ReactFlow's Node and Edge types with our custom data
export type CustomFlowNode = Node<FlowNodeData>
export type CustomFlowEdge = Edge<FlowEdgeData>

export interface Flow {
  nodes: CustomFlowNode[]
  edges: CustomFlowEdge[]
}
